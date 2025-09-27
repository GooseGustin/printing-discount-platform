import { Controller, Post, Body } from '@nestjs/common';
import { CalculationsService } from './calculations.service';

@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calcService: CalculationsService) {}

  @Post('estimate')
  async estimate(@Body() body: { userId: string; printerId: string; serviceType: "printing"|"photocopy"; pages: number }) {
    return this.calcService.estimate(body.userId, body.printerId, body.serviceType, body.pages);
  }

  // @Post('deduct')
  // async deduct(@Body() body: { userId: string; printerId: string; serviceType: "printing"|"photocopy"; pages: number; reference: string }) {
  //   return this.calcService.deduct(body.userId, body.printerId, body.printingPages, body.photocopyPages, body.serviceType, body.reference);
  // }
}
