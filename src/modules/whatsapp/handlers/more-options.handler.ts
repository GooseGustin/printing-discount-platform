// src/modules/whatsapp/handlers/more-options.handler.ts
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { SessionService } from '../../sessions/sessions.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { WhatsappService } from '../whatsapp.service';

@Injectable()
export class MoreOptionsHandler {
  private readonly logger = new Logger(MoreOptionsHandler.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async handleResponse(userPhone: string, message: string) {
    const signUpLink: string = 'https://forms.google.com/';

    const user = await this.usersService.findByPhone(userPhone);
    if (!user) return { text: { body: 'User not found.' } };

    const lower = message.trim().toLowerCase();

    // Step 1: Show options
    if (lower === 'more' || lower === '5') {
      await this.sessionService.updateStateAndStep(user.id, 'MORE', 'SHOW');
      const body =
        `💡 *More Options*\n\n` +
        `1️⃣ To cancel your subscription, type *cancel*\n` +
        `2️⃣ To sign up a new user, use this link:\n${signUpLink}`;

      return { text: { body } };
    }

    // Step 2: Handle "cancel"
    if (lower === 'cancel') {
      const activeSub = await this.subscriptionsService.getActiveSubscription(
        user.id,
      );

      if (!activeSub)
        return {
          text: { body: 'You have no active subscription to cancel.' },
        };

      await this.subscriptionsService.cancel(activeSub.id);

      await this.whatsappService.sendMessage(
        user.phone,
        `❌ Your subscription has been successfully cancelled. You may buy a new plan at any time using *menu → Buy a plan*.`,
      );

      await this.sessionService.clearContext(user.id);
      return { text: { body: 'Your subscription was cancelled successfully.' } };
    }

    return { text: { body: 'Invalid option. Type *menu* to return.' } };
  }
}
