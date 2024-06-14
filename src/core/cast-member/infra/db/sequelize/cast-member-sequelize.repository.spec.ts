import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { CastMemberModel } from './cast-member.model';
import { CastMemberSequelizeRepository } from './cast-member-sequelize.repository';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberMapper } from './cast-member.mapper';
import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/cast-member-type.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { CastMemberSearchParams } from '@core/cast-member/domain/cast-member-search-params.vo';
import { CastMemberSearchResult } from '@core/cast-member/domain/cast-member-search-result.vo';

describe('CastMemberSequelizeRepository Unit Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  const repository = new CastMemberSequelizeRepository(CastMemberModel);

  it('should inserts a new CastMember', async () => {
    // Arrange
    const castMember = CastMember.fake().aCastMember().build();

    // Act
    await repository.insert(castMember);

    // Assert
    const castMemberFound = await CastMemberModel.findByPk(
      castMember.id.toString(),
    );
    expect(castMemberFound.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should inserts a bulk of CastMembers', async () => {
    // Arrange
    const castMembers = CastMember.fake().theCastMembers(3).build();

    // Act
    await repository.bulkInsert(castMembers);

    // Assert
    const castMembersFound = await CastMemberModel.findAll();
    expect(castMembersFound).toHaveLength(3);
    for (const castMember of castMembersFound) {
      expect(castMember.toJSON()).toStrictEqual(
        castMembers.find((c) => c.id.value == castMember.id).toJSON(),
      );
    }
  });

  it('should updates a CastMember', async () => {
    // Arrange
    const castMember = CastMember.fake()
      .aCastMember()
      .withName('test')
      .withCastMemberType(CastMemberType.createADirector())
      .build();
    await CastMemberModel.create(CastMemberMapper.toModel(castMember));

    // Act
    castMember.changeName('updated name');
    castMember.changeType(CastMemberType.createAnActor());
    await repository.update(castMember);

    // Assert
    const castMemberFound = await CastMemberModel.findByPk(
      castMember.id.toString(),
    );
    expect(castMemberFound.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should throws an error on update not found CastMember', async () => {
    // Arrange
    const castMember = CastMember.fake()
      .aCastMember()
      .withName('test')
      .withCastMemberType(CastMemberType.createADirector())
      .build();

    // Act/Assert
    castMember.changeName('updated name');
    castMember.changeType(CastMemberType.createAnActor());
    await expect(repository.update(castMember)).rejects.toThrow(
      new NotFoundError(castMember.id, CastMember),
    );
  });

  it('should deletes a CastMember', async () => {
    // Arrange
    const castMember = CastMember.fake().aCastMember().build();
    await CastMemberModel.create(CastMemberMapper.toModel(castMember));

    // Act
    await repository.delete(castMember.id);

    // Assert
    const castMemberFound = await CastMemberModel.findByPk(
      castMember.id.toString(),
    );
    expect(castMemberFound).toBeNull();
  });

  it('should throws an error on delete not found CastMember', async () => {
    // Arrange
    const castMember = CastMember.fake().aCastMember().build();

    // Act/Assert
    await expect(repository.delete(castMember.id)).rejects.toThrow(
      new NotFoundError(castMember.id, CastMember),
    );
  });

  it('should returns a CastMember', async () => {
    // Arrange
    const castMember = CastMember.fake().aCastMember().build();
    await CastMemberModel.create(CastMemberMapper.toModel(castMember));

    // Act
    const castMemberFound = await repository.findById(castMember.id);

    // Assert
    expect(castMemberFound.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should returns all CastMember', async () => {
    // Arrange
    const castMembers = CastMember.fake().theCastMembers(3).build();
    await CastMemberModel.bulkCreate(castMembers.map(CastMemberMapper.toModel));

    // Act
    const castMembersFound = await repository.findAll();

    // Assert
    expect(castMembersFound.map((c) => c.toJSON())).toStrictEqual(
      castMembers.map((c) => c.toJSON()),
    );
  });

  describe('search', () => {
    const now = new Date().getTime();
    const castMembersProps = [
      { name: 'aa', type: CastMemberType.createAnActor() },
      { name: 'bb', type: CastMemberType.createAnActor() },
      { name: 'cc', type: CastMemberType.createAnActor() },
      { name: 'dd', type: CastMemberType.createADirector() },
      { name: 'ee', type: CastMemberType.createAnActor() },
      { name: 'aA', type: CastMemberType.createAnActor() },
      { name: 'bB', type: CastMemberType.createAnActor() },
      { name: 'cC', type: CastMemberType.createAnActor() },
      { name: 'dD', type: CastMemberType.createADirector() },
      { name: 'eE', type: CastMemberType.createAnActor() },
      { name: 'Aa', type: CastMemberType.createAnActor() },
      { name: 'Bb', type: CastMemberType.createAnActor() },
      { name: 'Cc', type: CastMemberType.createAnActor() },
      { name: 'Dd', type: CastMemberType.createADirector() },
      { name: 'Ee', type: CastMemberType.createAnActor() },
      { name: 'AA', type: CastMemberType.createAnActor() },
      { name: 'BB', type: CastMemberType.createAnActor() },
      { name: 'CC', type: CastMemberType.createAnActor() },
      { name: 'DD', type: CastMemberType.createADirector() },
      { name: 'EE', type: CastMemberType.createADirector() },
    ];
    const castMembers = CastMember.fake()
      .theCastMembers(castMembersProps.length)
      .withName((index) => castMembersProps[index].name)
      .withCastMemberType((index) => castMembersProps[index].type)
      .withCreatedAt((index) => new Date(now + index * 1000))
      .build();

    beforeEach(async () => {
      await CastMemberModel.bulkCreate(
        castMembers.map(CastMemberMapper.toModel),
      );
    });

    it('should paginate and sort by created_at DESC without search params defined', async () => {
      const PER_PAGE_DEFAULT = 15;

      // Act
      const result = await repository.search(CastMemberSearchParams.create());
      expect(result.toJSON(true)).toStrictEqual({
        total: 20,
        per_page: PER_PAGE_DEFAULT,
        current_page: 1,
        last_page: 2,
        items: castMembers
          .slice(-15)
          .reverse()
          .map((c) => c.toJSON()),
      });
    });

    it.each([
      {
        input: {
          page: 1,
          per_page: 2,
          filter: { name: 'a' },
        },
        expected: {
          per_page: 2,
          current_page: 1,
          total: 4,
          last_page: 2,
          items: [castMembers[15], castMembers[10]],
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          filter: { name: 'a' },
        },
        expected: {
          per_page: 2,
          current_page: 2,
          total: 4,
          last_page: 2,
          items: [castMembers[5], castMembers[0]],
        },
      },
      {
        input: {
          page: 3,
          per_page: 2,
          filter: { name: 'a' },
        },
        expected: {
          per_page: 2,
          current_page: 3,
          total: 4,
          last_page: 2,
          items: [],
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        expected: {
          per_page: 2,
          current_page: 1,
          total: 5,
          last_page: 3,
          items: [castMembers[19], castMembers[18]],
        },
      },
      {
        input: {
          page: 3,
          per_page: 2,
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        expected: {
          per_page: 2,
          current_page: 3,
          total: 5,
          last_page: 3,
          items: [castMembers[3]],
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          filter: { name: 'e', type: CastMemberTypes.DIRECTOR },
        },
        expected: {
          per_page: 2,
          current_page: 1,
          total: 1,
          last_page: 1,
          items: [castMembers[19]],
        },
      },
    ])(
      'should paginate and filter with input as $input',
      ({ input, expected }) =>
        expect(
          repository.search(CastMemberSearchParams.create(input)),
        ).resolves.toEqual(CastMemberSearchResult.create(expected)),
    );

    it.each([
      {
        input: {
          sort: 'created_at',
          sort_dir: 'asc' as const,
          page: 1,
          per_page: 15,
        },
        expected: {
          total: 20,
          per_page: 15,
          current_page: 1,
          last_page: 2,
          items: castMembers.slice(0, 15),
        },
      },
      {
        input: {
          sort: 'created_at',
          sort_dir: 'asc' as const,
          page: 2,
          per_page: 15,
        },
        expected: {
          total: 20,
          per_page: 15,
          current_page: 2,
          last_page: 2,
          items: castMembers.slice(-5),
        },
      },
      {
        input: {
          sort: 'name',
          sort_dir: 'asc' as const,
          page: 1,
          per_page: 6,
        },
        expected: {
          total: 20,
          per_page: 6,
          current_page: 1,
          last_page: 4,
          items: [...castMembers]
            .sort((a, b) => {
              if (a.name > b.name) return 1;
              if (a.name < b.name) return -1;
              return 0;
            })
            .slice(0, 6),
        },
      },
      {
        input: {
          sort: 'name',
          sort_dir: 'desc' as const,
          page: 1,
          per_page: 6,
        },
        expected: {
          total: 20,
          per_page: 6,
          current_page: 1,
          last_page: 4,
          items: [...castMembers]
            .sort((a, b) => {
              if (a.name > b.name) return -1;
              if (a.name < b.name) return 1;
              return 0;
            })
            .slice(0, 6),
        },
      },
    ])('should paginate and sort to input as $input', ({ input, expected }) =>
      expect(
        repository.search(CastMemberSearchParams.create(input)),
      ).resolves.toEqual(CastMemberSearchResult.create(expected)),
    );

    it.each([
      {
        input: {
          page: 1,
          per_page: 2,
          filter: { type: CastMemberTypes.DIRECTOR },
          sort: 'created_at',
          sort_dir: 'asc' as const,
        },
        expected: {
          total: 5,
          per_page: 2,
          last_page: 3,
          current_page: 1,
          items: castMembers
            .filter((c) => c.type.value == CastMemberTypes.DIRECTOR)
            .slice(0, 2),
        },
      },
      {
        input: {
          page: 3,
          per_page: 2,
          filter: { type: CastMemberTypes.DIRECTOR },
          sort: 'created_at',
          sort_dir: 'asc' as const,
        },
        expected: {
          total: 5,
          per_page: 2,
          last_page: 3,
          current_page: 3,
          items: castMembers
            .filter((c) => c.type.value == CastMemberTypes.DIRECTOR)
            .slice(-1),
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          filter: { type: CastMemberTypes.ACTOR, name: 'e' },
          sort: 'name',
          sort_dir: 'desc' as const,
        },
        expected: {
          total: 3,
          per_page: 2,
          last_page: 2,
          current_page: 1,
          items: castMembers
            .filter(
              (c) =>
                c.type.value == CastMemberTypes.ACTOR &&
                c.name.toLowerCase().includes('e'),
            )
            .sort((a, b) => {
              if (a.name > b.name) return -1;
              if (b.name < a.name) return 1;
              return 0;
            })
            .slice(0, 2),
        },
      },
    ])('should filter, sort and paginate', ({ input, expected }) =>
      expect(
        repository.search(CastMemberSearchParams.create(input)),
      ).resolves.toEqual(CastMemberSearchResult.create(expected)),
    );
  });
});
