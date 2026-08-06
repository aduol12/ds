import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { SensorData } from '../assets/entities/sensor-data.entity';
import { CreateDataDto, ValveState } from '../assets/dto/create-data.dto';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(SensorData)
    private readonly sensorDataRepository: Repository<SensorData>,
    @InjectRepository(IotKit)
    private readonly iotKitRepository: Repository<IotKit>,
  ) {}

  private async assertKitAccess(kit_id: string, userId: string, role?: Role) {
    if (isStaffRole(role)) {
      const kit = await this.iotKitRepository.findOneBy({ kit_id });
      if (!kit) throw new NotFoundException('Kit not found');
      return kit;
    }
    const kit = await this.iotKitRepository.findOneBy({ kit_id, farmer_id: userId });
    if (!kit) throw new NotFoundException('Kit not found');
    return kit;
  }

  async create(createDataDto: CreateDataDto): Promise<SensorData> {
    const { kit_id, valve, timestamp, ...sensorDataPayload } = createDataDto;

    if (valve) {
      const kit = await this.iotKitRepository.findOneBy({ kit_id });
      if (!kit) {
        throw new NotFoundException(`Kit with ID ${kit_id} not found`);
      }
      kit.is_irrigating = valve === ValveState.OPEN;
      await this.iotKitRepository.save(kit);
    }

    let finalTimestamp = timestamp;
    const currentTimeGmt = new Date(new Date().toUTCString());
    const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

    if (
      !finalTimestamp ||
      Math.abs(currentTimeGmt.getTime() - finalTimestamp.getTime()) >
        TEN_MINUTES_IN_MS
    ) {
      finalTimestamp = currentTimeGmt;
    }

    const newData = this.sensorDataRepository.create({
      kit_id,
      timestamp: finalTimestamp,
      ...sensorDataPayload,
    });
    return this.sensorDataRepository.save(newData);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: SensorData[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.sensorDataRepository.findAndCount({
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findLatest(
    kit_id: string,
    farmer_id: string,
    role?: Role,
  ): Promise<SensorData> {
    await this.assertKitAccess(kit_id, farmer_id, role);

    const data = await this.sensorDataRepository.findOne({
      where: { kit_id },
      order: { timestamp: 'DESC' },
    });

    if (!data) {
      throw new NotFoundException('No data found for this kit');
    }
    return data;
  }

  async findAllLatest(farmer_id: string, role?: Role): Promise<SensorData[]> {
    const kits = isStaffRole(role)
      ? await this.iotKitRepository.find({ where: { is_active: true } })
      : await this.iotKitRepository.find({
          where: { farmer_id, is_active: true },
        });
    const results: SensorData[] = [];
    for (const kit of kits) {
      const data = await this.sensorDataRepository.findOne({
        where: { kit_id: kit.kit_id },
        order: { timestamp: 'DESC' },
      });
      if (data) results.push(data);
    }
    return results;
  }

  async findHistory(
    kit_id: string,
    farmer_id: string,
    from: Date,
    to: Date,
    role?: Role,
  ): Promise<SensorData[]> {
    await this.assertKitAccess(kit_id, farmer_id, role);

    return this.sensorDataRepository.find({
      where: {
        kit_id,
        timestamp: Between(from, to),
      },
      order: { timestamp: 'ASC' },
    });
  }

  getSummary(farmer_id: string, role?: Role): Promise<any[]> {
    const qb = this.iotKitRepository
      .createQueryBuilder('kit')
      .leftJoinAndSelect('kit.configuration', 'config')
      .leftJoinAndSelect(
        (subQuery) => {
          return subQuery
            .from(SensorData, 'data')
            .select('DISTINCT ON (data.kit_id) *')
            .orderBy('data.kit_id')
            .addOrderBy('data.timestamp', 'DESC');
        },
        'latest_data',
        'latest_data.kit_id = kit.kit_id',
      )
      .andWhere('kit.is_active = :is_active', { is_active: true });

    if (!isStaffRole(role)) {
      qb.andWhere('kit.farmer_id = :farmer_id', { farmer_id });
    }

    return qb.getRawMany();
  }

  async getPendingAnalysis(): Promise<SensorData[]> {
    return this.sensorDataRepository.find({
      where: { advisory: IsNull() },
      order: { timestamp: 'ASC' },
      take: 50,
    });
  }

  async updateAdvisory(dataId: number, advisory: string): Promise<SensorData> {
    const data = await this.sensorDataRepository.findOneBy({ data_id: dataId });
    if (!data) {
      throw new NotFoundException('Data not found');
    }
    data.advisory = advisory;
    return this.sensorDataRepository.save(data);
  }

  async getLatestAdvisory(kitId: string): Promise<SensorData> {
    const data = await this.sensorDataRepository.findOne({
      where: {
        kit_id: kitId,
        advisory: Not(IsNull()),
      },
      order: { timestamp: 'DESC' },
    });

    if (!data) {
      throw new NotFoundException('No advisory found for this kit');
    }
    return data;
  }
}
