import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sensor-csv')
  @ApiQuery({ name: 'kitId', required: true })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  sensorCsv(
    @Query('kitId') kitId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req,
  ) {
    return this.reportsService.sensorCsv(
      kitId,
      req.user.user_id,
      req.user.role,
      from,
      to,
    );
  }

  @Get('usage')
  @ApiQuery({ name: 'farmId', required: false })
  usage(@Query('farmId') farmId: string, @Request() req) {
    return this.reportsService.usageSummary(
      req.user.user_id,
      req.user.role,
      farmId,
    );
  }
}
