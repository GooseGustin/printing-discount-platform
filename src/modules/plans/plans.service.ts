// src/modules/plans/plans.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Plan } from '../../models/plan.model';
import { CreatePlanDto } from './create-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan)
    private readonly planModel: typeof Plan,
  ) {}
  
  async createPlan(dto: CreatePlanDto) {
    return this.planModel.create(dto);
  }

  async findAll(): Promise<Plan[]> {
    return this.planModel.findAll();
  }

  async findById(id: string): Promise<Plan> {
    return this.planModel.findByPk(id);
  }

  async findByLocation(location: string): Promise<Plan[]> {
    return this.planModel.findAll({ where: { location } });
  }
}

  // async seed() {
  //   await this.planModel.bulkCreate([
  //     {
  //       name: '₦1000 UJ Plan',
  //       price: 1000,
  //       printingTotalPages: 22,
  //       photocopyTotalPages: 37,
  //       printingWeeklyCaps: [10, 7, 7, 7],      // week 1 cap, week 2–4 caps
  //       photocopyWeeklyCaps: [15, 10, 10, 10],
  //     },
  //     {
  //       name: '₦2000 UJ Plan',
  //       price: 2000,
  //       printingTotalPages: 45,
  //       photocopyTotalPages: 75,
  //       printingWeeklyCaps: [20, 13, 13, 13],
  //       photocopyWeeklyCaps: [30, 20, 20, 20],
  //     },
  //     {
  //       name: '₦3500 UJ Plan',
  //       price: 3500,
  //       printingTotalPages: 81,
  //       photocopyTotalPages: 133,
  //       printingWeeklyCaps: [30, 20, 20, 20],
  //       photocopyWeeklyCaps: [45, 30, 30, 30],
  //     },
  //     {
  //       name: '₦5000 UJ Plan',
  //       price: 5000,
  //       printingTotalPages: 120,
  //       photocopyTotalPages: 200,
  //       printingWeeklyCaps: [40, 30, 30, 30],
  //       photocopyWeeklyCaps: [60, 50, 50, 50],
  //     },
  //   ]);
  // }
