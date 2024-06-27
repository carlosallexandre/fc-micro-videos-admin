import { Either } from '@core/@shared/domain/either';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';

export class GenresIdExistsInDatabaseValidator {
  constructor(private genreRepo: IGenreRepository) {}

  async validate(
    genres_id: string[],
  ): Promise<Either<NotFoundError[], GenreId[]>> {
    const genresId = genres_id.map((id) => new GenreId(id));

    const existsResult = await this.genreRepo.existsById(genresId);

    return existsResult.not_exists.length > 0
      ? Either.fail(
          existsResult.not_exists.map((id) => new NotFoundError(id, Genre)),
        )
      : Either.ok(existsResult.exists);
  }
}
