import { forwardRef, Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

// Dependencies
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { PlansModule } from '../plans/plans.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ReceiptsModule } from '../receipts/receipts.module';

// Handlers
import { MainMenuHandler } from './handlers/main-menu.handler';
import { BuyPlanHandler } from './handlers/buy-plan.handler';
import { ReceiptUploadHandler } from './handlers/receipt-upload.handler';
import { AdminHandler } from './handlers/admin.handler';
import { CheckBalanceHandler } from './handlers/check-balance.handler';

@Module({
  imports: [
    UsersModule,
    SessionsModule,
    PlansModule,
    forwardRef(() => TransactionsModule), // 🩹 wrap this too
    ReceiptsModule,
  ],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    MainMenuHandler,
    BuyPlanHandler,
    CheckBalanceHandler,
    ReceiptUploadHandler,
    AdminHandler
  ],
  exports: [WhatsappService],
})
export class WhatsappModule {}
