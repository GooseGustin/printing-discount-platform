import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Session } from '../../models/session.model';
import { SessionService } from './sessions.service';

@Module({
  imports: [SequelizeModule.forFeature([Session])],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionsModule {}
