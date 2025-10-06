import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { Plan } from '../models/plan.model';
import { Printer } from '../models/printer.model';
import { User } from '../models/user.model';

async function seed() {
  // Create Sequelize instance pointing to Supabase Postgres
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    models: [Plan, Printer],
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: console.log, // helpful to see SQL queries
  });

  await sequelize.authenticate();
  console.log('✅ Connected to Supabase');

  await sequelize.sync({ force: true });

    // Seed Users
  const student = await User.create({
    name: 'Test Student',
    phone: '08010000001',
    role: 'student',
    status: 'active',
  });

  const printerUser1 = await User.create({
    name: 'Printer User Alpha',
    phone: '08020000002',
    role: 'printer',
    status: 'active',
  });

  const printerUser2 = await User.create({
    name: 'Printer User Beta',
    phone: '08020000003',
    role: 'printer',
    status: 'active',
  });

  const admin = await User.create({
    name: 'System Admin',
    phone: '08030000004',
    role: 'admin',
    status: 'active',
  });

  // Seed Printers (linked to the printer users above)
  const printer1 = await Printer.create({
    userId: printerUser1.id,
    name: 'Printer Alpha - Unijos Campus',
    location: 'UNIJOS-PLATEAU',
    baseCostPrinting: 50,
    discountedPricePrinting: 45,
    baseCostPhotocopy: 40,
    discountedPricePhotocopy: 36,
    contactPhone: '08012345678',
  });

  const printer2 = await Printer.create({
    userId: printerUser2.id,
    name: 'Printer Beta - Unijos Campus',
    location: 'UNIJOS-PLATEAU',
    baseCostPrinting: 55,
    discountedPricePrinting: 47,
    baseCostPhotocopy: 35,
    discountedPricePhotocopy: 30,
    contactPhone: '08012345348',
  });

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
      location: 'UNIJOS-PLATEAU',
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
      location: 'UNIJOS-PLATEAU',
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
      location: 'UNIJOS-PLATEAU',
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
      location: 'UNIJOS-PLATEAU',
    },
    {
      name: '₦1,000 Plan',
      price: 1000,
      printingTotalPages: 22,
      printingEffectiveRate: 45,
      printingWeeklyCaps: [7, 6, 6, 6],
      printingInitialCap: 10,
      photocopyTotalPages: 27,
      photocopyEffectiveRate: 36,
      photocopyWeeklyCaps: [7, 7, 7, 7],
      photocopyInitialCap: 15,
      duration: 'monthly',
      location: 'POLY-PLATEAU',
    },
  ], 
  { ignoreDuplicates: true }
  );

  console.log('✅ Seeding complete.');
  await sequelize.close();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
});
