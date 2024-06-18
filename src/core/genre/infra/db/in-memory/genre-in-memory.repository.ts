import { SearchParams } from '@core/@shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/@shared/infra/db/in-memory/in-memory-searchable.repository';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { GenreFilter } from '@core/genre/domain/genre-search-params.vo';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';

export class GenreInMemoryRepository
  extends InMemorySearchableRepository<Genre, GenreId, GenreFilter>
  implements IGenreRepository
{
  protected applyFilter(
    items: Genre[],
    params: SearchParams<GenreFilter>,
  ): Genre[] {
    let itemsFiltered = [...items];

    const hasFilterName = Boolean(params.filter?.name);
    if (hasFilterName) {
      itemsFiltered = itemsFiltered.filter((i) =>
        i.name.toLowerCase().includes(params.filter.name.toLowerCase()),
      );
    }

    const hasFilterCategoriesId = Boolean(params.filter?.categories_id);
    if (hasFilterCategoriesId) {
      itemsFiltered = itemsFiltered.filter((i) =>
        params.filter.categories_id.some((c) => i.categories_id.has(c.value)),
      );
    }

    return itemsFiltered;
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}
