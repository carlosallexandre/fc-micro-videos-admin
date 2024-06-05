import { IUseCase } from "../../../@shared/application/use-case.interface";
import { NotFoundError } from "../../../@shared/domain/errors/not-found.error";
import { Uuid } from "../../../@shared/domain/value-objects/uuid.vo";
import { Category } from "../../domain/category.entity";
import { ICategoryRepository } from "../../domain/category.repository";
import { CategoryOutput, CategoryOutputMapper } from "./category-output";

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
};

export type UpdateCategoryOutput = CategoryOutput;

export class UpdateCategoryUseCase
  implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const uuid = new Uuid(input.id);
    const category = await this.categoryRepository.findById(uuid);

    if (!category) throw new NotFoundError(input.id, Category);

    input.name && category.changeName(input.name);

    if ("description" in input) category.changeDescription(input.description);

    if (input.is_active === true) category.activate();

    if (input.is_active === false) category.deactivate();

    await this.categoryRepository.update(category);

    return CategoryOutputMapper.toOutput(category);
  }
}
