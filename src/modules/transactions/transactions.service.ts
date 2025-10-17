import { forwardRef, Inject, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/user.model';
import { Plan } from '../../models/plan.model';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction) private readonly txModel: typeof Transaction,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Plan) private readonly planModel: typeof Plan,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, type: 'payment' | 'usage' | 'refund', amount: number, reference: string, planId?: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new BadRequestException('Invalid user');

    // Payments must reference a plan
    if (type === 'payment') {
      if (!planId) throw new BadRequestException('planId is required for payment transactions');
      const plan = await this.planModel.findByPk(planId);
      if (!plan) throw new BadRequestException('Invalid plan');
      if (amount !== plan.price) throw new BadRequestException('Amount does not match plan price');
    }

    // For usage/refund, planId is optional
    return this.txModel.create({
      userId,
      planId,
      type,
      amount,
      reference,
      status: 'pending',
    });
  }

  async approve(id: string) {
    const tx = await this.txModel.findByPk(id);
    if (!tx) throw new BadRequestException('Transaction not found');
    tx.status = 'approved';
    await tx.save();

    // Fetch user to send WhatsApp message
    const user = await this.usersService.findById(tx.userId);

    if (user?.phone) {
      await this.whatsappService.sendMessage(
        user.phone,
        `✅ Your payment has been approved!\n\nPlan: ${tx.description || 'N/A'}\nAmount: ₦${tx.amount}\nReference: ${tx.reference}\n\nYour subscription is now active. 🎉`
      );
    }

    return tx;
  }

  async reject(id: string) {
    const tx = await this.txModel.findByPk(id);
    if (!tx) throw new BadRequestException('Transaction not found');
    tx.status = 'rejected';
    await tx.save();
    
    // Fetch user to send WhatsApp message
    const user = await this.usersService.findById(tx.userId);

    if (user?.phone) {
      await this.whatsappService.sendMessage(
        user.phone,
        `⚠️ Your payment was rejected.\n\nReference: ${tx.reference}\nPlease double-check your payment and upload a valid receipt.`
      );
    }

    return tx;
  }

  async findByUser(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('Invalid user');
    }
    return this.txModel.findAll({ where: { userId }, include: [Plan] });
  }

  async findPending() {
    return this.txModel.findAll({ where: { status: 'pending' }, order: [['createdAt', 'DESC']] });
  }

}
