import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Receipt } from '../../models/receipt.model';
import { Transaction } from '../../models/transaction.model';
import { Subscription } from '../../models/subscription.model';
import { Plan } from '../../models/plan.model';
import { ReceiptsService } from './receipts.service';
import { ReceiptsController } from './receipts.controller';

@Module({
  imports: [SequelizeModule.forFeature([Receipt, Transaction, Subscription, Plan])],
  providers: [ReceiptsService],
  controllers: [ReceiptsController],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
