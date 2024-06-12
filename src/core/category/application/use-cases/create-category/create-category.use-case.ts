import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { IUseCase } from '../../../../@shared/application/use-case.interface';
import { Category } from '../../../domain/category.aggregate';
import { ICategoryRepository } from '../../../domain/category.repository';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../common/category-output';
import { CreateCategoryInput } from './create-category.input';

export type CreateCategoryOutput = CategoryOutput;

export class CreateCategoryUseCase
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const category = Category.create(input);

    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }

    await this.categoryRepository.insert(category);

    return CategoryOutputMapper.toOutput(category);
  }
}
