import { Uuid } from '../../../../@shared/domain/value-objects/uuid.vo';
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
    const entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual(entity.toJSON());
  });

  it('should create a category with description', async () => {
    const output = await useCase.execute({
      name: 'test',
      description: 'some description',
    });
    const entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity.id.toString(),
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: entity.created_at,
    });
  });

  it('should create a category with is_active = true', async () => {
    const output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: true,
    });
    const entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity.id.toString(),
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: entity.created_at,
    });
  });

  it('should create a category with is_active = false', async () => {
    const output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: false,
    });
    const entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity.id.toString(),
      name: 'test',
      description: 'some description',
      is_active: false,
      created_at: entity.created_at,
    });
  });
});
