import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Transaction } from './transaction.model';

@Table({ tableName: 'Receipts' })
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

  @BelongsTo(() => User)
  user: User;

  @Column(DataType.STRING)
  imageUrl: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;
}
