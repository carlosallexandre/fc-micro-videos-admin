import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from './cast-member-in-memory.repository';

describe('CastMemberInMemoryRepository Unit Tests', () => {
  it('should returns CastMember when calling getEntity', () => {
    const repo = new CastMemberInMemoryRepository();
    expect(repo.getEntity()).toBe(CastMember);
  });
});
