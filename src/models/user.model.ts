import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Subscription } from './subscription.model';
import { Transaction } from './transaction.model';
import { Receipt } from './receipt.model';
import { Session } from './session.model';
import { Printer } from './printer.model';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  phone: string;

  @Column(DataType.STRING)
  name: string;

  @Column({
    type: DataType.ENUM('student', 'printer', 'admin'),
    allowNull: false,
    defaultValue: 'student',
  })
  role: 'student' | 'printer' | 'admin';

  @Column({
    type: DataType.ENUM('active', 'suspended', 'pending'),
    defaultValue: 'pending',
  })
  status: 'active' | 'suspended' | 'pending';

  @HasMany(() => Subscription)
  subscriptions: Subscription[];

  @HasMany(() => Transaction)
  transactions: Transaction[];

  @HasMany(() => Receipt)
  receipts: Receipt[];

  @HasMany(() => Session)
  sessions: Session[];

  @HasMany(() => Printer)
  printers: Printer[];
}
