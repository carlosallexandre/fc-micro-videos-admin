import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CreateCastMemberUseCase } from './create-cast-member.use-case';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';

describe('CreateCastMemberUseCase Unit Tests', () => {
  let useCase: CreateCastMemberUseCase;
  let repo: ICastMemberRepository;

  beforeEach(() => {
    repo = new CastMemberInMemoryRepository();
    useCase = new CreateCastMemberUseCase(repo);
  });

  it('should create a cast member', async () => {
    const input = { name: 'test', type: 1 } as const;
    const output = await useCase.execute(input);
    expect(output).toStrictEqual({
      id: expect.any(String),
      name: 'test',
      type: 1,
      created_at: expect.any(Date),
    });
  });

  it('should not create a cast member with too long name', async () => {
    const NAME_TOO_LONG = CastMember.fake()
      .aCastMember()
      .withInvalidNameTooLong().name;
    const input = { name: NAME_TOO_LONG, type: 1 } as const;
    await expect(useCase.execute(input)).rejects.toThrow(EntityValidationError);
  });

  it('should not create a cast member with invalid type', async () => {
    const INVALID_CAST_MEMBER_TYPE = 0;
    const input = { name: 'test', type: INVALID_CAST_MEMBER_TYPE };
    await expect(useCase.execute(input)).rejects.toThrow(EntityValidationError);
  });
});
