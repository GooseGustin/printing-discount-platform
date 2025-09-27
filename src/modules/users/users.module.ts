import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../models/user.model';
import { Printer } from '../../models/printer.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Printer])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
