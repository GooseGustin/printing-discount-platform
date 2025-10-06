import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  printingTotalPages: number;

  @IsNumber()
  printingEffectiveRate: number;

  @IsArray()
  printingWeeklyCaps: number[];

  @IsNumber()
  printingInitialCap: number;

  @IsNumber()
  photocopyTotalPages: number;

  @IsNumber()
  photocopyEffectiveRate: number;

  @IsArray()
  photocopyWeeklyCaps: number[];

  @IsNumber()
  photocopyInitialCap: number;

  @IsString()
  duration: 'monthly' | 'weekly';

  @IsString()
  location: string; // e.g. "UNIJOS-PLATEAU"
}
