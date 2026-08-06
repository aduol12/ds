import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IotKit } from './iot-kit.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sensor_data')
export class SensorData {
  @ApiProperty({ description: 'Unique identifier for the sensor data record' })
  @PrimaryGeneratedColumn()
  data_id: number;

  @ApiProperty({ description: 'ID of the IoT kit associated with this data' })
  @Column()
  kit_id: string;

  @ApiProperty({ description: 'Timestamp when the data was recorded' })
  @Column('timestamp')
  timestamp: Date;

  @ApiProperty({ description: 'Soil moisture level' })
  @Column('decimal')
  moisture: number;

  @ApiProperty({ description: 'Ambient temperature' })
  @Column('decimal')
  temperature: number;

  @ApiProperty({ description: 'Nitrogen level in soil' })
  @Column('decimal')
  nitrogen: number;

  @ApiProperty({ description: 'Phosphorus level in soil' })
  @Column('decimal')
  phosphorus: number;

  @ApiProperty({ description: 'Potassium level in soil' })
  @Column('decimal')
  potassium: number;

  @ApiProperty({ description: 'pH level of the soil' })
  @Column('decimal')
  ph: number;

  @ApiProperty({ description: 'Battery level of the device' })
  @Column('decimal')
  battery: number;

  @ApiProperty({ description: 'Signal strength (RSSI)' })
  @Column('decimal')
  signal: number;

  @ApiProperty({ description: 'Firmware version' })
  @Column('decimal')
  firmware: number;

  @ApiProperty({ description: 'Electrical Conductivity (EC)' })
  @Column('decimal')
  ec: number;

  @ApiProperty({ description: 'Status of the sensor (e.g., true if reporting normal values, false otherwise)', required: false, nullable: true })
  @Column({ type: 'boolean', nullable: true })
  sensor_status_ok: boolean;

  @ApiProperty({ description: 'Advisory decision (e.g. "IRRIGATE")', required: false, nullable: true })
  @Column({ type: 'text', nullable: true })
  advisory: string;

  @ManyToOne(() => IotKit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kit_id', referencedColumnName: 'kit_id' })
  kit: IotKit;
}
