import { SortDirection } from '@core/@shared/domain/repository/search-params';
import {
  CastMemberFilter,
  ListCastMembersInput,
} from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class CastMemberFilterDto implements CastMemberFilter {
  @IsString()
  @IsOptional()
  name?: string | null;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  type?: number | null;
}

export class SearchCastMembersDto implements ListCastMembersInput {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page?: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  per_page?: number;

  @IsString()
  @IsOptional()
  sort?: string | null;

  @IsString()
  @IsOptional()
  sort_dir?: SortDirection | null;

  @ValidateNested()
  @Type(() => CastMemberFilterDto)
  @IsOptional()
  filter?: CastMemberFilterDto;
}
