import { CategoryId } from '@core/category/domain/category-id.vo';
import { IUseCase } from '../../../../@shared/application/use-case.interface';
import { ICategoryRepository } from '../../../domain/category.repository';

export type DeleteCategoryInput = {
  id: string;
};

export type DeleteCategoryOutput = void;

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    const categoryId = new CategoryId(input.id);
    await this.categoryRepository.delete(categoryId);
  }
}
