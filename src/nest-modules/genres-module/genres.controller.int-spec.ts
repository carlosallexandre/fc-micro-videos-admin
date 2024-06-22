import { Uuid } from '@core/@shared/domain/value-objects/uuid.vo';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { GenreOutputMapper } from '@core/genre/application/use-cases/common/genre-output.mapper';
import { CreateGenreUseCase } from '@core/genre/application/use-cases/create-genre/create-genre.use-case';
import { DeleteGenreUseCase } from '@core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GetGenreUseCase } from '@core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';
import { UpdateGenreUseCase } from '@core/genre/application/use-cases/update-genre/update-genre.use-case';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { getConnectionToken } from '@nestjs/sequelize';
import { TestingModule, Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.providers';
import { DatabaseModule } from '../database-module/database.module';
import { GenresController } from './genres.controller';
import {
  CreateGenreFixture,
  UpdateGenreFixture,
  ListGenresFixture,
} from './genres.fixture';
import { GenresModule } from './genres.module';
import { GenreCollectionPresenter } from './genres.presenter';
import { GENRES_PROVIDERS } from './genres.providers';
import { ConfigModule } from '../config-module/config.module';

describe('GenresController Integration Tests', () => {
  let controller: GenresController;
  let genreRepo: IGenreRepository;
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, GenresModule],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        inject: [getConnectionToken()],
        factory(sequelize: Sequelize) {
          return new UnitOfWorkSequelize(sequelize);
        },
      })
      .compile();
    controller = module.get(GenresController);
    genreRepo = module.get(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepo = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateGenreUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateGenreUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListGenresUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetGenreUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteGenreUseCase);
  });

  describe('should create a category', () => {
    const arrange = CreateGenreFixture.arrangeForSave();

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected, relations }) => {
        await categoryRepo.bulkInsert(relations.categories);
        const presenter = await controller.create(send_data);
        const entity = await genreRepo.findById(new Uuid(presenter.id));

        expect(entity!.toJSON()).toStrictEqual({
          id: presenter.id,
          created_at: presenter.created_at,
          name: expected.name,
          categories_id: expected.categories_id,
          is_active: expected.is_active,
        });

        const expectedPresenter = GenresController.serialize(
          GenreOutputMapper.toOutput(entity!, relations.categories),
        );
        expect(presenter).toEqual({
          ...expectedPresenter,
          categories: expect.arrayContaining(expectedPresenter.categories),
          categories_id: expect.arrayContaining(
            expectedPresenter.categories_id,
          ),
        });
      },
    );
  });

  describe('should update a category', () => {
    const arrange = UpdateGenreFixture.arrangeForSave();

    test.each(arrange)(
      'with request $send_data',
      async ({ entity: genre, send_data, expected, relations }) => {
        await categoryRepo.bulkInsert(relations.categories);
        await genreRepo.insert(genre);
        const presenter = await controller.update(genre.id.value, send_data);
        const genreUpdated = await genreRepo.findById(
          new GenreId(presenter.id),
        );

        expect(genreUpdated!.toJSON()).toStrictEqual({
          id: presenter.id,
          created_at: presenter.created_at,
          name: expected.name ?? genre.name,
          categories_id: expected.categories_id
            ? expected.categories_id
            : genre.categories_id,
          is_active:
            expected.is_active === true || expected.is_active === false
              ? expected.is_active
              : genre.is_active,
        });
        const categoriesOfGenre = relations.categories.filter((c) =>
          genreUpdated!.categories_id.has(c.id.value),
        );

        const expectedPresenter = GenresController.serialize(
          GenreOutputMapper.toOutput(genreUpdated!, categoriesOfGenre),
        );
        expect(presenter).toEqual({
          ...expectedPresenter,
          categories: expect.arrayContaining(expectedPresenter.categories),
          categories_id: expect.arrayContaining(
            expectedPresenter.categories_id,
          ),
        });
      },
    );
  });

  it('should delete a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const response = await controller.remove(genre.id.value);
    expect(response).not.toBeDefined();
    await expect(genreRepo.findById(genre.id)).resolves.toBeNull();
  });

  it('should get a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const presenter = await controller.findOne(genre.id.toString());
    expect(presenter.id).toBe(genre.id.toString());
    expect(presenter.name).toBe(genre.name);
    expect(presenter.categories).toEqual([
      {
        id: category.id.toString(),
        name: category.name,
        created_at: category.created_at,
      },
    ]);
    expect(presenter.categories_id).toEqual(
      expect.arrayContaining(Array.from(genre.categories_id.keys())),
    );
    expect(presenter.created_at).toStrictEqual(genre.created_at);
  });

  describe('search method', () => {
    describe('should returns categories using query empty ordered by created_at', () => {
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await categoryRepo.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          const expectedPresenter = new GenreCollectionPresenter({
            items: entities.map((e) => ({
              ...e.toJSON(),
              id: e.id.toString(),
              categories_id: expect.arrayContaining(
                Array.from(e.categories_id.keys()),
              ),
              categories: Array.from(e.categories_id.keys()).map((id) => ({
                id: relations.categories.get(id)!.id.toString(),
                name: relations.categories.get(id)!.name,
                created_at: relations.categories.get(id)!.created_at,
              })),
            })),
            ...paginationProps.meta,
          });
          presenter.data = presenter.data.map((item) => ({
            ...item,
            categories: expect.arrayContaining(item.categories),
          }));
          expect(presenter).toEqual(expectedPresenter);
        },
      );
    });

    describe('should returns output using pagination, sort and filter', () => {
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeUnsorted();

      beforeEach(async () => {
        await categoryRepo.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $label',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          const expectedPresenter = new GenreCollectionPresenter({
            items: entities.map((e) => ({
              ...e.toJSON(),
              id: e.id.toString(),
              categories_id: expect.arrayContaining(
                Array.from(e.categories_id.keys()),
              ),
              categories: Array.from(e.categories_id.keys()).map((id) => ({
                id: relations.categories.get(id)!.id.toString(),
                name: relations.categories.get(id)!.name,
                created_at: relations.categories.get(id)!.created_at,
              })),
            })),
            ...paginationProps.meta,
          });
          presenter.data = presenter.data.map((item) => ({
            ...item,
            categories: expect.arrayContaining(item.categories),
          }));
          expect(presenter).toEqual(expectedPresenter);
        },
      );
    });
  });
});
