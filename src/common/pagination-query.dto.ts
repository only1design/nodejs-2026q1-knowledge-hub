import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  'ASC' = 'asc',
  'DESC' = 'desc',
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit?: number;

  @IsOptional()
  @IsString()
  readonly sortBy?: string;

  @IsOptional()
  @IsEnum(SortBy)
  readonly order?: SortBy;
}
