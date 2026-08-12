import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IrrigationService } from './irrigation.service';

@Injectable()
export class IrrigationScheduler {
  private readonly logger = new Logger(IrrigationScheduler.name);
  private running = false;

  constructor(private readonly irrigationService: IrrigationService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const count = await this.irrigationService.runDueSchedules();
      if (count > 0) {
        this.logger.log(`Triggered ${count} irrigation schedule(s)`);
      }
    } catch (err) {
      this.logger.error(
        `Schedule runner failed: ${(err as Error)?.message || err}`,
      );
    } finally {
      this.running = false;
    }
  }
}
