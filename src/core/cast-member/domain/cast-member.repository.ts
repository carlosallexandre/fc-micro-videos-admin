import { IRepository } from '@core/@shared/domain/repository/repository.interface';
import { CastMember } from './cast-member.aggregate';
import { CastMemberId } from './cast-member-id.vo';
import { ISearchableRepository } from '@core/@shared/domain/repository/searchable-repository.interface';
import { CastMemberFilter } from './cast-member-search-params.vo';

interface ICastMemberRepository extends IRepository<CastMember, CastMemberId> {}
interface ICastMemberRepository
  extends ISearchableRepository<CastMember, CastMemberFilter> {}

export { ICastMemberRepository };
