import { Controller, Post, Patch, Get, Param, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CalculationsService } from '../calculations/calculations.service';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly txService: TransactionsService, 
    private readonly calculationsService: CalculationsService,
  ) {}

  @Post()
  async create(@Body() body: { userId: string; type: 'payment' | 'usage' | 'refund'; amount: number; reference: string; planId?: string }) {
    return this.txService.create(body.userId, body.type, body.amount, body.reference, body.planId);
  }

  @Get(':id/approve')
  async approve(@Param('id') id: string) {
    return this.txService.approve(id);
  }

  @Get(':id/reject')
  async reject(@Param('id') id: string) {
    return this.txService.reject(id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.txService.findByUser(userId);
  }

  @Post('usage')
  async useService(@Body() dto: {
    userId: string;
    printerId: string;
    serviceType: 'printing' | 'photocopy' | 'mixed';
    printingPages?: number;
    photocopyPages?: number;
    reference: string;
  }) {
    return this.calculationsService.deduct(
      dto.userId,
      dto.printerId,
      dto.serviceType,
      dto.printingPages ?? 0,
      dto.photocopyPages ?? 0,
      dto.reference,
    );
  }

}


