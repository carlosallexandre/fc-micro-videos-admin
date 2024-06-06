import { CategoryModel } from './category.model';
import { CategoryMapper } from './category.mapper';
import { EntityValidationError } from '../../../../@shared/domain/validators/validation.error';
import { Category } from '../../../domain/category.entity';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../@shared/infra/testing/helpers';

describe('CategoryModelMapper Integration Tests', () => {
  setupSequelize({ models: [CategoryModel] });

  it('should throws error when category is invalid', () => {
    try {
      const model = CategoryModel.build({ id: new Uuid().toString() });
      CategoryMapper.toEntity(model);
      fail(
        'The category is valid, but it needs throws a EntityValidationError',
      );
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);
      expect((e as EntityValidationError).error).toMatchObject([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    }
  });

  it('should convert a category model to a category entity', () => {
    const category_id = new Uuid().toString();
    const created_at = new Date();
    const model = CategoryModel.build({
      id: category_id,
      name: 'some value',
      description: 'some description',
      is_active: true,
      created_at,
    });
    const entity = CategoryMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(
      new Category({
        category_id: new Uuid(category_id),
        name: 'some value',
        description: 'some description',
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });

  test('should convert a category entity to a category model', () => {
    const category_id = new Uuid().toString();
    const created_at = new Date();
    const entity = new Category({
      category_id: new Uuid(category_id),
      name: 'some value',
      description: 'some description',
      is_active: true,
      created_at,
    });
    const model = CategoryMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual(entity.toJSON());
  });
});
