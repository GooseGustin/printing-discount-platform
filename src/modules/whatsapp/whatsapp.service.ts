import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { SessionService } from '../sessions/sessions.service';
import { MainMenuHandler } from './handlers/main-menu.handler';
import { BuyPlanHandler } from './handlers/buy-plan.handler';
import { ReceiptUploadHandler } from './handlers/receipt-upload.handler';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  private apiUrl = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly mainMenuHandler: MainMenuHandler,
    private readonly buyPlanHandler: BuyPlanHandler,
    private readonly receiptUploadHandler: ReceiptUploadHandler,
  ) {}

  async handleIncomingMessage(from: string, message: any, type: string) {
    const user = await this.usersService.findByPhone(from);
    if (!user) {
      await this.sendMessage(
        from,
        `👋 You don’t seem registered yet. Please create an account first.`,
      );
      return;
    }

    const session = await this.sessionService.getOrCreate(user.id);
    this.logger.log(
      `Session for ${user.name} (${from}): state=${session.state}, step=${session.step}, check 1`,
    );

    let reply: any;

    // handle text-based menu
    if (type === 'text') {
      if (['hi', 'menu'].includes(message.trim().toLowerCase())) {
        reply = await this.mainMenuHandler.showMenu(user.id);
      } else {
        switch (session.state) {
          case 'MAIN_MENU':
            reply = await this.mainMenuHandler.handleResponse(user.id, message);
            break;

          case 'BUY_PLAN':
            reply = await this.buyPlanHandler.handleResponse(
              user.phone,
              message,
            );
            break;

          case 'UPLOAD_RECEIPT':
            reply = await this.receiptUploadHandler.handleResponse(
              user.id,
              message,
              type,
            );
            break;

          default:
            reply = {
              text: {
                body: 'Sorry, I didn’t get that. Type "menu" to return.',
              },
            };
        }
      }
    } else if (type === 'image') {
      // handle image uploads separately
      this.logger.log(
        `Session for ${user.name} (${from}): state=${session.state}, step=${session.step}, check 2`,
      );
      if (session.state === 'UPLOAD_RECEIPT') {
        reply = await this.receiptUploadHandler.handleResponse(
          user.id,
          message,
          type,
        );
      } else {
        reply = {
          text: {
            body: 'Unexpected image. Please use this option only to upload your receipt.',
          },
        };
      }
    }

    // send final response
    if (reply?.text?.body) await this.sendMessage(from, reply.text.body);
  }

  async sendMessage(to: string, text: string) {
    try {
      await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to,
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Message sent to ${to}: ${text}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message to ${to}`,
        error.response?.data || error.message,
      );
    }
  }
}

//  async handleIncomingMessage(phone: string, text: string) {
//     // 1️⃣ Find user
//     const user = await this.usersService.findByPhone(phone);
//     if (!user) {
//       await this.sendMessage(
//         phone,
//         'Welcome to CopyWise! Please register first or contact support to get started.',
//       );
//       return;
//     }

//     // 2️⃣ Get session
//     const session = await this.sessionService.getOrCreate(user.id);
//     const state = session.state || 'MAIN_MENU';
//     const step = session.step || 'INIT';

//     this.logger.log(`Session for ${user.name} ${phone}: state=${state}, step=${step}`);

//     // 3️⃣ Special case — reset to menu
//     if (text.toLowerCase() === 'menu' || text.toLowerCase() === 'hi') {
//       const menu = await this.mainMenuHandler.showMenu(user.id);
//       await this.sendMessage(phone, menu.text.body);
//       return;
//     }

//     // 4️⃣ Route by state
//     let response;

//     switch (state) {
//       case 'MAIN_MENU':
//         response = await this.mainMenuHandler.handleResponse(user.id, text);
//         break;

//       case 'BUY_PLAN':
//         response = await this.buyPlanHandler.handleResponse(phone, text);
//         break;

//       case 'UPLOAD_RECEIPT':
//         response = await this.uploadReceiptHandler.handleResponse(phone, text);
//         break;

//       default:
//         response = {
//           text: { body: "Sorry, I didn't understand that. Type 'menu' to see options." },
//         };
//         break;
//     }

//     // 5️⃣ Send reply to user
//     await this.sendMessage(phone, response.text.body);
//   }
