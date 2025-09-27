import { Controller, Post, Patch, Param, Body } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  async upload(@Body() body: { transactionId: string; url: string }) {
    return this.receiptsService.upload(body.transactionId, body.url);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.receiptsService.approve(id);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string) {
    return this.receiptsService.reject(id);
  }
}
