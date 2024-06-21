import { CreateGenreUseCase } from './create-genre.use-case';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';
import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Category } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { GenreCategoryModel } from '@core/genre/infra/db/sequelize/genre-category.model';

describe('CreateGenreUseCase Integration Tests', () => {
  let useCase: CreateGenreUseCase;
  let uow: UnitOfWorkSequelize;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, CategoryModel, GenreCategoryModel],
  });

  // prettier-ignore
  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    categoriesIdExistsInStorageValidator = new CategoriesIdExistsInStorageValidator(categoryRepo);
    useCase = new CreateGenreUseCase(uow, genreRepo, categoryRepo, categoriesIdExistsInStorageValidator);
  });

  it('should create a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    const categoriesId = categories.map((c) => c.id.value);
    await categoryRepo.bulkInsert(categories);

    const output = await useCase.execute({
      name: 'test',
      categories_id: categoriesId,
    });

    const genre = await genreRepo.findById(new GenreId(output.id));
    expect(output).toStrictEqual({
      id: genre.id.value,
      name: genre.name,
      is_active: genre.is_active,
      created_at: genre.created_at,
      categories_id: Array.from(genre.categories_id.values()).map(
        (id) => id.value,
      ),
      categories: expect.arrayContaining(
        categories.map((c) => ({
          id: c.id.value,
          name: c.name,
          created_at: c.created_at,
        })),
      ),
    });
  });

  it('rollback transaction', async () => {
    GenreModel.addHook('afterCreate', 'hook-test', () =>
      Promise.reject(new Error()),
    );
    const categories = Category.fake().theCategories(2).build();
    const categoriesId = categories.map((c) => c.id.value);
    await categoryRepo.bulkInsert(categories);

    await expect(
      useCase.execute({ name: 'test', categories_id: categoriesId }),
    ).rejects.toThrow();
    await expect(genreRepo.findAll()).resolves.toStrictEqual([]);

    GenreModel.removeHook('afterCreate', 'hook-test');
  });
});
