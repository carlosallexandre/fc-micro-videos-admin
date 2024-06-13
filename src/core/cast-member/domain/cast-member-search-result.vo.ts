import { SearchResult } from '@core/@shared/domain/repository/search-result';
import { CastMember } from './cast-member.aggregate';

export class CastMemberSearchResult extends SearchResult<CastMember> {}
