import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  amount: string;

  @IsDateString()
  date: Date;
}
