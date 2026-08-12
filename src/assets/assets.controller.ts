import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateKitDto } from './dto/create-kit.dto';
import { UpdateKitDto } from './dto/update-kit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/assets/kit')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() createKitDto: CreateKitDto, @Request() req) {
    return this.assetsService.create(
      createKitDto,
      req.user.user_id,
      req.user.role,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.assetsService.findAll(req.user.user_id, req.user.role);
  }

  @Get(':kitId')
  findOne(@Param('kitId') kitId: string, @Request() req) {
    return this.assetsService.findOne(kitId, req.user.user_id, req.user.role);
  }

  @Put(':kitId')
  update(@Param('kitId') kitId: string, @Body() updateKitDto: UpdateKitDto, @Request() req) {
    return this.assetsService.update(kitId, updateKitDto, req.user.user_id, req.user.role);
  }

  /** Soft-delete (decommission) — portal DELETE /api/assets/kit/:kitId */
  @Delete(':kitId')
  remove(@Param('kitId') kitId: string, @Request() req) {
    return this.assetsService.remove(kitId, req.user.user_id, req.user.role);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':kitId/permanent')
  hardDelete(@Param('kitId') kitId: string, @Request() req) {
    return this.assetsService.hardDelete(kitId, req.user.user_id, req.user.role);
  }
}
