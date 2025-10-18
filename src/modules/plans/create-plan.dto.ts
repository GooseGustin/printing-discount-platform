import { IsString, IsIn, IsNumber, IsArray, IsOptional } from 'class-validator';

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

  @IsOptional()
  @IsIn(['monthly'])
  duration: 'monthly' = 'monthly';

  @IsString()
  location: string; // e.g. "UNIJOS-PLATEAU"
}
