import { UpdateCastMemberUseCase } from './update-cast-member.use-case';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { InvalidUuidError } from '@core/@shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';

describe('UpdateCastMembeUseCase Unit Tests', () => {
  let useCase: UpdateCastMemberUseCase;
  let repo: CastMemberInMemoryRepository;
  const castMember = CastMember.fake()
    .aCastMember()
    .withName('test')
    .withCastMemberType(CastMemberType.createADirector())
    .build();

  beforeEach(() => {
    repo = new CastMemberInMemoryRepository();
    useCase = new UpdateCastMemberUseCase(repo);
    repo.items.push(castMember);
  });

  it.each([
    {
      input: {},
      expected: { name: castMember.name, type: castMember.type.value },
    },
    {
      input: { name: 'test', type: 2 },
      expected: { name: 'test', type: 2 },
    },
    {
      input: { type: 2 },
      expected: { name: castMember.name, type: 2 },
    },
    {
      input: { name: 'name updated', type: 1 },
      expected: { name: 'name updated', type: 1 },
    },
    {
      input: { name: 'name updated' },
      expected: { name: 'name updated', type: castMember.type.value },
    },
    {
      input: { name: 'name updated', type: 2 },
      expected: { name: 'name updated', type: 2 },
    },
  ])(
    'should update a cast member to input $input',
    async ({ input, expected }) => {
      // Act
      const output = await useCase.execute({
        id: castMember.id.toString(),
        ...input,
      });

      // Assert
      expect(output).toEqual(expect.objectContaining(expected));
      await expect(
        repo.findById(castMember.id).then((c) => c.toJSON()),
      ).resolves.toEqual(expect.objectContaining(expected));
    },
  );

  const INVALID_NAME_TOO_LONG = CastMember.fake()
    .aCastMember()
    .withInvalidNameTooLong().name;
  const INVALID_CAST_TYPE = 0;

  it.each([
    {
      input: { id: 'invalid-id' },
      expected: InvalidUuidError,
    },
    {
      input: { id: new CastMemberId().toString() },
      expected: NotFoundError,
    },
    {
      input: { id: castMember.id.toString(), name: INVALID_NAME_TOO_LONG },
      expected: EntityValidationError,
    },
    {
      input: { id: castMember.id.toString(), type: INVALID_CAST_TYPE },
      expected: EntityValidationError,
    },
  ])(
    'should not update a cast member to input $input',
    async ({ input, expected }) => {
      await expect(useCase.execute(input)).rejects.toThrow(expected);
    },
  );
});
