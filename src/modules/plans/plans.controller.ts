// src/modules/plans/plans.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './create-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  async create(@Body() dto: CreatePlanDto) {
    return this.plansService.createPlan(dto);
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

  // @Get('seed')
  // async seed() {
  //   return this.plansService.seed();
  // }