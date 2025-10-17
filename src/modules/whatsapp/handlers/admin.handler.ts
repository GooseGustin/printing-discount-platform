import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TransactionsService } from '../../transactions/transactions.service';
import { UsersService } from '../../users/users.service';
import { ReceiptsService } from '../../receipts/receipts.service';

@Injectable()
export class AdminHandler {
  constructor(
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly receiptsService: ReceiptsService,
  ) {}

  async showPendingTransactions(adminPhone: string) {
    const pending = await this.transactionsService.findPending();
    if (!pending.length)
      return { text: { body: '✅ No pending transactions at the moment.' } };

    let message = `🧾 *Pending Transactions (${pending.length})*\n\n`;

    for (const tx of pending) {
      const user = await this.usersService.findById(tx.userId);
      const receipt = await this.receiptsService.findByTransactionId(tx.id);

      const approveUrl = `${process.env.APP_BASE_URL}/transactions/${tx.id}/approve`;
      const rejectUrl = `${process.env.APP_BASE_URL}/transactions/${tx.id}/reject`;

      message +=
        `👤 *${user.name}*\n` +
        `📞 ${user.phone}\n` +
        `🏫 ${user.location}\n` +
        `💰 ₦${tx.amount}\n` +
        (receipt
          ? `🧾 Receipt: ${receipt.imageUrl}\n`
          : `⚠️ No receipt uploaded yet.\n`) +
        `\n✅ Approve: ${approveUrl}\n❌ Reject: ${rejectUrl}\n\n`;
    }

    return { text: { body: message } };
  }
}
