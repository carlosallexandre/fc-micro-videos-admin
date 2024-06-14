import { SearchResult } from '@core/@shared/domain/repository/search-result';
import { CastMember } from './cast-member.aggregate';

type ConstructorProps<A = CastMember> = {
  items: A[];
  total: number;
  current_page: number;
  per_page: number;
};

export class CastMemberSearchResult<
  A extends CastMember = CastMember,
> extends SearchResult<A> {
  private constructor(props: ConstructorProps<A>) {
    super(props);
  }

  static create(props: ConstructorProps): CastMemberSearchResult {
    return new CastMemberSearchResult(props);
  }
}
