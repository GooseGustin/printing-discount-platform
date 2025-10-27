import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

// Dependencies
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { PlansModule } from '../plans/plans.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

// Handlers
import { MainMenuHandler } from './handlers/main-menu.handler';
import { BuyPlanHandler } from './handlers/buy-plan.handler';
import { ReceiptUploadHandler } from './handlers/receipt-upload.handler';
import { AdminHandler } from './handlers/admin.handler';
import { CheckBalanceHandler } from './handlers/check-balance.handler';
import { ViewHistoryHandler } from './handlers/view-history.handler';
import { MakeTransactionHandler } from './handlers/make-transaction.handler';
import { CalculationsModule } from '../calculations/calculations.module';
import { Printer } from '../../models/printer.model';
import { MoreOptionsHandler } from './handlers/more-options.handler';

@Module({
  imports: [
    SequelizeModule.forFeature([Printer]), 
    UsersModule,
    SessionsModule,
    PlansModule,
    forwardRef(() => TransactionsModule), // 🩹 wrap this too
    ReceiptsModule,
    SubscriptionsModule,
    CalculationsModule,
  ],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    MainMenuHandler,
    BuyPlanHandler,
    CheckBalanceHandler,
    ReceiptUploadHandler,
    AdminHandler, 
    ViewHistoryHandler, 
    MakeTransactionHandler,
    MoreOptionsHandler
  ],
  exports: [WhatsappService],
})
export class WhatsappModule {}
