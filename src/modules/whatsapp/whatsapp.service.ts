import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { SessionService } from '../sessions/sessions.service';
import { MainMenuHandler } from './handlers/main-menu.handler';
import { BuyPlanHandler } from './handlers/buy-plan.handler';
import { ReceiptUploadHandler } from './handlers/receipt-upload.handler';
import { AdminHandler } from './handlers/admin.handler';
import { CheckBalanceHandler } from './handlers/check-balance.handler';
import { ViewHistoryHandler } from './handlers/view-history.handler';
import { MakeTransactionHandler } from './handlers/make-transaction.handler';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  private apiUrl = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  private isAdmin(phone: string): boolean {
    const admins = (process.env.ADMIN_PHONES || '')
      .split(',')
      .map((p) => p.trim());
    return admins.includes(phone);
  }

  private generateDailyCode(): string {
    const today = new Date();
    const datePart = `${today.getDate()}${today.getMonth() + 1}`; // e.g., 610 for Oct 6
    return `ADMIN-${datePart}`;
  }

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly mainMenuHandler: MainMenuHandler,
    private readonly buyPlanHandler: BuyPlanHandler,
    private readonly checkBalanceHandler: CheckBalanceHandler,
    private readonly receiptUploadHandler: ReceiptUploadHandler,
    private readonly viewHistoryHandler: ViewHistoryHandler,
    private readonly adminHandler: AdminHandler,
    private readonly makeTransactionHandler: MakeTransactionHandler,
  ) {}

  async handleIncomingMessage(from: string, message: any, type: string) {
    if (this.isAdmin(from)) {
      const input = message.trim().toUpperCase();

      if (input === this.generateDailyCode()) {
        try {
          const response =
            await this.adminHandler.showPendingTransactions(from);

          if (response?.text?.body) {
            await this.sendMessage(from, response.text.body);
          } else {
            await this.sendMessage(
              from,
              '✅ No pending transactions right now.',
            );
          }
        } catch (err) {
          this.logger.error('Failed to fetch pending transactions', err);
          await this.sendMessage(
            from,
            '⚠️ Error fetching pending transactions. Please try again later.',
          );
        }
      }
    }

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

          case 'CHECK_BALANCE':
            reply = await this.checkBalanceHandler.handleResponse(user.phone);
            break;

          case 'USAGE_REQUEST':
            if (session.step === 'AWAIT_USAGE') {
              reply = await this.makeTransactionHandler.handleUsage(
                user.id,
                message,
              );
            } else if (session.step === 'AWAIT_PRINTER_SELECTION') {
              reply = await this.makeTransactionHandler.handlePrinterSelection(
                user.id,
                message,
              );
            } else if (session.step === 'CONFIRM_USAGE') {
              reply = await this.makeTransactionHandler.confirmUsage(
                user.id,
                message,
              );
            }
            break;

          default:
            if (!this.isAdmin(from)) {
              reply = {
                text: {
                  body: `I didn’t quite get that. Please type "menu" to see your options.`,
                },
              };
            }
        }
      }
    } else if (type === 'image') {
      // handle image uploads separately
      this.logger.log(
        `Session for ${user.name} (${from}): state=${session.state}, step=${session.step}, check 2`,
      );
      if (
        session.state === 'BUY_PLAN' &&
        session.step === 'AWAIT_RECEIPT_UPLOAD'
      ) {
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

    // send first response
    if (reply?.text?.body) await this.sendMessage(from, reply.text.body);

    // If triggerNext was set, call the next handler immediately
    if (reply?.triggerNext) {
      const updatedSession = await this.sessionService.getOrCreate(user.id);
      let followUp: any;
      switch (updatedSession.state) {
        case 'BUY_PLAN':
          followUp = await this.buyPlanHandler.handleResponse(user.phone, '');
          if (followUp?.text?.body)
            await this.sendMessage(from, followUp.text.body);
          break;

        case 'CHECK_BALANCE':
          followUp = await this.checkBalanceHandler.handleResponse(user.phone);

          if (followUp?.text?.body)
            await this.sendMessage(from, followUp.text.body);
          break;

        case 'VIEW_HISTORY':
          followUp = await this.viewHistoryHandler.handleResponse(user.phone);

          if (followUp?.text?.body)
            await this.sendMessage(from, followUp.text.body);
          break;
      }
    }
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

  async sendMessageTemplate(
    to: string,
    templateName: string,
    components: any = {},
  ) {
    try {
      await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: Object.entries(components).map(([_, v]) => ({
                  type: 'text',
                  text: String(v),
                })),
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      this.logger.error(
        'Failed to send template message',
        err.response?.data || err.message,
      );
    }
  }
}
