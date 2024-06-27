import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CastMembersIdExistsInDatabaseValidator } from './cast-members-id-exists-in-database.validator';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';

describe('CastMembersIdExistsInDatabaseValidator Unit Tests', () => {
  let castMemberRepo: CastMemberInMemoryRepository;
  let validator: CastMembersIdExistsInDatabaseValidator;

  beforeEach(() => {
    castMemberRepo = new CastMemberInMemoryRepository();
    validator = new CastMembersIdExistsInDatabaseValidator(castMemberRepo);
  });

  it('should return many not found error when cast members id not exists in database', async () => {
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const spyExistsById = jest.spyOn(castMemberRepo, 'existsById');

    const result = await validator.validate([
      castMemberId1.value,
      castMemberId2.value,
    ]);

    expect(result.ok).toBeNull();
    expect(result.error).toEqual([
      new NotFoundError(castMemberId1, CastMember),
      new NotFoundError(castMemberId2, CastMember),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(1);
  });

  it('should return NotFoundError when at least one castMemberId is not present in database', async () => {
    const castMemberId = new CastMemberId();
    const castMember = CastMember.fake().aDirector().build();
    await castMemberRepo.insert(castMember);
    const spyExistsById = jest.spyOn(castMemberRepo, 'existsById');

    const result = await validator.validate([
      castMember.id.value,
      castMemberId.value,
    ]);

    expect(result.ok).toBeNull();
    expect(result.error).toEqual([new NotFoundError(castMemberId, CastMember)]);
    expect(spyExistsById).toHaveBeenCalledTimes(1);
  });

  it('should returns a list of categories id', async () => {
    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepo.bulkInsert(castMembers);

    const result = await validator.validate(castMembers.map((c) => c.id.value));

    expect(result.isFail()).toBeFalsy();
    expect(result.ok).toStrictEqual(castMembers.map((c) => c.id));
  });
});
