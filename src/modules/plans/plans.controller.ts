// src/modules/plans/plans.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get('seed')
  async seed() {
    return this.plansService.seed();
  }

  @Get()
  async getPlans() {
    return this.plansService.findAll();
  }

  @Get(':id')
  async getPlan(@Param('id') id: string) {
    return this.plansService.findById(id);
  }
}
