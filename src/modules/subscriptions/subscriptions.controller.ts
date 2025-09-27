import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subService: SubscriptionsService) {}

  @Post()
  async create(@Body() body: { userId: string; planId: string }) {
    return this.subService.create(body.userId, body.planId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.subService.findByUser(userId);
  }

  @Post('cancel')
  async cancel(@Body() body: { userId: string }) {
    return this.subService.cancel(body.userId);
  }

  @Get(':userId/balance')
  async getBalance(@Param('userId') userId: string) {
    return this.subService.getBalance(userId);
  }
}
