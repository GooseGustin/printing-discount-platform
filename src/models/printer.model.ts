import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Printer extends Model<Printer> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column(DataType.STRING)
  name: string; // e.g. "Printer A - Abuja Campus"

  @Column(DataType.STRING)
  location: string; // e.g. "Abuja"
  
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  // Base costs (normal prices without plan)
  @Column(DataType.FLOAT)
  baseCostPrinting: number;

  @Column(DataType.FLOAT)
  baseCostPhotocopy: number;

  // Optional overrides
  @Column(DataType.FLOAT)
  discountedPricePrinting: number;

  @Column(DataType.FLOAT)
  discountedPricePhotocopy: number;

  @Column(DataType.STRING)
  contactPhone: string;
}
