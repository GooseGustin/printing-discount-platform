import { SequelizeModule } from "@nestjs/sequelize";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { Transaction } from "@/models/transaction.model";
import { Module } from "@nestjs/common";
import { ReceiptsService } from "../receipts/receipts.service";
import { ReceiptsController } from "../receipts/receipts.controller";
import { Receipt } from "@/models/receipt.model";
import { User } from "@/models/user.model";
import { Plan } from "@/models/plan.model";
import { CalculationsModule } from "../calculations/calculations.module";

// transactions.module.ts
@Module({
  imports: [SequelizeModule.forFeature([Transaction, User, Plan]), CalculationsModule],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}

// receipts.module.ts
@Module({
  imports: [SequelizeModule.forFeature([Receipt, Transaction])],
  providers: [ReceiptsService],
  controllers: [ReceiptsController],
})
export class ReceiptsModule {}

