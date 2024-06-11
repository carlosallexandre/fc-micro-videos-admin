import { IRepository } from '@core/@shared/domain/repository/repository.interface';
import { CastMember } from './cast-member.aggregate';
import { CastMemberId } from './cast-member-id.vo';

interface ICastMemberRepository extends IRepository<CastMember, CastMemberId> {}

export { ICastMemberRepository };
