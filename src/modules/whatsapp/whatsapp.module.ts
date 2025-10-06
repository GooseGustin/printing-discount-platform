// src/modules/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

import { UsersModule } from '../users/users.module'; // Adjust the path as needed

@Module({
  imports: [UsersModule],
  controllers: [WhatsappController],
  providers: [WhatsappService], 
  exports: [WhatsappService],
})
export class WhatsappModule {}
