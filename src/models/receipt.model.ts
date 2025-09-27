// src/models/receipt.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Transaction } from './transaction.model';
import { User } from './user.model';

@Table
export class Receipt extends Model<Receipt> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Transaction)
  @Column(DataType.UUID)
  transactionId: string;

  @BelongsTo(() => Transaction)
  transaction: Transaction;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @Column(DataType.STRING)
  fileUrl: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';
}
