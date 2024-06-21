import { UnitOfWorkInMemory } from '@core/@shared/infra/db/in-memory/in-memory-unit-of-work';
import { DeleteGenreUseCase } from './delete-genre.use-case';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { Genre } from '@core/genre/domain/genre.aggregate';

describe('DeleteGenreUseCase Unit Tests', () => {
  let useCase: DeleteGenreUseCase;
  let uow: UnitOfWorkInMemory;
  let genreRepo: GenreInMemoryRepository;

  beforeEach(() => {
    uow = new UnitOfWorkInMemory();
    genreRepo = new GenreInMemoryRepository();
    useCase = new DeleteGenreUseCase(uow, genreRepo);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();

    await expect(useCase.execute({ id: genreId.value })).rejects.toThrow(
      new NotFoundError(genreId, Genre),
    );
  });

  it('should delete a genre', async () => {
    const genre = Genre.fake().aGenre().build();
    genreRepo.items.push(genre);

    await expect(
      useCase.execute({ id: genre.id.value }),
    ).resolves.toBeUndefined();
    expect(genreRepo.items.length).toBe(0);
  });
});
