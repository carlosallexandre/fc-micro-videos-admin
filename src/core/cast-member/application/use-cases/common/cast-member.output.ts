import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';

export type CastMemberOutput = {
  id: string;
  name: string;
  type: number;
  created_at: Date;
};

export class CastMemberOutputMapper {
  static toOutput(castMember: CastMember): CastMemberOutput {
    return {
      id: castMember.id.toString(),
      name: castMember.name,
      type: castMember.type.value,
      created_at: castMember.created_at,
    };
  }
}
