// src/modules/whatsapp/handlers/make-transaction.handler.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SessionService } from '../../sessions/sessions.service';
import { CalculationsService } from '../../calculations/calculations.service';
import { UsersService } from '../../users/users.service';
import { InjectModel } from '@nestjs/sequelize';
import { Printer } from '../../../models/printer.model';
import { randomUUID } from 'crypto';

@Injectable()
export class MakeTransactionHandler {
  constructor(
    private readonly logger = new Logger(MakeTransactionHandler.name),
    private readonly sessionService: SessionService,
    private readonly calcService: CalculationsService,
    private readonly usersService: UsersService,
    @InjectModel(Printer) private readonly printerModel: typeof Printer,
  ) {}

  // STEP 1️⃣: Ask for print/copy request
  async requestUsage(userId: string) {
    await this.sessionService.updateStateAndStep(
      userId,
      'USAGE_REQUEST',
      'AWAIT_USAGE',
    );

    return {
      text: {
        body:
          `🖨 Please enter your request in this format:\n\n` +
          `• "print 15"\n` +
          `• "copy 10"\n` +
          `• "print 10 copy 5"\n\n` +
          `I'll show you available printers for your location.`,
      },
    };
  }

  // STEP 2️⃣: Handle usage input and show printer list
  async handleUsage(userId: string, message: string) {
    const input = message.toLowerCase();
    const printMatch = input.match(/print\s*(\d+)/);
    const copyMatch = input.match(/copy\s*(\d+)/);

    const printingPages = printMatch ? parseInt(printMatch[1]) : 0;
    const photocopyPages = copyMatch ? parseInt(copyMatch[1]) : 0;

    if (!printingPages && !photocopyPages) {
      throw new BadRequestException(
        'Please specify how many pages you want to print or copy.',
      );
    }

    const user = await this.usersService.findById(userId);
    if (!user?.location)
      throw new BadRequestException('Your account has no location set.');

    const printers = await this.printerModel.findAll({
      where: { location: user.location },
    });

    if (!printers.length)
      throw new BadRequestException(
        'No printers available in your location at the moment.',
      );

    // Save user’s request context
    await this.sessionService.updateStateAndStep(
      userId,
      'USAGE_REQUEST',
      'AWAIT_PRINTER_SELECTION',
      { printingPages, photocopyPages, printers },
    );

    const printerList = printers
      .map((p, i) => `${i + 1}. ${p.name}`) // (${p.address || 'no address'})
      .join('\n');

    return {
      text: {
        body:
          `📍 Available Printers near you (${user.location}):\n\n` +
          printerList +
          `\n\nPlease reply with the printer number to continue.`,
      },
    };
  }

  // STEP 3️⃣: Handle printer selection and show estimate
  async handlePrinterSelection(userId: string, message: string) {
    const session = await this.sessionService.getOrCreate(userId);
    this.logger.log(
      `Session for handling printer selection: state=${session.state}, step=${session.step}, check 3`,
    );
    const { printingPages, photocopyPages, printers } = session.context;

    const selectedIndex = parseInt(message.trim()) - 1;
    if (isNaN(selectedIndex) || !printers[selectedIndex]) {
      return {
        text: {
          body: `❌ Invalid choice. Please reply with a valid printer number.`,
        },
      };
    }

    const printer = printers[selectedIndex];
    const serviceType =
      printingPages && photocopyPages
        ? 'mixed'
        : printingPages
          ? 'printing'
          : 'photocopy';

    const estimate = await this.calcService.estimate(
      userId,
      printer.id,
      serviceType,
      printingPages,
      photocopyPages,
    );

    await this.sessionService.updateStateAndStep(
      userId,
      'USAGE_REQUEST',
      'CONFIRM_USAGE',
      {
        printingPages,
        photocopyPages,
        printerId: printer.id,
        serviceType,
        estimate,
      },
    );

    return {
      text: {
        body:
          `📊 *Estimate Summary:*\n` +
          `Printer: ${printer.name}\n` +
          `Service: ${serviceType}\n` +
          `Printing: ${printingPages} pages\n` +
          `Photocopy: ${photocopyPages} pages\n` +
          `Total Cost: ₦${estimate.totalCost}\n\n` +
          `Reply *confirm* to proceed or *cancel* to return to menu.`,
      },
    };
  }

  // STEP 4️⃣: Confirm or cancel transaction
  async confirmUsage(userId: string, message: string) {
    const session = await this.sessionService.getOrCreate(userId);
    this.logger.log(
      `Session for handling usage confirmation: state=${session.state}, step=${session.step}, check 4`,
    );
    const { printingPages, photocopyPages, printerId, serviceType } =
      session.context;

    if (message.toLowerCase() === 'cancel') {
      await this.sessionService.updateStateAndStep(
        userId,
        'MAIN_MENU',
        'SHOW_OPTIONS',
      );
      return {
        text: { body: '❌ Transaction cancelled. Type *menu* to return.' },
      };
    }

    if (message.toLowerCase() === 'confirm') {
      const ref = `TX-${randomUUID().slice(0, 8).toUpperCase()}`;
      const result = await this.calcService.deduct(
        userId,
        printerId,
        serviceType,
        printingPages,
        photocopyPages,
        ref,
      );

      await this.sessionService.updateStateAndStep(
        userId,
        'MAIN_MENU',
        'SHOW_OPTIONS',
      );

      return {
        text: {
          body:
            `✅ Transaction recorded!\n\n` +
            `Service: ${serviceType}\n` +
            `Total Cost: ₦${result.totalCost}\n` +
            `Ref: ${ref}\n\n` +
            `Remaining balances:\n` +
            `Printing: ${result.updatedPrintingRemaining} pages\n` +
            `Photocopy: ${result.updatedPhotocopyRemaining} pages`,
        },
      };
    }

    return { text: { body: 'Please reply *confirm* or *cancel*.' } };
  }
}
