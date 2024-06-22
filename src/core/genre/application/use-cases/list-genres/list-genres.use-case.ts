import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/@shared/application/pagination-output';
import { IUseCase } from '@core/@shared/application/use-case.interface';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output.mapper';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { GenreSearchParams } from '@core/genre/domain/genre-search-params.vo';
import { CategoryId } from '@core/category/domain/category-id.vo';
import { ListGenresInput } from './list-genres.input';

export type ListGenresOutput = PaginationOutput<GenreOutput>;

export class ListGenresUseCase
  implements IUseCase<ListGenresInput, ListGenresOutput>
{
  constructor(
    private readonly genreRepo: IGenreRepository,
    private readonly categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const searchResult = await this.genreRepo.search(
      GenreSearchParams.create(input),
    );

    const categoriesId = new Set(
      searchResult.items.reduce(
        (acc, item) => [...acc, ...item.categories_id.values()],
        <CategoryId[]>[],
      ),
    );

    const categoriesRelated = await this.categoryRepo.findByIds([
      ...categoriesId.values(),
    ]);

    return PaginationOutputMapper.toOutput(searchResult, (genre) =>
      GenreOutputMapper.toOutput(
        genre,
        categoriesRelated.filter((c) => genre.categories_id.has(c.id.value)),
      ),
    );
  }
}
