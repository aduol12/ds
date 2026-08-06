import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IrrigationService } from './irrigation.service';
import {
  CreateIrrigationEventDto,
  CreateIrrigationZoneDto,
  UpdateIrrigationZoneDto,
} from './dto/irrigation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('irrigation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/irrigation')
export class IrrigationController {
  constructor(private readonly irrigationService: IrrigationService) {}

  @Get('zones')
  listZones(@Request() req, @Query('farm_id') farmId?: string) {
    return this.irrigationService.listZones(
      req.user.user_id,
      req.user.role,
      farmId,
    );
  }

  @Post('zones')
  createZone(@Request() req, @Body() dto: CreateIrrigationZoneDto) {
    return this.irrigationService.createZone(req.user.user_id, req.user.role, dto);
  }

  @Put('zones/:id')
  updateZone(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateIrrigationZoneDto,
  ) {
    return this.irrigationService.updateZone(
      id,
      req.user.user_id,
      req.user.role,
      dto,
    );
  }

  @Post('zones/:id/start')
  startZone(@Request() req, @Param('id') id: string) {
    return this.irrigationService.setZoneActive(
      id,
      req.user.user_id,
      req.user.role,
      true,
    );
  }

  @Post('zones/:id/stop')
  stopZone(@Request() req, @Param('id') id: string) {
    return this.irrigationService.setZoneActive(
      id,
      req.user.user_id,
      req.user.role,
      false,
    );
  }

  @Get('zones/:id/events')
  listEvents(@Request() req, @Param('id') id: string) {
    return this.irrigationService.listEvents(id, req.user.user_id, req.user.role);
  }

  @Post('zones/:id/events')
  addEvent(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateIrrigationEventDto,
  ) {
    return this.irrigationService.addEvent(
      id,
      req.user.user_id,
      req.user.role,
      dto,
    );
  }
}
