import { IUseCase } from '@core/@shared/application/use-case.interface';
import { SortDirection } from '@core/@shared/domain/repository/search-params';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/@shared/application/pagination-output';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberSearchParams } from '@core/cast-member/domain/cast-member-search-params.vo';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member.output';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

export type CastMemberFilter = {
  name?: string | null;
  type?: CastMemberTypes | null;
};

export type ListCastMembersInput = {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: CastMemberFilter;
};

export type ListCastMembersOutput = PaginationOutput<CastMemberOutput>;

export class ListCastMembersUseCase
  implements IUseCase<ListCastMembersInput, ListCastMembersOutput>
{
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
    const searchResult = await this.castMemberRepository.search(
      CastMemberSearchParams.create(input),
    );

    return PaginationOutputMapper.toOutput(
      searchResult,
      CastMemberOutputMapper.toOutput,
    );
  }
}
