import { Controller, Post, Body } from '@nestjs/common';
import { CalculationsService } from './calculations.service';

@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calcService: CalculationsService) {}

  @Post('estimate')
  async estimate(@Body() body: { 
    userId: string; 
    printerId: string; 
    serviceType: "printing"|"photocopy"; 
    printingPages: number,
    photocopyPages: number,
  }) {
    return this.calcService.estimate(body.userId, body.printerId, body.serviceType, body.printingPages, body.photocopyPages);
  }

  @Post('deduct')
  async deduct(@Body() body: { 
    userId: string; 
    printerId: string; 
    serviceType: "printing"|"photocopy"|"mixed"; 
    printingPages: number; 
    photocopyPages: number; 
    reference: string 
  }) {
    return this.calcService.deduct(
      body.userId,
      body.printerId,
      body.serviceType,
      body.printingPages,
      body.photocopyPages,
      body.reference,
    )
  }
}
