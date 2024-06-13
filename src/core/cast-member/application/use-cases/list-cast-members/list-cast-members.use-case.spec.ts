import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { ListCastMembersUseCase } from './list-cast-members.use-case';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutputMapper } from '../common/cast-member.output';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';
import { SearchValidationError } from '@core/@shared/domain/errors/validation.error';

describe('ListCastMembersUseCase Unit Tests', () => {
  let useCase: ListCastMembersUseCase;
  let repository: CastMemberInMemoryRepository;

  const now = new Date().getTime();
  const props = [
    { name: 'a', type: CastMemberType.createADirector() },
    { name: 'AAA', type: CastMemberType.createADirector() },
    { name: 'AaA', type: CastMemberType.createAnActor() },
    { name: 'b', type: CastMemberType.createAnActor() },
    { name: 'c', type: CastMemberType.createAnActor() },
  ];
  const castMembers = CastMember.fake()
    .theCastMembers(props.length)
    .withName((index) => props[index].name)
    .withCastMemberType((index) => props[index].type)
    .withCreatedAt((index) => new Date(now + 1000 * index))
    .build();

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new ListCastMembersUseCase(repository);
    repository.items.push(...castMembers);
  });

  it('should returns output sorted by created_at when input params is empty', async () => {
    await expect(useCase.execute({})).resolves.toStrictEqual({
      items: [...castMembers].reverse().map(CastMemberOutputMapper.toOutput),
      total: castMembers.length,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it.each([
    {
      input: {
        page: 1,
        per_page: 2,
        sort: 'name',
        filter: { name: 'a' },
      },
      expected: {
        total: 3,
        current_page: 1,
        per_page: 2,
        last_page: 2,
        items: [castMembers[1], castMembers[2]].map(
          CastMemberOutputMapper.toOutput,
        ),
      },
    },
    {
      input: {
        page: 2,
        per_page: 2,
        sort: 'name',
        filter: { name: 'a' },
      },
      expected: {
        total: 3,
        current_page: 2,
        per_page: 2,
        last_page: 2,
        items: [castMembers[0]].map(CastMemberOutputMapper.toOutput),
      },
    },
    {
      input: {
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'desc' as const,
        filter: { name: 'a' },
      },
      expected: {
        items: [castMembers[0], castMembers[2]].map(
          CastMemberOutputMapper.toOutput,
        ),
        total: 3,
        current_page: 1,
        per_page: 2,
        last_page: 2,
      },
    },
    {
      input: {
        page: 1,
        per_page: 2,
        filter: { type: 1 },
      },
      expected: {
        items: [castMembers[1], castMembers[0]].map(
          CastMemberOutputMapper.toOutput,
        ),
        total: 2,
        current_page: 1,
        per_page: 2,
        last_page: 1,
      },
    },
    {
      input: {
        page: 2,
        per_page: 2,
        filter: { type: 1 },
      },
      expected: {
        items: [],
        total: 2,
        current_page: 2,
        per_page: 2,
        last_page: 1,
      },
    },
    {
      input: {
        page: 1,
        per_page: 2,
        filter: { type: 2 },
      },
      expected: {
        items: [castMembers[4], castMembers[3]].map(
          CastMemberOutputMapper.toOutput,
        ),
        total: 3,
        current_page: 1,
        per_page: 2,
        last_page: 2,
      },
    },
    {
      input: {
        page: 2,
        per_page: 2,
        filter: { type: 2 },
      },
      expected: {
        items: [castMembers[2]].map(CastMemberOutputMapper.toOutput),
        total: 3,
        current_page: 2,
        per_page: 2,
        last_page: 2,
      },
    },
    {
      input: {
        page: 1,
        per_page: 2,
        filter: { name: 'a', type: 2 },
      },
      expected: {
        items: [castMembers[2]].map(CastMemberOutputMapper.toOutput),
        total: 1,
        current_page: 1,
        per_page: 2,
        last_page: 1,
      },
    },
    {
      input: {
        page: 1,
        per_page: 2,
        filter: { name: 'a', type: 1 },
        sort: 'name',
        sort_dir: 'asc' as const,
      },
      expected: {
        items: [castMembers[1], castMembers[0]].map(
          CastMemberOutputMapper.toOutput,
        ),
        total: 2,
        current_page: 1,
        per_page: 2,
        last_page: 1,
      },
    },
  ])('should return output using $input', async ({ input, expected }) => {
    await expect(useCase.execute(input)).resolves.toStrictEqual(expected);
  });

  it('should throws an error using invalid type search param (`$input.filter.type`)', async () => {
    await expect(
      useCase.execute({ filter: { type: 0 as any } }),
    ).rejects.toThrow(SearchValidationError);
  });
});
