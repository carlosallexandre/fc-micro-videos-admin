import {
  PaginationOutput,
  PaginationOutputMapper,
} from "../../../@shared/application/pagination-output";
import { IUseCase } from "../../../@shared/application/use-case.interface";
import {
  SearchParams,
  SortDirection,
} from "../../../@shared/domain/repository/search-params";
import { ICategoryRepository } from "../../domain/category.repository";
import { CategoryOutput, CategoryOutputMapper } from "./category-output";

export type ListCategoriesInput = {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: string | null;
};

export type ListCategoriesOutput = PaginationOutput<CategoryOutput>;

export class ListCategoriesUseCase
  implements IUseCase<ListCategoriesInput, ListCategoriesOutput>
{
  constructor(private readonly categoriesRepository: ICategoryRepository) {}

  async execute(input: ListCategoriesInput): Promise<ListCategoriesOutput> {
    const searchResult = await this.categoriesRepository.search(
      new SearchParams(input)
    );

    return PaginationOutputMapper.toOutput(
      searchResult,
      CategoryOutputMapper.toOutput
    );
  }
}
