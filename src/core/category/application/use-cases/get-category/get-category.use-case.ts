import { CategoryId } from '@core/category/domain/category-id.vo';
import { IUseCase } from '../../../../@shared/application/use-case.interface';
import { NotFoundError } from '../../../../@shared/domain/errors/not-found.error';
import { Category } from '../../../domain/category.aggregate';
import { ICategoryRepository } from '../../../domain/category.repository';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../common/category-output';

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const uuid = new CategoryId(input.id);
    const category = await this.categoryRepository.findById(uuid);
    if (!category) throw new NotFoundError(uuid.toString(), Category);
    return CategoryOutputMapper.toOutput(category);
  }
}
