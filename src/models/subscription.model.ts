// src/models/subscription.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Plan } from './plan.model';

@Table
export class Subscription extends Model<Subscription> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Plan)
  @Column(DataType.UUID)
  planId: string;

  @BelongsTo(() => Plan)
  plan: Plan;

  @Column({
    type: DataType.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active',
  })
  status: 'active' | 'expired' | 'cancelled';

  // 🔑 Track current week of subscription
  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  weekNumber: number;

  // Remaining discounted allocations
  @Column(DataType.INTEGER)
  remainingPrintingPages: number;

  @Column(DataType.INTEGER)
  remainingPhotocopyPages: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  startDate: Date;

  @Column(DataType.DATE)
  endDate: Date;
}



  // Track week-by-week usage (JSON object)
//   @Column(DataType.JSON)
//   weeklyUsage: Record<
//     string,
//     { printingUsed: number; photocopyUsed: number }
//   >;
