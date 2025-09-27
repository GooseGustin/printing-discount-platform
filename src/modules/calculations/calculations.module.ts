import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Subscription } from '../../models/subscription.model';
import { User } from '../../models/user.model';
import { Plan } from '../../models/plan.model';
import { Transaction } from '../../models/transaction.model';
import { Printer } from '../../models/printer.model';
import { CalculationsService } from './calculations.service';
import { CalculationsController } from './calculations.controller';

@Module({
  imports: [SequelizeModule.forFeature([Subscription, User, Plan, Transaction, Printer])],
  providers: [CalculationsService],
  controllers: [CalculationsController],
  exports: [CalculationsService],
})
export class CalculationsModule {}
