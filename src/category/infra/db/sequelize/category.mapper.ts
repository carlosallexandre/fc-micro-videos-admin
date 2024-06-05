import { EntityValidationError } from "../../../../@shared/domain/validators/validation.error";
import { Uuid } from "../../../../@shared/domain/value-objects/uuid.vo";
import { Category } from "../../../domain/category.entity";
import { CategoryModel } from "./category.model";

export class CategoryMapper {
  static toModel(entity: Category): CategoryModel {
    return CategoryModel.build({
      id: entity.id.toString(),
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  }

  static toEntity(model: CategoryModel): Category {
    const category = new Category({
      category_id: new Uuid(model.id),
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
