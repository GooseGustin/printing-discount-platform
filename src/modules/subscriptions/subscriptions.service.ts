import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Subscription } from '../../models/subscription.model';
import { User } from '../../models/user.model';
import { Plan } from '../../models/plan.model';
import { getCurrentWeek } from '../../../src/common/utils/week.util';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription) private readonly subModel: typeof Subscription,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Plan) private readonly planModel: typeof Plan,
  ) {}

  async create(userId: string, planId: string) {
    // Check if user already has active subscription
    const active = await this.subModel.findOne({
      where: { userId, status: 'active' },
    });
    if (active) throw new BadRequestException('User already has an active subscription');

    const user = await this.userModel.findByPk(userId);
    if (!user || user.role !== 'student') {
      throw new BadRequestException('Invalid student');
    }

    const plan = await this.planModel.findByPk(planId);
    if (!plan) throw new BadRequestException('Plan not found');

    const now = new Date();
    const endDate =
      plan.duration === 'weekly'
        ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return this.subModel.create({
      userId,
      planId,
      startDate: now,
      endDate,
      weekNumber: 1,
      remainingPrintingPages: plan.printingWeeklyCaps[0],
      remainingPhotocopyPages: plan.photocopyWeeklyCaps[0],
      status: 'active',
    });
  }

  async findByUser(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user || user.role !== 'student') {
      throw new BadRequestException('Invalid student');
    }

    const sub = await this.subModel.findOne({
      where: { userId, status: 'active' },
      include: [User, Plan],
    });
    if (!sub) {
      return {
        message: 'No subscription found for this user'
      };
    }

    return sub;
  }

  async cancel(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user || user.role !== 'student') {
      throw new BadRequestException('Invalid student');
    }

    const sub = await this.subModel.findOne({
      where: { userId, status: 'active' },
    });
    if (!sub) throw new BadRequestException('No active subscription');
    sub.status = 'cancelled';
    await sub.save();
    return sub;
  }

  async getBalance(userId: string) {
    const sub = await this.subModel.findOne({
      where: { userId, status: 'active' },
      include: [Plan],
    });
    if (!sub) throw new BadRequestException('No active subscription');

    const weekNumber = getCurrentWeek(sub);

    return {
      subscriptionId: sub.id,
      planId: sub.planId,
      status: sub.status,
      weekNumber,
      remainingPrintingPages: sub.remainingPrintingPages,
      remainingPhotocopyPages: sub.remainingPhotocopyPages,
    };
}

}
