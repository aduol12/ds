import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FarmsService } from './farms.service';
import {
  AssignKitDto,
  CreateFarmDto,
  CreateFieldDto,
  CreateHarvestDto,
  CreatePlantingDto,
  UpdateFarmDto,
  UpdateFieldDto,
} from './dto/farm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('farms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateFarmDto) {
    return this.farmsService.create(req.user.user_id, dto);
  }

  @Get()
  list(@Request() req, @Query('search') search?: string) {
    return this.farmsService.list(req.user.user_id, req.user.role, search);
  }

  @Get(':id')
  get(@Request() req, @Param('id') id: string) {
    return this.farmsService.get(id, req.user.user_id, req.user.role);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateFarmDto) {
    return this.farmsService.update(id, req.user.user_id, req.user.role, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.farmsService.softDelete(id, req.user.user_id, req.user.role);
  }

  @Post(':id/fields')
  addField(@Request() req, @Param('id') id: string, @Body() dto: CreateFieldDto) {
    return this.farmsService.addField(id, req.user.user_id, req.user.role, dto);
  }

  @Put(':id/fields/:fieldId')
  updateField(
    @Request() req,
    @Param('id') id: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: UpdateFieldDto,
  ) {
    return this.farmsService.updateField(
      id,
      fieldId,
      req.user.user_id,
      req.user.role,
      dto,
    );
  }

  @Post(':id/kits')
  assignKit(@Request() req, @Param('id') id: string, @Body() dto: AssignKitDto) {
    return this.farmsService.assignKit(id, req.user.user_id, req.user.role, dto);
  }

  @Post(':id/plantings')
  addPlanting(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreatePlantingDto,
  ) {
    return this.farmsService.addPlanting(id, req.user.user_id, req.user.role, dto);
  }

  @Post(':id/harvests')
  addHarvest(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateHarvestDto,
  ) {
    return this.farmsService.addHarvest(id, req.user.user_id, req.user.role, dto);
  }
}
