import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Session extends Model<Session> {
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

  @Column(DataType.STRING) // e.g. 'awaiting_receipt_upload'
  currentState: string;

  @Column(DataType.JSON)
  context: object;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  lastActiveAt: Date;
}
