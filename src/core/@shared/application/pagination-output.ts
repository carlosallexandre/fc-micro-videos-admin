import { Entity } from '../domain/entity';
import { SearchResult } from '../domain/repository/search-result';

export type PaginationOutput<Item> = {
  items: Item[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
};

type MapperFn<Input, Output> = (input: Input) => Output;

export class PaginationOutputMapper {
  static toOutput<Input extends Entity, Output>(
    result: SearchResult<Input>,
    mapperFn: MapperFn<Input, Output>,
  ): PaginationOutput<Output> {
    return {
      ...result.toJSON(),
      items: result.items.map(mapperFn),
    };
  }
}
