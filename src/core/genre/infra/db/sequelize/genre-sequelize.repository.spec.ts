import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { GenreSearchParams } from '@core/genre/domain/genre-search-params.vo';
import { GenreSearchResult } from '@core/genre/domain/genre-search-result.vo';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreCategoryModel } from './genre-category.model';
import { GenreModelMapper } from './genre-model.mapper';
import { GenreSequelizeRepository } from './genre-sequelize.repository';
import { GenreModel } from './genre.model';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';

describe('GenreSequelizeRepository Integration Tests', () => {
  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  let uow: UnitOfWorkSequelize;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  it('should inserts a new entity', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    const newGenre = await genreRepo.findById(genre.id);

    expect(newGenre.toJSON()).toStrictEqual(genre.toJSON());
  });

  it('should bulk inserts new entities', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);
    const genres = Genre.fake()
      .theGenres(2)
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .build();
    await genreRepo.bulkInsert(genres);

    const newGenres = await genreRepo.findAll();
    expect(newGenres.length).toBe(2);
    expect(newGenres.map((g) => g.toJSON())).toStrictEqual(
      expect.arrayContaining(
        genres.map((g) => {
          const obj = g.toJSON();
          return {
            ...obj,
            categories_id: expect.arrayContaining(obj.categories_id),
          };
        }),
      ),
    );
  });

  it('should finds a entity by id', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    const entityFound = await genreRepo.findById(genre.id);
    expect(genre.toJSON()).toStrictEqual(entityFound!.toJSON());

    await expect(genreRepo.findById(new GenreId())).resolves.toBeNull();
  });

  it('should return all categories', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const entity = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(entity);

    const entities = await genreRepo.findAll();
    expect(entities).toHaveLength(1);
    expect(entities.map((e) => e.toJSON())).toStrictEqual([entity.toJSON()]);
  });

  it('should throw error on update when a entity not found', async () => {
    const entity = Genre.fake().aGenre().build();
    await expect(genreRepo.update(entity)).rejects.toThrow(
      new NotFoundError(entity.id, Genre),
    );
  });

  it('should update a entity', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .build();
    await genreRepo.insert(genre);

    genre.changeName('Movie updated');
    genre.syncCategoriesId([categories[1].category_id]);
    await genreRepo.update(genre);

    let entityFound = await genreRepo.findById(genre.id);
    expect(genre.toJSON()).toStrictEqual(entityFound!.toJSON());
    await expect(GenreCategoryModel.count()).resolves.toBe(1);

    genre.addCategoryId(categories[0].category_id);
    await genreRepo.update(genre);

    entityFound = await genreRepo.findById(genre.id);
    expect(genre.toJSON()).toStrictEqual({
      ...entityFound!.toJSON(),
      categories_id: expect.arrayContaining([
        categories[0].category_id.toString(),
        categories[1].category_id.toString(),
      ]),
    });
  });

  it('should throw error on delete when a entity not found', async () => {
    const genreId = new GenreId();
    await expect(genreRepo.delete(genreId)).rejects.toThrow(
      new NotFoundError(genreId, Genre),
    );
  });

  it('should delete a entity', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    await genreRepo.delete(genre.id);

    await expect(GenreModel.findByPk(genre.id.toString())).resolves.toBeNull();
    await expect(GenreCategoryModel.count()).resolves.toBe(0);
  });

  describe('search method tests', () => {
    describe('should order by created_at DESC when search params are null', () => {
      const categories = Category.fake().theCategories(3).build();
      const genres = Genre.fake()
        .theGenres(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .addCategoryId(categories[0].category_id)
        .addCategoryId(categories[1].category_id)
        .addCategoryId(categories[2].category_id)
        .build();

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      it.each([
        {
          input: undefined,
          output: new GenreSearchResult({
            total: 16,
            current_page: 1,
            per_page: 15,
            items: genres.slice(1, 16).reverse(),
          }),
        },
        {
          input: {
            page: 2,
          },
          output: new GenreSearchResult({
            total: 16,
            current_page: 2,
            per_page: 15,
            items: genres.slice(0, 1),
          }),
        },
      ])('when input is $input', async ({ input, output }) => {
        const searchOutput = await genreRepo.search(
          GenreSearchParams.create(input),
        );
        const expected = output.toJSON(true);

        expect(searchOutput.toJSON(true)).toMatchObject({
          ...expected,
          items: expected.items.map((i) => ({
            ...i,
            categories_id: expect.arrayContaining(i.categories_id),
          })),
        });
      });
    });

    describe('should apply paginate and filter by name', () => {
      const categories = Category.fake().theCategories(3).build();
      const genres = [
        Genre.fake()
          .aGenre()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .build(),
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      it.each([
        {
          input: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            filter: { name: 'TEST' },
          }),
          output: new GenreSearchResult({
            items: [genres[0], genres[2]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          input: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            filter: { name: 'TEST' },
          }),
          output: new GenreSearchResult({
            items: [genres[3]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ])('when input is $input', async ({ input, output }) => {
        let searchOutput = await genreRepo.search(input);
        const expected = output.toJSON(true);

        expect(searchOutput.toJSON(true)).toStrictEqual({
          ...expected,
          items: expected.items.map((i) => ({
            ...i,
            categories_id: expect.arrayContaining(i.categories_id),
          })),
        });
      });
    });

    describe('should apply paginate and filter by categories', () => {
      const categories = Category.fake().theCategories(4).build();
      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[3].category_id)
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      it.each([
        {
          params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            filter: { categories_id: [categories[0].category_id.value] },
          }),
          result: new GenreSearchResult({
            items: [genres[2], genres[1]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            filter: { categories_id: [categories[0].category_id.value] },
          }),
          result: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            filter: {
              categories_id: [
                categories[0].category_id.value,
                categories[1].category_id.value,
              ],
            },
          }),
          result: new GenreSearchResult({
            items: [genres[4], genres[2]],
            total: 4,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            filter: {
              categories_id: [
                categories[0].category_id.value,
                categories[1].category_id.value,
              ],
            },
          }),
          result: new GenreSearchResult({
            items: [genres[1], genres[0]],
            total: 4,
            current_page: 2,
            per_page: 2,
          }),
        },
      ])('when params is $params', async (arrangeItem) => {
        const result = await genreRepo.search(arrangeItem.params);
        const expected = arrangeItem.result.toJSON();

        expect(result.toJSON(true)).toStrictEqual({
          ...expected,
          items: expected.items.map((i) => {
            const expected = i.toJSON();
            return {
              ...expected,
              categories_id: expect.arrayContaining(expected.categories_id),
            };
          }),
        });
      });
    });

    describe('should apply paginate and sort', () => {
      const categories = Category.fake().theCategories(4).build();
      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('b')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('a')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('d')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('e')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('c')
          .build(),
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      it.each([
        {
          params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
          }),
          result: new GenreSearchResult({
            items: [genres[1], genres[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
          }),
          result: new GenreSearchResult({
            items: [genres[4], genres[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new GenreSearchResult({
            items: [genres[3], genres[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new GenreSearchResult({
            items: [genres[4], genres[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
      ])('when params is $params', async (i) => {
        const result = await genreRepo.search(i.params);
        const expected = i.result.toJSON(true);

        expect(result.toJSON(true)).toMatchObject({
          ...expected,
          items: expected.items.map((i) => ({
            ...i,
            categories_id: expect.arrayContaining(i.categories_id),
          })),
        });
      });
    });

    describe('should search using filter by name, sort and paginate', () => {
      const categories = Category.fake().theCategories(3).build();

      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('test')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('a')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('TEST')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('e')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('TeSt')
          .build(),
      ];

      const arrange = [
        {
          search_params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          search_result: new GenreSearchResult({
            items: [genres[2], genres[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          search_result: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      test.each(arrange)(
        'when value is $search_params',
        async ({ search_params, search_result: expected_result }) => {
          const result = await genreRepo.search(search_params);
          const expected = expected_result.toJSON(true);
          expect(result.toJSON(true)).toMatchObject({
            ...expected,
            items: expected.items.map((i) => ({
              ...i,
              categories_id: expect.arrayContaining(i.categories_id),
            })),
          });
        },
      );
    });

    describe('should search using filter by categories_id, sort and paginate', () => {
      const categories = Category.fake().theCategories(4).build();

      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .withName('test')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .withName('a')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('TEST')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[3].category_id)
          .withName('e')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('TeSt')
          .build(),
      ];

      const arrange = [
        {
          search_params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: { categories_id: [categories[0].category_id.value] },
          }),
          search_result: new GenreSearchResult({
            items: [genres[2], genres[1]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: { categories_id: [categories[0].category_id.value] },
          }),
          search_result: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      test.each(arrange)(
        'when value is $search_params',
        async ({ search_params, search_result: expected_result }) => {
          const result = await genreRepo.search(search_params);
          const expected = expected_result.toJSON(true);
          expect(result.toJSON(true)).toMatchObject({
            ...expected,
            items: expected.items.map((i) => ({
              ...i,
              categories_id: expect.arrayContaining(i.categories_id),
            })),
          });
        },
      );
    });

    describe('should search using filter by name and categories_id, sort and paginate', () => {
      const categories = Category.fake().theCategories(4).build();

      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .withName('test')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .withName('a')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].category_id)
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('TEST')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[3].category_id)
          .withName('e')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[1].category_id)
          .addCategoryId(categories[2].category_id)
          .withName('TeSt')
          .build(),
      ];

      const arrange = [
        {
          search_params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: {
              name: 'TEST',
              categories_id: [categories[1].category_id],
            },
          }),
          search_result: new GenreSearchResult({
            items: [genres[2], genres[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: {
              name: 'TEST',
              categories_id: [categories[1].category_id],
            },
          }),
          search_result: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      test.each(arrange)(
        'when value is $search_params',
        async ({ search_params, search_result: expected_result }) => {
          const result = await genreRepo.search(search_params);
          const expected = expected_result.toJSON(true);
          expect(result.toJSON(true)).toMatchObject({
            ...expected,
            items: expected.items.map((i) => ({
              ...i,
              categories_id: expect.arrayContaining(i.categories_id),
            })),
          });
        },
      );
    });
  });

  describe('transaction mode', () => {
    describe('insert method', () => {
      it('should insert a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        uow.start();
        await genreRepo.insert(genre);
        await uow.commit();

        const result = await genreRepo.findById(genre.id);
        expect(genre.id).toBeValueObject(result.id);
      });

      it('rollback the insertion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        await uow.rollback();

        await expect(genreRepo.findById(genre.id)).resolves.toBeNull();
      });
    });

    describe('bulkInsert method', () => {
      it('should insert a list of genres', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        await uow.commit();

        const [genre1, genre2] = await Promise.all([
          genreRepo.findById(genres[0].id),
          genreRepo.findById(genres[1].id),
        ]);
        expect(genre1.id).toBeValueObject(genres[0].id);
        expect(genre2.id).toBeValueObject(genres[1].id);
      });

      it('rollback the bulk insertion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        await uow.rollback();

        await expect(genreRepo.findById(genres[0].id)).resolves.toBeNull();
        await expect(genreRepo.findById(genres[1].id)).resolves.toBeNull();
      });
    });

    describe('findById method', () => {
      it('should return a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        const result = await genreRepo.findById(genre.id);
        expect(result.id).toBeValueObject(genre.id);
        await uow.commit();
      });
    });

    describe('findAll method', () => {
      it('should return a list of genres', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const result = await genreRepo.findAll();
        expect(result.length).toBe(2);
        await uow.commit();
      });
    });

    // describe('findByIds method', () => {
    //   it('should return a list of genres', async () => {
    //     const category = Category.fake().aCategory().build();
    //     await categoryRepo.insert(category);
    //     const genres = Genre.fake()
    //       .theGenres(2)
    //       .addCategoryId(category.category_id)
    //       .build();

    //     await uow.start();
    //     await genreRepo.bulkInsert(genres);
    //     const result = await genreRepo.findByIds(genres.map((g) => g.genre_id));
    //     expect(result.length).toBe(2);
    //     await uow.commit();
    //   });
    // });

    // describe('existsById method', () => {
    //   it('should return true if the genre exists', async () => {
    //     const category = Category.fake().aCategory().build();
    //     await categoryRepo.insert(category);
    //     const genre = Genre.fake()
    //       .aGenre()
    //       .addCategoryId(category.category_id)
    //       .build();

    //     await uow.start();
    //     await genreRepo.insert(genre);
    //     const existsResult = await genreRepo.existsById([genre.id]);
    //     expect(existsResult.exists[0]).toBeValueObject(genre.id);
    //     await uow.commit();
    //   });
    // });

    describe('update method', () => {
      it('should update a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        genre.changeName('new name');
        await genreRepo.update(genre);
        await uow.commit();

        const result = await genreRepo.findById(genre.id);
        expect(result.name).toBe(genre.name);
      });

      it('rollback the update', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);
        await uow.start();
        genre.changeName('new name');
        await genreRepo.update(genre);
        await uow.rollback();
        const notChangeGenre = await genreRepo.findById(genre.id);
        expect(notChangeGenre.name).not.toBe(genre.name);
      });
    });

    describe('delete method', () => {
      it('should delete a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        await genreRepo.delete(genre.id);
        await uow.commit();

        await expect(genreRepo.findById(genre.id)).resolves.toBeNull();
      });

      it('rollback the deletion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        await genreRepo.delete(genre.id);
        await uow.rollback();

        const result = await genreRepo.findById(genre.id);
        expect(result.id).toBeValueObject(genre.id);
      });
    });

    describe('search method', () => {
      it('should return a list of genres', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .theGenres(2)
          .withName('genre')
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const searchParams = GenreSearchParams.create({
          filter: { name: 'genre' },
        });
        const result = await genreRepo.search(searchParams);
        expect(result.items.length).toBe(2);
        expect(result.total).toBe(2);
        await uow.commit();
      });
    });
  });
});
