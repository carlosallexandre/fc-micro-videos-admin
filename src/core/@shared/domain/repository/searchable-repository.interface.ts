import { Entity } from '../entity';
import { SearchParams } from './search-params';
import { SearchResult } from './search-result';

export interface ISearchableRepository<E extends Entity, Filter = string> {
  search(props: SearchParams<Filter>): Promise<SearchResult<E>>;
}
