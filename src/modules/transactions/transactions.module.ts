import { SequelizeModule } from "@nestjs/sequelize";
import { forwardRef, Module } from '@nestjs/common';
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { Transaction } from "../../models/transaction.model";
import { User } from "../../models/user.model";
import { Plan } from "../../models/plan.model";
import { Printer } from "../../models/printer.model";
import { Subscription } from "..//../models/subscription.model";
import { CalculationsModule } from "../calculations/calculations.module";
import { WhatsappModule } from "../whatsapp/whatsapp.module";
import { UsersModule } from "../users/users.module";

// transactions.module.ts
@Module({
  imports: [
    SequelizeModule.forFeature([Transaction, User, Plan, Printer, Subscription]), 
    UsersModule, 
    forwardRef(() => WhatsappModule),  // 🩹 wrap this import
    CalculationsModule
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService]
})
export class TransactionsModule {}
