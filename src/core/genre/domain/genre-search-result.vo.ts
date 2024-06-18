import { SearchResult } from '@core/@shared/domain/repository/search-result';
import { Genre } from './genre.aggregate';

export class GenreSearchResult extends SearchResult<Genre> {}
