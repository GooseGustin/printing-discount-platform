// src/modules/whatsapp/handlers/view-history.handler.ts
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { SessionService } from '../../sessions/sessions.service';

@Injectable()
export class ViewHistoryHandler {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    private readonly sessionService: SessionService,
  ) {}

  async handleResponse(userPhone: string) {
    const user = await this.usersService.findByPhone(userPhone);
    if (!user) {
      return {
        text: { body: '⚠️ You are not registered. Please create an account first.' },
      };
    }

    const transactions = await this.transactionsService.getRecentTransactions(user.id, 4);

    if (!transactions.length) {
      return { text: { body: '📭 You have no recent transactions.' } };
    }

    let summary = '📜 *Your Recent Transactions*\n\n';

    for (const tx of transactions) {
      const date = new Date(tx.createdAt).toLocaleDateString();
      const statusEmoji =
        tx.status === 'approved'
          ? '✅'
          : tx.status === 'pending'
          ? '⏳'
          : '❌';
      const amount = tx.amount ? `₦${tx.amount}` : '—';
      const typeLabel =
        tx.type === 'payment'
          ? '💳 Payment'
          : tx.type === 'usage'
          ? '🖨 Usage'
          : '↩️ Refund';

      // Plan and printer details (if present)
      const planName = tx.plan ? tx.plan.name : '—';
      const printerName = tx.printer ? tx.printer.name : '—';

      summary += `${statusEmoji} *${typeLabel}* — ${amount}\n` +
                 `🗓 ${date}\n` +
                 (tx.description ? `📝 ${tx.description}\n` : '') +
                 `📘 Plan: ${planName}\n` +
                 `🖨 Printer: ${printerName}\n` +
                 `📍 Status: ${tx.status.toUpperCase()}\n\n`;
    }

    summary += `To view more details, visit your dashboard or reply 'menu' to go back.`;

    await this.sessionService.updateStateAndStep(user.id, 'MAIN_MENU', 'SHOW_OPTIONS');

    return { text: { body: summary } };
  }
}
