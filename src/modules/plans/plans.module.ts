import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Plan } from '../../models/plan.model';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';

@Module({
  imports: [SequelizeModule.forFeature([Plan])],
  providers: [PlansService],
  controllers: [PlansController],
  exports: [PlansService],
})
export class PlansModule {}
