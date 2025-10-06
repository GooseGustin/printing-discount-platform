// src/modules/whatsapp/message-router.service.ts
import { Injectable } from '@nestjs/common';
import { SessionService } from '../sessions/sessions.service';
import { MainMenuHandler } from './handlers/main-menu.handler';
import { BuyPlanHandler } from './handlers/buy-plan.handler';
import { ReceiptUploadHandler } from './handlers/receipt-upload.handler';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessageRouterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly mainMenuHandler: MainMenuHandler,
    private readonly buyPlanHandler: BuyPlanHandler,
    private readonly receiptUploadHandler: ReceiptUploadHandler,
  ) {}

  async handleIncomingMessage(payload: any) {
    const message = payload.messages?.[0];
    if (!message) return null;

    const userPhone = message.from;
    const type = message.type;
    const user = await this.usersService.findByPhone(userPhone);
    if (!user) return null;

    const session = await this.sessionService.getOrCreate(user.id);

    // 1️⃣ Handle receipt image uploads
    if (type === 'image' && session.step === 'AWAIT_RECEIPT_UPLOAD') {
      const imageUrl = message.image?.url;
      return this.receiptUploadHandler.handleReceiptUpload(user.id, imageUrl);
    }

    // 2️⃣ Handle text messages
    if (type === 'text') {
      const text = message.text?.body.trim();

      switch (session.step) {
        case 'MAIN_MENU':
          return this.mainMenuHandler.handleResponse(user.id, text);

        case 'BUY_PLAN':
        case 'AWAIT_CONFIRMATION':
          return this.buyPlanHandler.handleResponse(userPhone, text);

        default:
          // Fallback to menu
          return this.mainMenuHandler.showMenu(user.id);
      }
    }

    // 3️⃣ Unrecognized type (ignore)
    return { text: { body: 'Unsupported message type.' } };
  }
}
