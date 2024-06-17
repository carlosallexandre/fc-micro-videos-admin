import {
  SearchParams,
  SortDirection,
} from '@core/@shared/domain/repository/search-params';
import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from './cast-member-type.vo';
import { SearchValidationError } from '@core/@shared/domain/errors/validation.error';

export type CastMemberFilter = {
  name?: string | null;
  type?: CastMemberType | null;
};

export class CastMemberSearchParams extends SearchParams<CastMemberFilter> {
  private constructor(
    props: {
      page?: number;
      per_page?: number;
      sort?: string | null;
      sort_dir?: SortDirection | null;
      filter?: CastMemberFilter | null;
    } = {},
  ) {
    const hasSort = Boolean(props?.sort);
    super({
      ...props,
      sort: hasSort ? props.sort : 'created_at',
      sort_dir: hasSort ? props?.sort_dir : 'desc',
    });
  }

  static create(
    props: {
      page?: number;
      per_page?: number;
      sort?: string | null;
      sort_dir?: SortDirection | null;
      filter?: {
        name?: string | null;
        type?: CastMemberTypes | null;
      };
    } = {},
  ): CastMemberSearchParams {
    try {
      const filter = props?.filter ?? {};
      return new CastMemberSearchParams({
        ...props,
        filter: {
          name: filter?.name,
          type:
            'type' in filter && filter.type != undefined
              ? CastMemberType.create(props.filter.type)
              : null,
        },
      });
    } catch (e) {
      let err = e;
      if (e instanceof InvalidCastMemberTypeError) {
        err = new SearchValidationError([{ type: [e.message] }]);
      }
      throw err;
    }
  }

  get filter() {
    return this._filter;
  }

  protected set filter(val: CastMemberFilter | null) {
    const value = val ?? {};
    this._filter = { name: null, type: null };

    if ('name' in value) {
      const name = value.name;
      this._filter.name =
        name === null || name === undefined || (name as unknown) === ''
          ? null
          : `${name}`;
    }

    if ('type' in value) {
      const type = value.type;
      this._filter.type = type;
    }
  }
}
