import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { GetCastMemberUseCase } from './get-cast-member.use-case';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { InvalidUuidError } from '@core/@shared/domain/value-objects/uuid.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';

describe('GetCastMemberUseCase Unit Tests', () => {
  let useCase: GetCastMemberUseCase;
  let repo: ICastMemberRepository;

  beforeEach(() => {
    repo = new CastMemberInMemoryRepository();
    useCase = new GetCastMemberUseCase(repo);
  });

  it('should gets a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    repo.findById = jest.fn(() => Promise.resolve(castMember));
    const output = await useCase.execute({ id: castMember.id.toString() });
    expect(output).toStrictEqual({
      id: castMember.id.toString(),
      name: castMember.name,
      type: castMember.type.value,
      created_at: castMember.created_at,
    });
  });

  it('should throws an error for invalid cast member id', async () => {
    await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow(
      InvalidUuidError,
    );
  });

  it('should throws an error for not found cast member', async () => {
    const castMemberId = new CastMemberId();
    await expect(
      useCase.execute({ id: castMemberId.toString() }),
    ).rejects.toThrow(new NotFoundError(castMemberId, CastMember));
  });
});
