import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Plan extends Model<Plan> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column(DataType.STRING)
  name: string; // e.g. "₦2000 Plan"

  @Column(DataType.INTEGER)
  price: number; // price in naira

  // Printing-specific allowances
  @Column(DataType.INTEGER)
  printingTotalPages: number;

  @Column(DataType.FLOAT)
  printingEffectiveRate: number; // discounted rate per page

  @Column(DataType.JSON)
  printingWeeklyCaps: number[]; // e.g. [13,13,13,13]

  @Column(DataType.INTEGER)
  printingInitialCap: number; // week 1 cap

  // Photocopy-specific allowances
  @Column(DataType.INTEGER)
  photocopyTotalPages: number;

  @Column(DataType.FLOAT)
  photocopyEffectiveRate: number;

  @Column(DataType.JSON)
  photocopyWeeklyCaps: number[];

  @Column(DataType.INTEGER)
  photocopyInitialCap: number;

  @Column({
    type: DataType.ENUM('weekly', 'monthly'),
    defaultValue: 'monthly',
  })
  duration: 'weekly' | 'monthly';
}
