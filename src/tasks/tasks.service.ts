import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldTask } from './entities/field-task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Farm } from '../farms/entities/farm.entity';
import { User } from '../users/entities/user.entity';
import { isStaffRole, toPortalRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(FieldTask)
    private readonly tasksRepo: Repository<FieldTask>,
    @InjectRepository(Farm)
    private readonly farmsRepo: Repository<Farm>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async list(userId: string, role: Role) {
    const portal = toPortalRole(role);
    if (portal === 'FIELD_TECHNICIAN') {
      return this.tasksRepo.find({
        where: { assignee_user_id: userId },
        order: { created_at: 'DESC' },
        take: 200,
      });
    }
    if (!isStaffRole(role)) {
      throw new ForbiddenException('Not allowed to list tasks');
    }
    return this.tasksRepo.find({
      order: { created_at: 'DESC' },
      take: 200,
    });
  }

  async create(actorId: string, role: Role, dto: CreateTaskDto) {
    const portal = toPortalRole(role);
    if (!isStaffRole(role) || portal === 'FIELD_TECHNICIAN') {
      throw new ForbiddenException('Only admins can create tasks');
    }

    let farmName: string | null = null;
    if (dto.farm_id) {
      const farm = await this.farmsRepo.findOneBy({
        id: dto.farm_id,
        is_active: true,
      });
      if (!farm) throw new NotFoundException('Farm not found');
      farmName = farm.name;
    }

    let assigneeName: string | null = null;
    let status: FieldTask['status'] = 'New';
    if (dto.assignee_user_id) {
      const assignee = await this.usersRepo.findOneBy({
        user_id: dto.assignee_user_id,
      });
      if (!assignee) throw new NotFoundException('Assignee not found');
      assigneeName = `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim();
      status = 'Assigned';
    }

    const task = this.tasksRepo.create({
      title: dto.title.trim(),
      task_type: dto.task_type || 'Field Visit',
      description: dto.description || null,
      farm_id: dto.farm_id || null,
      farm_name: farmName,
      assignee_user_id: dto.assignee_user_id || null,
      assignee_name: assigneeName,
      created_by_user_id: actorId,
      priority: dto.priority || 'Medium',
      due_date: dto.due_date || null,
      status,
    });
    return this.tasksRepo.save(task);
  }

  async update(
    taskId: string,
    actorId: string,
    role: Role,
    dto: UpdateTaskDto,
  ) {
    const task = await this.tasksRepo.findOneBy({ id: taskId });
    if (!task) throw new NotFoundException('Task not found');

    const portal = toPortalRole(role);
    if (portal === 'FIELD_TECHNICIAN') {
      if (task.assignee_user_id !== actorId) {
        throw new ForbiddenException('Not your task');
      }
      // Technicians may only advance status
      if (dto.status) {
        task.status = dto.status;
        return this.tasksRepo.save(task);
      }
      throw new ForbiddenException('Technicians can only update task status');
    }

    if (!isStaffRole(role)) {
      throw new ForbiddenException('Not allowed');
    }

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.task_type !== undefined) task.task_type = dto.task_type;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.due_date !== undefined) task.due_date = dto.due_date;
    if (dto.status !== undefined) task.status = dto.status;

    if (dto.farm_id !== undefined) {
      if (dto.farm_id === null) {
        task.farm_id = null;
        task.farm_name = null;
      } else {
        const farm = await this.farmsRepo.findOneBy({
          id: dto.farm_id,
          is_active: true,
        });
        if (!farm) throw new NotFoundException('Farm not found');
        task.farm_id = farm.id;
        task.farm_name = farm.name;
      }
    }

    if (dto.assignee_user_id !== undefined) {
      if (dto.assignee_user_id === null) {
        task.assignee_user_id = null;
        task.assignee_name = null;
        if (task.status === 'Assigned') task.status = 'New';
      } else {
        const assignee = await this.usersRepo.findOneBy({
          user_id: dto.assignee_user_id,
        });
        if (!assignee) throw new NotFoundException('Assignee not found');
        task.assignee_user_id = assignee.user_id;
        task.assignee_name =
          `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim();
        if (task.status === 'New') task.status = 'Assigned';
      }
    }

    return this.tasksRepo.save(task);
  }

  async remove(taskId: string, role: Role) {
    if (!isStaffRole(role) || toPortalRole(role) === 'FIELD_TECHNICIAN') {
      throw new ForbiddenException('Not allowed to delete tasks');
    }
    const task = await this.tasksRepo.findOneBy({ id: taskId });
    if (!task) throw new NotFoundException('Task not found');
    await this.tasksRepo.remove(task);
    return { ok: true };
  }
}
