// src/modules/whatsapp/whatsapp.controller.ts
import { Controller, Get, Post, Query, Res, Body, Logger } from '@nestjs/common';
import { Response } from 'express';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

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
  handleIncoming(@Body() body: any) {
    this.logger.debug('Incoming WhatsApp payload: ' + JSON.stringify(body, null, 2));
    return { status: 'EVENT_RECEIVED' };
  }
}
