import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { DeleteCastMemberUseCase } from './delete-cast-member.use-case';
import { InvalidUuidError } from '@core/@shared/domain/value-objects/uuid.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';

describe('DeleteCastMemberUseCase Unit Tests', () => {
  let useCase: DeleteCastMemberUseCase;
  let repo: CastMemberInMemoryRepository;

  beforeEach(() => {
    repo = new CastMemberInMemoryRepository();
    useCase = new DeleteCastMemberUseCase(repo);
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    repo.items.push(castMember);

    await useCase.execute({ id: castMember.id.toString() });

    await expect(repo.findById(castMember.id)).resolves.toBeNull();
  });

  it.each([
    {
      label: 'invalid CastMemberId',
      input: { id: 'invalid-id' },
      expected: InvalidUuidError,
    },
    {
      label: 'not found CastMember',
      input: { id: new CastMemberId().toString() },
      expected: NotFoundError,
    },
  ])(
    'should not delete a cast member to $label',
    async ({ input, expected }) => {
      await expect(useCase.execute(input)).rejects.toThrow(expected);
    },
  );
});
