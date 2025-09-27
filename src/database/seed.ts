// src/database/seed.ts
import { Sequelize } from 'sequelize-typescript';
import { Plan } from '../models/plan.model';
import { Printer } from '../models/printer.model';

async function seed() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'dev.sqlite',
    models: [Plan, Printer],
  });

  await sequelize.sync({ force: false });

  // Seed Plans
  await Plan.bulkCreate([
    {
      name: '₦1,000 Plan',
      price: 1000,
      printingTotalPages: 22,
      printingEffectiveRate: 45,
      printingWeeklyCaps: [7, 7, 7, 7],
      printingInitialCap: 10,
      photocopyTotalPages: 27,
      photocopyEffectiveRate: 36,
      photocopyWeeklyCaps: [7, 7, 7, 7],
      photocopyInitialCap: 15,
      duration: 'monthly',
    },
    {
      name: '₦2,000 Plan',
      price: 2000,
      printingTotalPages: 45,
      printingEffectiveRate: 43.75,
      printingWeeklyCaps: [13, 13, 13, 13],
      printingInitialCap: 20,
      photocopyTotalPages: 57,
      photocopyEffectiveRate: 35,
      photocopyWeeklyCaps: [15, 15, 15, 15],
      photocopyInitialCap: 30,
      duration: 'monthly',
    },
    {
      name: '₦3,500 Plan',
      price: 3500,
      printingTotalPages: 81,
      printingEffectiveRate: 43,
      printingWeeklyCaps: [21, 21, 21, 21],
      printingInitialCap: 30,
      photocopyTotalPages: 101,
      photocopyEffectiveRate: 34.4,
      photocopyWeeklyCaps: [25, 25, 25, 25],
      photocopyInitialCap: 45,
      duration: 'monthly',
    },
    {
      name: '₦5,000 Plan',
      price: 5000,
      printingTotalPages: 125,
      printingEffectiveRate: 40,
      printingWeeklyCaps: [32, 32, 32, 32],
      printingInitialCap: 40,
      photocopyTotalPages: 156,
      photocopyEffectiveRate: 32,
      photocopyWeeklyCaps: [39, 39, 39, 39],
      photocopyInitialCap: 60,
      duration: 'monthly',
    },
  ]);

  // Seed Printers
  await Printer.bulkCreate([
    {
      name: 'Printer A - Abuja Campus',
      location: 'Abuja',
      baseCostPrinting: 50,
      baseCostPhotocopy: 40,
      contactPhone: '08012345678',
    },
    {
      name: 'Printer B - Plateau Campus',
      location: 'Plateau',
      baseCostPrinting: 50,
      baseCostPhotocopy: 30,
      contactPhone: '08087654321',
    },
  ]);

  console.log('✅ Seeding complete.');
  await sequelize.close();
}

seed();
