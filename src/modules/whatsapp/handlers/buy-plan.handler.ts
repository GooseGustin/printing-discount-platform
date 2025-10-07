import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { PlansService } from '../../plans/plans.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { SessionService } from '../../sessions/sessions.service';
import { generateReference } from '../../../common/utils/reference.util';

@Injectable()
export class BuyPlanHandler {
  private readonly logger = new Logger(BuyPlanHandler.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    private readonly transactionsService: TransactionsService,
    private readonly sessionService: SessionService,
  ) {}

  async handleResponse(userPhone: string, message: string) {
    const user = await this.usersService.findByPhone(userPhone);
    let session = await this.sessionService.getOrCreate(user.id);
    this.logger.log(
          `Session for ${user.name}, ${userPhone}: state=${session.state}, step=${session.step}, check 3`,
        );
    const { state, step, context } = session;

    // STEP 1 — Show plans for user's location
    if (state !== 'BUY_PLAN' || step === 'SHOW_PLANS') {
      const plans = await this.plansService.findByLocation(user.location);

      if (!plans.length) {
        return { text: { body: `No plans available for ${user.location}.` } };
      }

      const planList = plans
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} – ${p.printingTotalPages} printing, ${p.photocopyTotalPages} photocopy`,
        )
        .join('\n');

      const text =
        `Here are the available plans for your institution (${user.location}):\n\n${planList}\n\n` +
        `${plans.length + 1}. Upload Payment Receipt\n\n` +
        `Reply with a number to continue.`;

      await this.sessionService.updateStateAndStep(
        user.id,
        'BUY_PLAN',
        'CHOOSE_PLAN',
        { plans },
      );

      this.logger.log(
          `Session for ${user.name}, ${userPhone}: state=${session.state}, step=${session.step}, check 4, ${text}`,
        );

      return { text: { body: text } };
    }

    // STEP 2 — User chooses a plan or upload option
    if (step === 'CHOOSE_PLAN') {
      const plans = context.plans;
      const choice = Number(message.trim());

      // Upload receipt option
      if (choice === plans.length + 1) {
        await this.sessionService.updateStateAndStep(
          user.id,
          'BUY_PLAN',
          'AWAIT_RECEIPT_UPLOAD',
          {},
        );

        return {
          text: {
            body: 'Please send the image of your payment receipt. I’ll link it to your latest pending transaction.',
          },
        };
      }

      // Invalid choice
      if (isNaN(choice) || choice < 1 || choice > plans.length) {
        return { text: { body: 'Please enter a valid plan number.' } };
      }

      const selectedPlan = plans[choice - 1];

      await this.sessionService.updateStateAndStep(
        user.id,
        'BUY_PLAN',
        'AWAIT_CONFIRMATION',
        { selectedPlanId: selectedPlan.id },
      );

      return {
        text: {
          body: `You chose ${selectedPlan.name}. Confirm with "YES" or "NO".`,
        },
      };
    }

    // STEP 3 — Confirm purchase intent
    if (step === 'AWAIT_CONFIRMATION') {
      const input = message.trim().toUpperCase();

      if (input === 'YES') {
        const planId = context.selectedPlanId;
        const plan = await this.plansService.findById(planId);

        if (!plan) {
          await this.sessionService.resetToMainMenu(user.id);
          return {
            text: { body: 'Plan not found. Returning to main menu.' },
          };
        }

        const reference = generateReference();

        await this.transactionsService.create(
          user.id,
          'payment',
          plan.price,
          reference,
          planId,
        );

        await this.sessionService.updateStateAndStep(
          user.id,
          'BUY_PLAN',
          'AWAIT_RECEIPT_UPLOAD',
          { reference, selectedPlanId: planId },
        );

        return {
          text: {
            body: `✅ Your intent has been recorded.\nReference: ${reference}\nPlease make payment and upload your receipt within 24 hours.`,
          },
        };
      }

      if (input === 'NO' || input === 'CANCEL') {
        await this.sessionService.resetToMainMenu(user.id);
        return { text: { body: 'Purchase cancelled. Returning to main menu.' } };
      }

      return { text: { body: 'Please reply with "YES" or "NO".' } };
    }

    // STEP 4 — Handle receipt upload
    if (step === 'AWAIT_RECEIPT_UPLOAD') {
      // The upload handler will actually process the image message,
      // so here we just redirect if the user types anything else.
      return {
        text: {
          body: 'Please send your receipt image. I’ll confirm it once received.',
        },
      };
    }

    return {
      text: { body: 'Sorry, I didn’t get that. Please reply with a number from the menu.' },
    };
  }
}
