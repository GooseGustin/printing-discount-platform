import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Session } from '../../models/session.model';

@Injectable()
export class SessionService {
  constructor(@InjectModel(Session) private readonly sessionModel: typeof Session) {}

  /**
   * Retrieve existing session or create a fresh one.
   * Automatically resets if expired.
   */
  async getOrCreate(userId: string) {
    let session = await this.sessionModel.findOne({ where: { userId } });
    const now = new Date();

    if (session) {
      if (session.expiresAt && session.expiresAt < now) {
        // expired → reset
        session.state = 'MAIN_MENU';
        session.step = 'SHOW_OPTIONS';
        session.context = {};
      }
      session.lastActiveAt = now;
      session.expiresAt = this.extendExpiry();
      await session.save();
      return session;
    }

    // new session
    session = await this.sessionModel.create({
      userId,
      state: 'MAIN_MENU',
      step: 'SHOW_OPTIONS',
      context: {},
      lastActiveAt: now,
      expiresAt: this.extendExpiry(),
    });

    return session;
  }

  /**
   * Update both state and step (e.g. moving between menus)
   */
  async updateStateAndStep(userId: string, state: string, step: string, context: any = {}) {
    const session = await this.getOrCreate(userId);
    session.state = state;
    session.step = step;
    session.context = { ...session.context, ...context };
    session.lastActiveAt = new Date();
    session.expiresAt = this.extendExpiry();
    await session.save();
    return session;
  }

  /**
   * Update only the step (useful for sub-stage transitions)
   */
  async updateStep(userId: string, step: string, context: any = {}) {
    const session = await this.getOrCreate(userId);
    session.step = step;
    session.context = { ...session.context, ...context };
    session.lastActiveAt = new Date();
    session.expiresAt = this.extendExpiry();
    await session.save();
    return session;
  }

  /**
   * Merge new data into the session context
   */
  async setContext(userId: string, key: string, value: any) {
    const session = await this.getOrCreate(userId);
    session.context = { ...session.context, [key]: value };
    session.lastActiveAt = new Date();
    session.expiresAt = this.extendExpiry();
    await session.save();
    return session;
  }

  /**
   * Retrieve full or partial context
   */
  async getContext(userId: string, key?: string) {
    const session = await this.getOrCreate(userId);
    return key ? session.context?.[key] : session.context;
  }

  /**
   * Remove one or all keys from context
   */
  async clearContext(userId: string, key?: string) {
    const session = await this.getOrCreate(userId);
    if (key) {
      const ctx = { ...session.context };
      delete ctx[key];
      session.context = ctx;
    } else {
      session.context = {};
    }
    session.lastActiveAt = new Date();
    session.expiresAt = this.extendExpiry();
    await session.save();
    return session;
  }

  /**
   * Reset everything back to the main menu
   */
  async resetToMainMenu(userId: string) {
    const session = await this.getOrCreate(userId);
    session.state = 'MAIN_MENU';
    session.step = 'SHOW_OPTIONS';
    session.context = {};
    session.lastActiveAt = new Date();
    session.expiresAt = this.extendExpiry();
    await session.save();
    return session;
  }

  /**
   * Extend expiry by 15 minutes from now
   */
  private extendExpiry() {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    return expiry;
  }
}
