import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GetGenreUseCase } from './get-genre.use-case';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';

describe('GetGenreUseCase Unit Tests', () => {
  let useCase: GetGenreUseCase;
  let genreRepo: GenreInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;

  beforeEach(() => {
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    useCase = new GetGenreUseCase(genreRepo, categoryRepo);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(useCase.execute({ id: genreId.value })).rejects.toThrow(
      new NotFoundError(genreId, Genre),
    );
  });

  it('should returns a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    categoryRepo.items.push(...categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .build();
    genreRepo.items.push(genre);

    await expect(
      useCase.execute({ id: genre.id.value }),
    ).resolves.toStrictEqual({
      id: genre.id.value,
      name: genre.name,
      is_active: genre.is_active,
      created_at: genre.created_at,
      categories_id: expect.arrayContaining(categories.map((c) => c.id.value)),
      categories: expect.arrayContaining(
        categories.map((c) => ({
          id: c.id.value,
          name: c.name,
          created_at: c.created_at,
        })),
      ),
    });
  });
});
