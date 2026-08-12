import { Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdvisoryService } from './advisory.service';

@ApiTags('advisory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/advisory')
export class AdvisoryController {
  constructor(private readonly advisoryService: AdvisoryService) {}

  @Get(':kitId')
  history(
    @Param('kitId') kitId: string,
    @Query('limit') limit: number,
    @Request() req,
  ) {
    return this.advisoryService.history(
      kitId,
      req.user.user_id,
      req.user.role,
      Number(limit) || 20,
    );
  }

  @Post(':kitId/generate')
  generate(@Param('kitId') kitId: string, @Request() req) {
    return this.advisoryService.generate(kitId, req.user.user_id, req.user.role);
  }
}
