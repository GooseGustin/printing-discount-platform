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
import { UploadReceiptHandler } from './handlers/upload-receipt.handler';

@Module({
  imports: [
    UsersModule,
    SessionsModule,
    PlansModule,
    TransactionsModule,
  ],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    MainMenuHandler,
    BuyPlanHandler,
    UploadReceiptHandler,
  ],
  exports: [WhatsappService],
})
export class WhatsappModule {}
