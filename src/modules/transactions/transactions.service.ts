import {
  forwardRef,
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/user.model';
import { Plan } from '../../models/plan.model';
import { Printer } from '../../models/printer.model';
import { Subscription } from '../../models/subscription.model';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction) private readonly txModel: typeof Transaction,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Plan) private readonly planModel: typeof Plan,
    @InjectModel(Printer) private readonly printerModel: typeof Printer,
    @InjectModel(Subscription) private readonly subModel: typeof Subscription,  
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    userId: string,
    type: 'payment' | 'usage' | 'refund',
    amount: number,
    reference: string,
    planId?: string,
  ) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new BadRequestException('Invalid user');

    // Payments must reference a plan
    if (type === 'payment') {
      if (!planId)
        throw new BadRequestException(
          'planId is required for payment transactions',
        );
      const plan = await this.planModel.findByPk(planId);
      if (!plan) throw new BadRequestException('Invalid plan');
      if (amount !== plan.price)
        throw new BadRequestException('Amount does not match plan price');
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

    // 1️⃣ Approve the transaction
    tx.status = 'approved';
    await tx.save();

    // 2️⃣ Ensure it's a payment transaction (not a usage/refund)
    if (tx.type === 'payment') {
      // Fetch user and plan
      const user = await this.usersService.findById(tx.userId);
      const plan = await this.planModel.findByPk(tx.planId);
      if (!user || !plan) {
        throw new BadRequestException('Missing user or plan for subscription');
      }

      // 3️⃣ Create a new subscription
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (plan.duration === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.duration === 'weekly') {
        endDate.setDate(endDate.getDate() + 7);
      }

      await this.subModel.create({
        userId: user.id,
        planId: plan.id,
        status: 'active',
        weekNumber: 1,
        remainingPrintingPages: plan.printingTotalPages,
        remainingPhotocopyPages: plan.photocopyTotalPages,
        startDate,
        endDate,
      });

      // 4️⃣ Send WhatsApp confirmation
      if (user.phone) {
        await this.whatsappService.sendMessage(
          user.phone,
          `✅ *Payment Approved!*\n\n` +
            `Your subscription is now active. 🎉\n\n` +
            `📘 *Plan:* ${plan.name}\n💰 *Amount:* ₦${tx.amount}\n🧾 *Reference:* ${tx.reference}\n` +
            `📅 *Duration:* ${plan.duration}\n\n` +
            `You can now start printing or copying at discounted rates! 🖨️`,
        );
      }
    }

    return { message: 'Transaction approved successfully' };
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
        `⚠️ Your payment was rejected.\n\nReference: ${tx.reference}\nPlease double-check your payment and upload a valid receipt.`,
      );
    }

    return { message: 'Transaction rejected successfully' };
  }

  async findByUser(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('Invalid user');
    }
    return this.txModel.findAll({ where: { userId }, include: [Plan] });
  }

  async findPending() {
    return this.txModel.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
    });
  }

  async getRecentTransactions(userId: string, limit = 4) {
    return this.txModel.findAll({
      where: { userId },
      include: [this.planModel, this.printerModel], // ensure printer is included
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}
