import { CategoryId } from '@core/category/domain/category-id.vo';
import { setupSequelize } from '../../../../@shared/infra/testing/helpers';
import { CategoryModel } from '../../../infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '../../../infra/db/sequelize/category.repository';
import { CreateCategoryUseCase } from './create-category.use-case';

describe('CreateCategory Integration Tests', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should create a category', async () => {
    const output = await useCase.execute({ name: 'test' });
    const aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual(aggregate.toJSON());
  });

  it('should create a category with description', async () => {
    const output = await useCase.execute({
      name: 'test',
      description: 'some description',
    });
    const aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate.id.toString(),
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: aggregate.created_at,
    });
  });

  it('should create a category with is_active = true', async () => {
    const output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: true,
    });
    const aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate.id.toString(),
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: aggregate.created_at,
    });
  });

  it('should create a category with is_active = false', async () => {
    const output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: false,
    });
    const aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate.id.toString(),
      name: 'test',
      description: 'some description',
      is_active: false,
      created_at: aggregate.created_at,
    });
  });
});
