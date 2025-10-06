import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import configuration from './config/configuration';
import { SequelizeDatabaseModule } from './database/sequelize.module';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { CalculationsModule } from './modules/calculations/calculations.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { SessionsModule } from './modules/sessions/sessions.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SequelizeDatabaseModule,
    HealthModule,
    UsersModule, 
    PlansModule, 
    ReceiptsModule,
    SubscriptionsModule, 
    TransactionsModule, 
    CalculationsModule, 
    SessionsModule,
    WhatsappModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}