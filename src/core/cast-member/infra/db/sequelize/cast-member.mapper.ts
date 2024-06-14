import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberModel, CastMemberModelProps } from './cast-member.model';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';

export class CastMemberMapper {
  static toModel(castMember: CastMember): CastMemberModelProps {
    return {
      id: castMember.id.toString(),
      name: castMember.name,
      type: castMember.type.value,
      created_at: castMember.created_at,
    };
  }

  static toDomain(model: CastMemberModel): CastMember {
    return new CastMember({
      id: new CastMemberId(model.id),
      name: model.name,
      type: CastMemberType.create(model.type),
      created_at: model.created_at,
    });
  }
}
