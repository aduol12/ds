import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from '../assets/dto/update-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/assets/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get(':kitId')
  findOne(@Param('kitId') kitId: string, @Request() req) {
    return this.configService.findOne(kitId, req.user.user_id, req.user.role);
  }

  @Put(':kitId')
  update(@Param('kitId') kitId: string, @Body() updateConfigDto: UpdateConfigDto, @Request() req) {
    return this.configService.update(
      kitId,
      updateConfigDto,
      req.user.user_id,
      req.user.role,
    );
  }
}
