import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { EDUCATION_CATEGORIES } from '../types/education.type';

export class ArticleFiltersDto {
  @IsOptional()
  @IsIn(EDUCATION_CATEGORIES as unknown as string[])
  category?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  query?: string;
}

export class CategoryQueryDto {
  @IsOptional()
  @IsIn(EDUCATION_CATEGORIES as unknown as string[])
  category?: string;
}

export class RequiredCategoryDto {
  @IsIn(EDUCATION_CATEGORIES as unknown as string[])
  category!: string;
}

export class UpdateProgressDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  percentRead!: number;
}
