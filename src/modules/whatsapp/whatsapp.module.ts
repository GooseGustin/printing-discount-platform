import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

// Dependencies
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { PlansModule } from '../plans/plans.module';
import { TransactionsModule } from '../transactions/transactions.module';

// Handlers
import { MainMenuHandler } from './handlers/main-menu.handler';
import { BuyPlanHandler } from './handlers/buy-plan.handler';
import { ReceiptUploadHandler } from './handlers/receipt-upload.handler';
import { ReceiptsModule } from '../receipts/receipts.module';

@Module({
  imports: [
    UsersModule,
    SessionsModule,
    PlansModule,
    TransactionsModule,
    ReceiptsModule,
  ],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    MainMenuHandler,
    BuyPlanHandler,
    ReceiptUploadHandler,
  ],
  exports: [WhatsappService],
})
export class WhatsappModule {}
