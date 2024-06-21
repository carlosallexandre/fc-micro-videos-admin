import { IUseCase } from '@core/@shared/application/use-case.interface';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output.mapper';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { Genre } from '@core/genre/domain/genre.aggregate';

export type GetGenreInput = { id: string };

export type GetGenreOutput = GenreOutput;

export class GetGenreUseCase
  implements IUseCase<GetGenreInput, GetGenreOutput>
{
  constructor(
    private readonly genreRepo: IGenreRepository,
    private readonly categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: GetGenreInput): Promise<GenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepo.findById(genreId);

    if (!genre) {
      throw new NotFoundError(genreId, Genre);
    }

    const categories = await this.categoryRepo.findByIds(
      Array.from(genre.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}
