import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DataService } from './data.service';
import { CreateDataDto } from '../assets/dto/create-data.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeviceApiKeyGuard } from '../common/guards/device-api-key.guard';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiTags('data')
@Controller('api/data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @ApiHeader({ name: 'X-Device-Api-Key', required: false })
  @UseGuards(DeviceApiKeyGuard)
  @Post('ingest')
  create(@Body() createDataDto: CreateDataDto) {
    return this.dataService.create(createDataDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('live')
  findAllLatest(@Request() req) {
    return this.dataService.findAllLatest(req.user.user_id, req.user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('live/:kitId')
  findLatest(@Param('kitId') kitId: string, @Request() req) {
    return this.dataService.findLatest(kitId, req.user.user_id, req.user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history/:kitId')
  findHistory(
    @Param('kitId') kitId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req,
  ) {
    return this.dataService.findHistory(
      kitId,
      req.user.user_id,
      new Date(from),
      new Date(to),
      req.user.role,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSummary(@Request() req) {
    return this.dataService.getSummary(req.user.user_id, req.user.role);
  }
}
