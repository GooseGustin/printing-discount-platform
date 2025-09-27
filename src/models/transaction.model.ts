// src/models/transaction.model.ts
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
import { Printer } from './printer.model';

@Table
export class Transaction extends Model<Transaction> {
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

  @ForeignKey(() => Printer)
  @Column(DataType.UUID)
  printerId: string;

  @BelongsTo(() => Printer)
  printer: Printer;

  @Column({
    type: DataType.ENUM('payment', 'usage', 'refund'),
    allowNull: false,
  })
  type: 'payment' | 'usage' | 'refund';

  @Column({
    type: DataType.ENUM('printing', 'photocopy', 'mixed'),
    allowNull: true,
  })
  serviceType: 'printing' | 'photocopy' | 'mixed';

  @Column(DataType.INTEGER)
  pages: number;

  @Column(DataType.INTEGER)
  amount: number;

  @Column(DataType.STRING)
  description: string;

  @Column(DataType.STRING) // optional external reference
  reference: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;
}
