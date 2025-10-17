import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Subscription } from '../../models/subscription.model';
import { User } from '../../models/user.model';
import { Plan } from '../../models/plan.model';
import { Transaction } from '../../models/transaction.model';
import { Printer } from '../../models/printer.model';

// utilities
import { getCurrentWeek } from '../../common/utils/week.util';
import { getWeeklyCap } from '../../common/utils/cap.util';
import { calculateCost } from '../../common/utils/cost.util';
import { calculateMixed } from '../../common/utils/mixed.util';
import { deductBalance } from '../../common/utils/balance.util';

@Injectable()
export class CalculationsService {
  private readonly logger = new Logger('Calculations');

  constructor(
    @InjectModel(Subscription) private readonly subModel: typeof Subscription,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Plan) private readonly planModel: typeof Plan,
    @InjectModel(Transaction) private readonly txModel: typeof Transaction,
    @InjectModel(Printer) private readonly printerModel: typeof Printer,
  ) {}

  async estimate(
    userId: string,
    printerId: string,
    serviceType: 'printing' | 'photocopy',
    pages: number,
  ) {
    if (!['printing', 'photocopy'].includes(serviceType)) {
      throw new BadRequestException(`Invalid serviceType: ${serviceType}`);
    }

    const subscription = await this.subModel.findOne({
      where: { userId, status: 'active' },
      order: [['createdAt', 'DESC']],
    });
    if (!subscription) throw new BadRequestException('No active subscription');

    const plan = await this.planModel.findByPk(subscription.planId);
    if (!plan) throw new BadRequestException('Plan not found');

    const printer = await this.printerModel.findByPk(printerId);
    if (!printer) throw new BadRequestException('Printer not found');

    const weekNumber = getCurrentWeek(subscription);
    const cap = getWeeklyCap(plan, weekNumber, serviceType);

    let remaining: number;
    let baseCost: number;
    let discountedCost: number;

    if (serviceType === 'printing') {
      remaining = subscription.remainingPrintingPages;
      baseCost = printer.baseCostPrinting;
      discountedCost = printer.discountedPricePrinting;
    } else {
      remaining = subscription.remainingPhotocopyPages;
      baseCost = printer.baseCostPhotocopy;
      discountedCost = printer.discountedPricePhotocopy;
    }

    return calculateCost(pages, remaining, cap, baseCost, discountedCost);
  }

  async deduct(
    userId: string,
    printerId: string,
    serviceType: 'printing' | 'photocopy' | 'mixed',
    printingPages: number,
    photocopyPages: number,
    reference: string,
  ) {
    const sub = await this.subModel.findOne({
      where: { userId, status: 'active' },
      include: [Plan],
    });
    if (!sub) throw new BadRequestException('No active subscription');

    const plan = await this.planModel.findByPk(sub.planId);
    if (!plan) throw new BadRequestException('Plan not found');

    const printer = await this.printerModel.findByPk(printerId);
    if (!printer) throw new BadRequestException('Printer not found');

    const weekNumber = getCurrentWeek(sub);

    let totalCost = 0;
    let totalDiscounted = 0;
    let totalFull = 0;

    if (serviceType === 'printing') {
      const cap = getWeeklyCap(plan, weekNumber, 'printing');
      const result = calculateCost(
        printingPages,
        sub.remainingPrintingPages,
        cap,
        printer.baseCostPrinting,
        printer.discountedPricePrinting,
      );
      deductBalance(sub, 'printing', result.discountedPages);
      totalCost = result.totalCost;
      totalDiscounted = result.discountedPages;
      totalFull = result.fullPricePages;
    } else if (serviceType === 'photocopy') {
      const cap = getWeeklyCap(plan, weekNumber, 'photocopy');
      const result = calculateCost(
        photocopyPages,
        sub.remainingPhotocopyPages,
        cap,
        printer.baseCostPhotocopy,
        printer.discountedPricePhotocopy,
      );
      deductBalance(sub, 'photocopy', result.discountedPages);
      totalCost = result.totalCost;
      totalDiscounted = result.discountedPages;
      totalFull = result.fullPricePages;
    } else if (serviceType === 'mixed') {
      const printingCap = getWeeklyCap(plan, weekNumber, 'printing');
      const photocopyCap = getWeeklyCap(plan, weekNumber, 'photocopy');

      const result = calculateMixed(
        printingPages,
        photocopyPages,
        sub.remainingPrintingPages,
        sub.remainingPhotocopyPages,
        printingCap,
        photocopyCap,
        printer.baseCostPrinting,
        printer.discountedPricePrinting,
        printer.baseCostPhotocopy,
        printer.discountedPricePhotocopy,
      );

      // Deduct balances
      deductBalance(sub, 'printing', result.printing.discountedPages);
      deductBalance(sub, 'photocopy', result.photocopy.discountedPages);

      totalCost = result.totalCost;
      totalDiscounted =
        result.printing.discountedPages + result.photocopy.discountedPages;
      totalFull =
        result.printing.fullPricePages + result.photocopy.fullPricePages;
    }

    await sub.save();

    // One transaction for all
    await this.txModel.create({
      userId,
      planId: sub.planId,
      printerId,
      type: 'usage',
      serviceType,
      pages: printingPages + photocopyPages,
      amount: totalCost,
      reference,
      status: 'approved',
      description: `${printingPages} printing + ${photocopyPages} photocopy at ${printer.name}`,
    });

    return {
      message: 'Usage recorded',
      serviceType,
      totalCost,
      totalDiscounted,
      totalFull,
      updatedPrintingRemaining: sub.remainingPrintingPages,
      updatedPhotocopyRemaining: sub.remainingPhotocopyPages,
      currentWeek: weekNumber,
    };
  }
}
