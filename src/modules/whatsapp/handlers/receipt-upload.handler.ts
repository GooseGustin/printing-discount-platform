import { Injectable, BadRequestException } from '@nestjs/common';
import { SessionService } from '../../sessions/sessions.service';
import { ReceiptsService } from '../../receipts/receipts.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ReceiptUploadHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly receiptsService: ReceiptsService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Called when user is at UPLOAD_RECEIPT step.
   * Message may contain either image attachment or invalid input.
   */
  async handleResponse(userPhone: string, message: any) {
    const user = await this.usersService.findByPhone(userPhone);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const session = await this.sessionService.getOrCreate(user.id);

    // Ensure the session is in the correct state
    if (
      !['UPLOAD_RECEIPT', 'BUY_PLAN'].includes(session.step) &&
      session.context?.step !== 'AWAIT_RECEIPT_UPLOAD'
    ) {
      return {
        text: {
          body: `You’re not currently uploading a receipt. Please type "menu" to go back to the main menu.`,
        },
      };
    }

    // Expecting an image message (WhatsApp provides image object in message)
    const imageUrl = message?.image?.url || message?.imageUrl;
    if (!imageUrl) {
      return {
        text: {
          body: `Please upload a valid image of your payment receipt.`,
        },
      };
    }

    try {
      const receipt = await this.receiptsService.uploadReceipt(
        user.id,
        imageUrl,
      );

      // Reset session after successful upload
      await this.sessionService.resetToMainMenu(user.id);

      return {
        text: {
          body: `✅ Receipt uploaded successfully!\n\nReference: ${receipt.transactionRef}\nStatus: Pending verification.\n\nYou’ll be notified once it’s approved.\n\nReply "menu" to go back to the main menu.`,
        },
      };
    } catch (error) {
      return {
        text: {
          body:
            error.message ||
            `❌ Failed to upload receipt. Please ensure you have a pending payment and try again.`,
        },
      };
    }
  }
}
