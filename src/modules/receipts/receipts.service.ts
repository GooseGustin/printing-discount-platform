import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Receipt } from '../../models/receipt.model';
import { Transaction } from '../../models/transaction.model';
import { Subscription } from '../../models/subscription.model';
import { Plan } from '../../models/plan.model';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectModel(Receipt) private readonly receiptModel: typeof Receipt,
    @InjectModel(Transaction) private readonly txModel: typeof Transaction,
    @InjectModel(Subscription) private readonly subModel: typeof Subscription,
    @InjectModel(Plan) private readonly planModel: typeof Plan,
  ) {}

  async upload(transactionId: string, url: string) {
    const tx = await this.txModel.findByPk(transactionId);
    if (!tx) throw new BadRequestException('Transaction not found');
    if (tx.status !== 'pending') throw new BadRequestException('Transaction already processed');

    return this.receiptModel.create({
      transactionId,
      fileUrl: url,
      status: 'pending',
    });
  }

  async approve(id: string) {
    const receipt = await this.receiptModel.findByPk(id);
    if (!receipt) throw new BadRequestException('Receipt not found');

    const tx = await this.txModel.findByPk(receipt.transactionId);
    if (!tx) throw new BadRequestException('Transaction not found');

    // Flip both to approved
    receipt.status = 'approved';
    await receipt.save();
    tx.status = 'approved';
    await tx.save();

    // Activate subscription if this was a payment
    if (tx.type === 'payment' && tx.planId) {
      const now = new Date();
      const plan = await this.planModel.findByPk(tx.planId);
      if (!plan) throw new BadRequestException('Plan not found');

      const endDate =
        plan.duration === 'weekly'
          ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await this.subModel.create({
        userId: tx.userId,
        planId: tx.planId,
        startDate: now,
        endDate,
        remainingPrintingPages: plan.printingWeeklyCaps[0],
        remainingPhotocopyPages: plan.photocopyWeeklyCaps[0],
        status: 'active',
      });
    }

    return receipt;
  }

  async reject(id: string) {
    const receipt = await this.receiptModel.findByPk(id);
    if (!receipt) throw new BadRequestException('Receipt not found');

    const tx = await this.txModel.findByPk(receipt.transactionId);
    if (!tx) throw new BadRequestException('Transaction not found');

    // Flip both to rejected
    receipt.status = 'rejected';
    await receipt.save();
    tx.status = 'rejected';
    await tx.save();

    return receipt;
  }
}
