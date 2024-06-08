import { CategoryId } from '@core/category/domain/category-id.vo';
import { IUseCase } from '../../../../@shared/application/use-case.interface';
import { NotFoundError } from '../../../../@shared/domain/errors/not-found.error';
import { EntityValidationError } from '../../../../@shared/domain/validators/validation.error';
import { Category } from '../../../domain/category.aggregate';
import { ICategoryRepository } from '../../../domain/category.repository';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../common/category-output';
import { UpdateCategoryInput } from './update-category.input';

export type UpdateCategoryOutput = CategoryOutput;

export class UpdateCategoryUseCase
  implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const categoryId = new CategoryId(input.id);
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) throw new NotFoundError(input.id, Category);

    input.name && category.changeName(input.name);

    if (input?.description !== undefined)
      category.changeDescription(input.description);

    if (input.is_active === true) category.activate();

    if (input.is_active === false) category.deactivate();

    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }

    await this.categoryRepository.update(category);

    return CategoryOutputMapper.toOutput(category);
  }
}
