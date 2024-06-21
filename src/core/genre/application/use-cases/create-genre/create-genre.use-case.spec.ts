import { UnitOfWorkInMemory } from '@core/@shared/infra/db/in-memory/in-memory-unit-of-work';
import { CreateGenreUseCase } from './create-genre.use-case';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { Category } from '@core/category/domain/category.aggregate';

describe('CreateGenreUseCase Unit Tests', () => {
  let useCase: CreateGenreUseCase;
  let uow: UnitOfWorkInMemory;
  let genreRepo: GenreInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;
  let categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator;

  // prettier-ignore
  beforeEach(() => {
    uow = new UnitOfWorkInMemory();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    categoriesIdExistsInStorageValidator = new CategoriesIdExistsInStorageValidator(categoryRepo);
    useCase = new CreateGenreUseCase(uow, genreRepo, categoryRepo, categoriesIdExistsInStorageValidator);
  });

  it('should throw an entity validation error when categories id not exists', async () => {
    expect.assertions(3);
    const spyValidateCategoriesId = jest.spyOn(
      categoriesIdExistsInStorageValidator,
      'validate',
    );

    try {
      await useCase.execute({
        name: 'test',
        categories_id: [
          '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
          '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
        ],
      });
      fail(`It should throws an EntityValidationError instead of resolves`);
    } catch (e) {
      expect(spyValidateCategoriesId).toHaveBeenCalledWith([
        '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
        '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
      ]);
      expect(e).toBeInstanceOf(EntityValidationError);
      expect(e.error).toStrictEqual([
        {
          categories_id: [
            'Category Not Found using ID 4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
            'Category Not Found using ID 7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
          ],
        },
      ]);
    }
  });

  describe('should create a genre', () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();

    beforeEach(async () => {
      await categoryRepo.bulkInsert([category1, category2]);
    });

    it.each([
      {
        input: {
          name: 'test',
          categories_id: [category1.id.value, category2.id.value],
        },
        expected: {
          id: expect.any(String),
          name: 'test',
          categories_id: [category1.id.value, category2.id.value],
          categories: expect.arrayContaining([
            {
              id: category1.id.value,
              name: category1.name,
              created_at: category1.created_at,
            },
            {
              id: category2.id.value,
              name: category2.name,
              created_at: category2.created_at,
            },
          ]),
          is_active: true,
          created_at: expect.any(Date),
        },
      },
      {
        input: {
          name: 'TesT',
          categories_id: [category2.id.value],
          is_active: false,
        },
        expected: {
          id: expect.any(String),
          name: 'TesT',
          categories_id: [category2.id.value],
          categories: [
            {
              id: category2.id.value,
              name: category2.name,
              created_at: category2.created_at,
            },
          ],
          is_active: false,
          created_at: expect.any(Date),
        },
      },
    ])('when input is $input', async ({ input, expected }) => {
      const spyUowDo = jest.spyOn(uow, 'do');
      const spyInsert = jest.spyOn(genreRepo, 'insert');

      const output = await useCase.execute(input);

      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyInsert).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual(expected);
    });
  });
});
