import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsDateString()
  @IsOptional()
  date?: Date;
}
