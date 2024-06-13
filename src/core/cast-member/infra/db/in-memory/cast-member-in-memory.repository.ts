import { SearchParams } from '@core/@shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/@shared/infra/db/in-memory/in-memory-searchable.repository';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { CastMemberFilter } from '@core/cast-member/domain/cast-member-search-params.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter
  >
  implements ICastMemberRepository
{
  protected applyFilter(
    items: CastMember[],
    params: SearchParams<CastMemberFilter>,
  ): CastMember[] {
    const filter = params.filter;
    let itemsFiltered = items;

    if (filter?.name) {
      itemsFiltered = itemsFiltered.filter((i) =>
        i.name.toLowerCase().includes(filter.name.toLowerCase()),
      );
    }

    if (filter?.type) {
      itemsFiltered = itemsFiltered.filter((i) => i.type.equals(filter.type));
    }

    return itemsFiltered;
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
