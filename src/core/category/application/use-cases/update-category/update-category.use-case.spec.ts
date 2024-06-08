import { UpdateCategoryUseCase } from './update-category.use-case';
import { NotFoundError } from '../../../../@shared/domain/errors/not-found.error';
import { EntityValidationError } from '../../../../@shared/domain/validators/validation.error';
import { InvalidUuidError } from '../../../../@shared/domain/value-objects/uuid.vo';
import { Category } from '../../../domain/category.aggregate';
import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository';
import { CategoryId } from '@core/category/domain/category-id.vo';

describe('UpdateCategoryUseCase Unit Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throws an error with invalid category id', async () => {
    await expect(
      useCase.execute({ id: 'fake id', name: 'fake' }),
    ).rejects.toThrow(new InvalidUuidError());
  });

  it('should throws error when category not found', async () => {
    const categoryId = new CategoryId();

    await expect(
      useCase.execute({ id: categoryId.toString(), name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(categoryId.toString(), Category));
  });

  it('should throws an error when category is not valid', async () => {
    const category = Category.fake().aCategory().build();
    repository.items.push(category);
    await expect(
      useCase.execute({
        id: category.id.toString(),
        name: 't'.repeat(256),
      }),
    ).rejects.toThrow(EntityValidationError);
  });

  it('should updates a category', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const category = new Category({ name: 'Movie' });
    repository.items.push(category);

    const output = await useCase.execute({
      id: category.id.toString(),
      name: 'test',
    });
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: category.id.toString(),
      name: 'test',
      description: null,
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
