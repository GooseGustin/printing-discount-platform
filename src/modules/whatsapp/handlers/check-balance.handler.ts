// src/modules/whatsapp/handlers/check-balance.handler.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { SessionService } from '../../sessions/sessions.service';
import { getCurrentWeek } from '../../../common/utils/week.util';

@Injectable()
export class CheckBalanceHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionService: SubscriptionsService,
    private readonly sessionService: SessionService,
  ) {}

  async handleResponse(userPhone: string) {
    const user = await this.usersService.findByPhone(userPhone);
    if (!user) {
      return {
        text: { body: '⚠️ You are not registered. Please create an account first.' },
      };
    }

    let subscription;
    try {
      subscription = await this.subscriptionService.getActiveSubscriptionWithPlan(user.id);
    } catch (err) {
      if (err instanceof BadRequestException) {
        return { text: { body: '❌ You currently have no active subscription or plan.' } };
      }
      throw err;
    }

    const plan = subscription.plan;
    const weekNumber = getCurrentWeek(subscription);
    const totalWeeks = plan.printingWeeklyCaps.length || 4;

    const usedPrinting =
      plan.printingTotalPages - subscription.remainingPrintingPages;
    const usedPhotocopy =
      plan.photocopyTotalPages - subscription.remainingPhotocopyPages;

    const printingCap =
      plan.printingWeeklyCaps[weekNumber - 1] || plan.printingInitialCap;
    const photocopyCap =
      plan.photocopyWeeklyCaps[weekNumber - 1] || plan.photocopyInitialCap;

    const startDate = new Date(subscription.startDate).toLocaleDateString();
    const endDate = new Date(subscription.endDate).toLocaleDateString();

    const response =
      `🧾 *Your CopyWise Balance*\n\n` +
      `📘 *Plan:* ${plan.name} (${plan.duration})\n` +
      `💵 *Price:* ₦${plan.price.toLocaleString()}\n` +
      `📅 *Week:* ${weekNumber}/${totalWeeks}\n` +
      `🗓 *Start Date:* ${startDate}\n` +
      `⏰ *Renewal Date:* ${endDate}\n\n` +
      `🖨 *Printing*\n` +
      `• Used: ${usedPrinting} pages\n` +
      `• Remaining: ${subscription.remainingPrintingPages} / ${plan.printingTotalPages}\n` +
      `• Weekly Cap: ${printingCap} pages\n\n` +
      `📑 *Photocopy*\n` +
      `• Used: ${usedPhotocopy} pages\n` +
      `• Remaining: ${subscription.remainingPhotocopyPages} / ${plan.photocopyTotalPages}\n` +
      `• Weekly Cap: ${photocopyCap} pages\n\n` +
      `✅ *Status:* ${subscription.status.toUpperCase()}`;

    await this.sessionService.updateStateAndStep(user.id, 'MAIN_MENU', 'SHOW_OPTIONS');

    return { text: { body: response } };
  }
}
