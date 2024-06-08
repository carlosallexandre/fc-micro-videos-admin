import { UpdateCategoryUseCase } from './update-category.use-case';
import { NotFoundError } from '../../../../@shared/domain/errors/not-found.error';
import { setupSequelize } from '../../../../@shared/infra/testing/helpers';
import { Category } from '../../../domain/category.aggregate';
import { CategoryModel } from '../../../infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '../../../infra/db/sequelize/category.repository';
import { CategoryId } from '@core/category/domain/category-id.vo';

describe('UpdateCategoryUseCase Integration Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throws an error when category not found', async () => {
    const categoryId = new CategoryId();
    await expect(
      useCase.execute({ id: categoryId.toString(), name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(categoryId.toString(), Category));
  });

  it('should update a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    const output = await useCase.execute({
      id: category.id.toString(),
      name: 'test',
    });
    expect(output).toStrictEqual({
      id: category.id.toString(),
      name: 'test',
      description: category.description,
      is_active: true,
      created_at: category.created_at,
    });
  });

  it.each([
    {
      input: {
        id: new CategoryId().toString(),
        name: 'test',
        description: 'some description',
      },
      expected: {
        id: expect.any(String),
        name: 'test',
        description: 'some description',
        is_active: true,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: new CategoryId().toString(),
        name: 'test',
      },
      expected: {
        id: expect.any(String),
        name: 'test',
        description: null,
        is_active: true,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: new CategoryId().toString(),
        name: 'test',
        is_active: false,
      },
      expected: {
        id: expect.any(String),
        name: 'test',
        description: null,
        is_active: false,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: new CategoryId().toString(),
        name: 'test',
      },
      expected: {
        id: expect.any(String),
        name: 'test',
        description: null,
        is_active: true,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: new CategoryId().toString(),
        name: 'test',
        is_active: true,
      },
      expected: {
        id: expect.any(String),
        name: 'test',
        description: null,
        is_active: true,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: new CategoryId().toString(),
        name: 'test',
        description: 'some description',
        is_active: false,
      },
      expected: {
        id: expect.any(String),
        name: 'test',
        description: 'some description',
        is_active: false,
        created_at: expect.any(Date),
      },
    },
  ])('should update when input is $input', async (i) => {
    // Arrange
    await repository.insert(
      new Category({
        category_id: new CategoryId(i.input.id),
        name: 'some name',
      }),
    );

    // Act
    const output = await useCase.execute({
      id: i.input.id,
      ...('name' in i.input && { name: i.input.name }),
      ...('description' in i.input && { description: i.input.description }),
      ...('is_active' in i.input && { is_active: i.input.is_active }),
    });

    // Assert
    expect(output).toStrictEqual(i.expected);
  });
});
