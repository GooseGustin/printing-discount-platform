import { SessionService } from '../../sessions/sessions.service';

export class MainMenuHandler {
  constructor(private readonly sessionService: SessionService) {}

  async showMenu(userId: string) {
    // Reset session to main menu if necessary
    await this.sessionService.updateStateAndStep(userId, 'MAIN_MENU', 'SHOW_OPTIONS');

    return {
      text: {
        body: `Welcome to the CopyWise Platform! 🎉\n\nPlease choose an option:\n\n` +
              `1️⃣ Buy a Plan\n` +
              `2️⃣ Check Balance\n` +
              `3️⃣ View Plans\n` +
              `4️⃣ Print/Copy Pages\n` +
              `5️⃣ Upload Payment Receipt\n\n` +
              `Reply with the number of your choice.`,
      },
    };
  }

  async handleResponse(userId: string, message: string) {
    const input = message.trim();

    switch (input) {
      case '1':
        await this.sessionService.updateStateAndStep(userId, 'BUY_PLAN', 'SELECT_PLAN');
        return { text: { body: 'Great! Fetching available plans for your institution...' } };

      case '2':
        await this.sessionService.updateStateAndStep(userId, 'CHECK_BALANCE', 'SHOW_BALANCE');
        return { text: { body: 'Checking your balance, please wait...' } };

      case '3':
        await this.sessionService.updateStateAndStep(userId, 'VIEW_PLANS', 'SHOW_PLANS');
        return { text: { body: 'Fetching available plans for your location...' } };

      case '4':
        await this.sessionService.updateStateAndStep(userId, 'USAGE_REQUEST', 'AWAIT_USAGE');
        return { text: { body: 'Please type your request (e.g., "print 18", "copy 25", or "print 10 copy 5").' } };

    //   case '5':
    //     await this.sessionService.updateStateAndStep(userId, 'UPLOAD_RECEIPT', 'AWAIT_RECEIPT_IMAGE');
    //     return { text: { body: 'Please upload your payment receipt image now.' } };

      default:
        return { text: { body: 'Sorry, I didn’t get that. Please reply with a number from the menu.' } };
    }
  }
}
