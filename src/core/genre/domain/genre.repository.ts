import { IRepository } from '@core/@shared/domain/repository/repository.interface';
import { Genre } from './genre.aggregate';
import { GenreId } from './genre-id.vo';
import { ISearchableRepository } from '@core/@shared/domain/repository/searchable-repository.interface';
import { GenreFilter } from './genre-search-params.vo';

interface IGenreRepository extends IRepository<Genre, GenreId> {}
interface IGenreRepository extends ISearchableRepository<Genre, GenreFilter> {}

export { IGenreRepository };
