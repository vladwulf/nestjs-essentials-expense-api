import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max } from 'class-validator';

export class PaginateDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Max(20)
  limit = 20;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Max(1000)
  offset = 0;
}
