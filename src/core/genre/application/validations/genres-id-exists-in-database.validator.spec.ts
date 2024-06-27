import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GenresIdExistsInDatabaseValidator } from './genres-id-exists-in-database.validator';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';

describe('GenresIdExistsInDatabaseValidator Unit Tests', () => {
  let genreRepo: GenreInMemoryRepository;
  let validator: GenresIdExistsInDatabaseValidator;

  beforeEach(() => {
    genreRepo = new GenreInMemoryRepository();
    validator = new GenresIdExistsInDatabaseValidator(genreRepo);
  });

  it('should return a list of genres id', async () => {
    const genres = Genre.fake().theGenres(2).build();
    await genreRepo.bulkInsert(genres);

    const result = await validator.validate(genres.map((g) => g.id.value));

    expect(result.isFail()).toBeFalsy();
    expect(result.ok).toStrictEqual(genres.map((g) => g.id));
  });

  it('should return a list of not found errors when at least one genre id not present at database', async () => {
    const genres = Genre.fake().theGenres(3).build();
    await genreRepo.bulkInsert([genres[0], genres[1]]);

    const result = await validator.validate(genres.map((g) => g.id.value));

    expect(result.ok).toBeNull();
    expect(result.error).toStrictEqual([
      new NotFoundError(genres[2].id, Genre),
    ]);
  });
});
