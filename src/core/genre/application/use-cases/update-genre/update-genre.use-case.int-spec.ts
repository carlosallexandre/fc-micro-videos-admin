import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { UpdateGenreUseCase } from './update-genre.use-case';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { GenreCategoryModel } from '@core/genre/infra/db/sequelize/genre-category.model';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreId } from '@core/genre/domain/genre-id.vo';

describe('UpdateGenreUseCase Integration Tests', () => {
  let useCase: UpdateGenreUseCase;
  let uow: UnitOfWorkSequelize;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator;

  const sequelizeHelper = setupSequelize({
    models: [CategoryModel, GenreModel, GenreCategoryModel],
  });

  // prettier-ignore
  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    categoriesIdExistsInStorageValidator = new CategoriesIdExistsInStorageValidator(categoryRepo)
    useCase = new UpdateGenreUseCase(uow, genreRepo, categoryRepo, categoriesIdExistsInStorageValidator);
  });

  it('should update a genre', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[1].category_id)
      .build();
    await genreRepo.insert(genre);

    let output = await useCase.execute({
      id: genre.id.value,
      name: 'test',
      categories_id: [categories[0].id.value],
    });
    expect(output).toStrictEqual({
      id: genre.id.value,
      name: 'test',
      categories: expect.arrayContaining(
        [categories[0]].map((e) => ({
          id: e.id.value,
          name: e.name,
          created_at: e.created_at,
        })),
      ),
      categories_id: expect.arrayContaining([categories[0].id.value]),
      is_active: true,
      created_at: genre.created_at,
    });

    const arrange = [
      {
        input: {
          id: genre.id.value,
          categories_id: [categories[1].id.value, categories[2].id.value],
          is_active: true,
        },
        expected: {
          id: genre.id.value,
          name: 'test',
          categories: expect.arrayContaining(
            [categories[1], categories[2]].map((e) => ({
              id: e.id.value,
              name: e.name,
              created_at: e.created_at,
            })),
          ),
          categories_id: expect.arrayContaining([
            categories[1].id.value,
            categories[2].id.value,
          ]),
          is_active: true,
          created_at: genre.created_at,
        },
      },
      {
        input: {
          id: genre.id.value,
          name: 'test changed',
          categories_id: [categories[1].id.value, categories[2].id.value],
          is_active: false,
        },
        expected: {
          id: genre.id.value,
          name: 'test changed',
          categories: expect.arrayContaining(
            [categories[1], categories[2]].map((e) => ({
              id: e.id.value,
              name: e.name,
              created_at: e.created_at,
            })),
          ),
          categories_id: expect.arrayContaining([
            categories[1].id.value,
            categories[2].id.value,
          ]),
          is_active: false,
          created_at: genre.created_at,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute(i.input);
      const genreUpdated = await genreRepo.findById(new GenreId(i.input.id));
      expect(output).toStrictEqual({
        id: genre.id.value,
        name: i.expected.name,
        categories: i.expected.categories,
        categories_id: i.expected.categories_id,
        is_active: i.expected.is_active,
        created_at: i.expected.created_at,
      });
      expect(genreUpdated!.toJSON()).toStrictEqual({
        id: genre.id.value,
        name: i.expected.name,
        categories_id: i.expected.categories_id,
        is_active: i.expected.is_active,
        created_at: i.expected.created_at,
      });
    }
  });

  test('rollback transaction', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepo.insert(genre);

    GenreModel.addHook('afterBulkUpdate', 'test', () =>
      Promise.reject(new Error()),
    );

    await expect(
      useCase.execute({
        id: genre.id.value,
        name: 'test',
      }),
    ).rejects.toThrow(Error);

    const notUpdateGenre = await genreRepo.findById(genre.id);
    expect(notUpdateGenre.name).toStrictEqual(genre.name);

    GenreModel.removeHook('afterBulkCreate', 'test');
  });
});
