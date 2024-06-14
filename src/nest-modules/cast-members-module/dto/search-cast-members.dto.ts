import { SortDirection } from '@core/@shared/domain/repository/search-params';
import {
  CastMemberFilter,
  ListCastMembersInput,
} from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CastMemberFilterDto implements CastMemberFilter {
  @IsString()
  @IsOptional()
  name?: string | null;

  @IsNumber()
  @IsOptional()
  type?: number | null;
}

export class SearchCastMembersDto implements ListCastMembersInput {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
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
  filter?: CastMemberFilterDto;
}
