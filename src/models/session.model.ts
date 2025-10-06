import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'Sessions' })
export class Session extends Model<Session> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,  // ✅ auto-generate UUIDs
    primaryKey: true,
  })
  id: string;
  
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @Column(DataType.STRING) // e.g., 'MAIN_MENU', 'BUY_PLAN', 'UPLOAD_RECEIPT'
  state: string;

  @Column(DataType.STRING) // e.g., 'AWAIT_SELECTION', 'AWAIT_CONFIRMATION'
  step: string;

  @Column(DataType.JSONB) // arbitrary data like { selectedPlanId: 'p1', reference: 'TXN123' }
  context: any;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  lastActiveAt: Date;

  @Column(DataType.DATE)
  expiresAt: Date;
}
