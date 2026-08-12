import { Controller, Get, Post, Body, Put, Param, UseGuards, Request, Query } from '@nestjs/common';
import { IotService } from './iot.service';
import { UpdateControlDto } from '../assets/dto/update-control.dto';
import { CreateDataDto } from '../assets/dto/create-data.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeviceApiKeyGuard } from '../common/guards/device-api-key.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { DataService } from '../data/data.service';
import { UpdateConfigDto } from '../assets/dto/update-config.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { SensorData } from '../assets/entities/sensor-data.entity';
import { RolesGuard } from '../users/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('iot')
@Controller('api/iot')
export class IotController {
  constructor(
    private readonly iotService: IotService,
    private readonly dataService: DataService,
  ) {}

  @ApiOperation({ summary: 'Get pending analysis data' })
  @ApiHeader({ name: 'X-Device-Api-Key', required: false })
  @UseGuards(DeviceApiKeyGuard)
  @Get('analysis/pending')
  getPendingAnalysis() {
    return this.dataService.getPendingAnalysis();
  }

  @ApiHeader({ name: 'X-Device-Api-Key', required: false })
  @UseGuards(DeviceApiKeyGuard)
  @Put('analysis/:dataId')
  updateAdvisory(
    @Param('dataId') dataId: number,
    @Body() updateAdvisoryDto: UpdateAdvisoryDto,
  ) {
    return this.dataService.updateAdvisory(dataId, updateAdvisoryDto.advisory);
  }

  @ApiHeader({ name: 'X-Device-Api-Key', required: false })
  @UseGuards(DeviceApiKeyGuard)
  @Get('advisory/:kitId')
  getLatestAdvisory(@Param('kitId') kitId: string) {
    return this.dataService.getLatestAdvisory(kitId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('data/all')
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.dataService.findAll(Number(page), Number(limit));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('control/:kitId')
  updateControl(
    @Param('kitId') kitId: string,
    @Body() updateControlDto: UpdateControlDto,
    @Request() req,
  ) {
    return this.iotService.updateControl(
      kitId,
      updateControlDto,
      req.user.user_id,
      req.user.role,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('config/:kitId')
  updateConfig(
    @Param('kitId') kitId: string,
    @Body() updateConfigDto: UpdateConfigDto,
    @Request() req,
  ) {
    return this.iotService.updateConfig(
      kitId,
      updateConfigDto,
      req.user.user_id,
      req.user.role,
    );
  }

  @ApiHeader({ name: 'X-Device-Api-Key', required: false })
  @UseGuards(DeviceApiKeyGuard)
  @Post('ingest')
  ingest(@Body() createDataDto: CreateDataDto) {
    return this.dataService.create(createDataDto);
  }
}
