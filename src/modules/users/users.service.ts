import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../models/user.model';

import { Logger } from '@nestjs/common';
import { Printer } from '@/models/printer.model';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('User');

  constructor(
    @InjectModel(User) private readonly userModel: typeof User, 
    @InjectModel(Printer) private readonly printerModel: typeof Printer,
  ) {}

  async createStudent(phone: string, name: string) {
    const user = await this.userModel.findOne({
      where: { phone },
    });
    if (user) {
      throw new BadRequestException(
        'Cannot create multiple users with same phone number',
      );
    }
    return this.userModel.create({ phone, name, role: 'student' });
  }

  async createPrinter(data: {
    name: string;
    location: string;
    baseCostPrinting: number;
    discountedPricePrinting: number;
    baseCostPhotocopy: number;
    discountedPricePhotocopy: number;
    contactPhone: string;
  }) {
    // Step 1. Create user
    const user = await this.userModel.create({
      phone: data.contactPhone,
      name: data.name,
      role: 'printer',
      status: 'active',
    });

    // Step 2. Create printer profile
    const printer = await this.printerModel.create({
      userId: user.id,
      name: data.name,
      location: data.location,
      baseCostPrinting: data.baseCostPrinting,
      discountedPricePrinting: data.discountedPricePrinting,
      baseCostPhotocopy: data.baseCostPhotocopy,
      discountedPricePhotocopy: data.discountedPricePhotocopy,
      contactPhone: data.contactPhone,
    });

    return { user, printer };
  }

  async findAll() {
    this.logger.debug('In find all users');
    return this.userModel.findAll();
  }

  async findAllPrinters() {
    return this.printerModel.findAll();
  }

  async findById(id: string) {
    return this.userModel.findByPk(id);
  }
}
