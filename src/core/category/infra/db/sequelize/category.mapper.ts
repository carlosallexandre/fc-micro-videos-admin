import { CategoryId } from '@core/category/domain/category-id.vo';
import { EntityValidationError } from '../../../../@shared/domain/validators/validation.error';
import { Category } from '../../../domain/category.aggregate';
import { CategoryModel } from './category.model';

export class CategoryMapper {
  static toModel(category: Category): CategoryModel {
    return CategoryModel.build({
      id: category.id.toString(),
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
    });
  }

  static toEntity(model: CategoryModel): Category {
    const category = new Category({
      category_id: new CategoryId(model.id),
      name: model.name,
      description: model.description,
      is_active: model.is_active,
      created_at: model.created_at,
    });
    category.validate();
    if (category.notification.hasErrors())
      throw new EntityValidationError(category.notification.toJSON());
    return category;
  }
}
