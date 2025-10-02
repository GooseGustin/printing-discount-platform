// src/modules/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';

@Module({
  controllers: [WhatsappController],
})
export class WhatsappModule {}
