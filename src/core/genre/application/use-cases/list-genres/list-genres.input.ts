import { SortDirection } from '@core/@shared/domain/repository/search-params';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class ListGenresFilter {
  name?: string;

  @IsUUID('4', { each: true })
  @IsOptional()
  categories_id?: string[];
}

export class ListGenresInput {
  page?: number;

  per_page?: number;

  sort?: string;

  sort_dir?: SortDirection;

  @ValidateNested()
  @Type(() => ListGenresFilter)
  @IsOptional()
  filter?: ListGenresFilter;
}
