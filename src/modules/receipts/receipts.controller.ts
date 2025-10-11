import { Controller, Post, Patch, Param, Body } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  async upload(@Body() body: { transactionId: string; url: string }) {
    return this.receiptsService.uploadReceipt(body.transactionId, body.url);
  }

  // Admin permission only
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.receiptsService.approveReceipt(id);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string) {
    return this.receiptsService.rejectReceipt(id);
  }
}
