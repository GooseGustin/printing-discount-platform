// src/modules/whatsapp/whatsapp.controller.ts
import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      this.logger.log('Webhook verified!');
      return res.status(200).send(challenge);
    } else {
      this.logger.error('Webhook verification failed.');
      return res.sendStatus(403);
    }
  }

  @Post('webhook')
  async handleIncoming(@Body() body: any) {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (messages && messages[0]) {
      const msg = messages[0];
      const from = msg.from; // phone number
      const text = msg.text?.body;

      this.logger.log(`Incoming from ${from}: ${text}`);

      // Basic menu flow
      if (text?.toLowerCase() === 'hi' || text?.toLowerCase() === 'menu') {
        await this.whatsappService.sendMessage(
          from,
          `Welcome to PrintEase! ✨\n\nChoose an option:\n1. View my balance\n2. Buy a plan\n3. Check my subscriptions\n4. Calculate cost`,
        );
      } else {
        await this.whatsappService.sendMessage(
          from,
          `Sorry, I didn't understand that. Type "menu" to see options.`,
        );
      }
    }

    return { status: 'EVENT_RECEIVED' };
  }
}
