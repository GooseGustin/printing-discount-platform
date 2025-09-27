import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

// Import models
import { User } from '../models/user.model';
import { Plan } from '../models/plan.model';
import { Subscription } from '../models/subscription.model';
import { Transaction } from '../models/transaction.model';
import { Receipt } from '../models/receipt.model';
import { Session } from '../models/session.model';
import { Printer } from '../models/printer.model';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 ensures .env is available everywhere
    }),

    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadModels: true,
        synchronize: true,
        models: [User, Plan, Subscription, Transaction, Receipt, Printer, Session],
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false, // 👈 required for Supabase
          },
        },
      }),
    }),
  ],
})
export class SequelizeDatabaseModule {}


// @Module({
//   imports: [
//     SequelizeModule.forRoot({
//       dialect: 'postgres',
//       host: process.env.DB_HOST,
//       port: Number(process.env.DB_PORT),
//       username: process.env.DB_USER,
//       password: process.env.DB_PASS,
//       database: process.env.DB_NAME,
//       autoLoadModels: true,
//       synchronize: true,
//       models: [User, Plan, Subscription, Transaction, Receipt, Session, Printer],
//       dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
//     }),
//   ],
// })
// export class SequelizeDatabaseModule {}
