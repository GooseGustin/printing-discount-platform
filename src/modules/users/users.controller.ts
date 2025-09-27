import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('student')
  async createStudent(@Body() body: { phone: string; name: string }) {
    return this.usersService.createStudent(body.phone, body.name);
  }

  @Post('printer')
  async createPrinter(@Body() body: {
    name: string;
    location: string;
    baseCostPrinting: number;
    baseCostPhotocopy: number;
    discountedPricePrinting: number;
    discountedPricePhotocopy: number;
    contactPhone: string;
  }) {
    return this.usersService.createPrinter(body);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('printer')
  async findAllPrinters() {
    return this.usersService.findAllPrinters();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
