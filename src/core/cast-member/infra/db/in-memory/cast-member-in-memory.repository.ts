import { InMemoryRepository } from '@core/@shared/infra/db/in-memory/in-memory.repository';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';

export class CastMemberInMemoryRepository
  extends InMemoryRepository<CastMember, CastMemberId>
  implements ICastMemberRepository
{
  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
