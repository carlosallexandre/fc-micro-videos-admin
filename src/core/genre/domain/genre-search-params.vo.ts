import {
  SearchParams,
  SortDirection,
} from '@core/@shared/domain/repository/search-params';
import { CategoryId } from '@core/category/domain/category-id.vo';

export type GenreFilter = {
  name?: string;
  categories_id?: CategoryId[];
};

export class GenreSearchParams extends SearchParams<GenreFilter> {
  static create(
    props: {
      page?: number;
      per_page?: number;
      sort?: string | null;
      sort_dir?: SortDirection | null;
      filter?: {
        name?: string;
        categories_id?: CategoryId[] | string[];
      };
    } = {},
  ) {
    const hasSort = Boolean(props?.sort);

    const categories_id = props?.filter?.categories_id?.map((c) =>
      c instanceof CategoryId ? c : new CategoryId(c),
    );

    return new GenreSearchParams({
      ...props,
      sort: hasSort ? props.sort : 'created_at',
      sort_dir: hasSort ? props.sort_dir : 'desc',
      filter: {
        name: props?.filter?.name,
        categories_id,
      },
    });
  }

  get filter(): GenreFilter | null {
    return this._filter;
  }

  protected set filter(value: GenreFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value?.name && { name: `${value.name}` }),
      ...(_value?.categories_id &&
        _value?.categories_id?.length && {
          categories_id: value.categories_id,
        }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}
