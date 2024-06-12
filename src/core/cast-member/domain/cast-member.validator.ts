import { IsEnum, MaxLength } from 'class-validator';
import { CastMember } from './cast-member.aggregate';
import { CastMemberType } from './cast-member-type.vo';
import { ClassValidator } from '@core/@shared/domain/validators/class-validator.validator';

class CastMemberRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  @IsEnum(Object.values(CastMemberType), { groups: ['type'] })
  type: CastMemberType;

  constructor(castMember: CastMember) {
    this.name = castMember.name;
    this.type = castMember.type;
  }
}

class CastMemberValidator extends ClassValidator {
  validate(data: CastMember, ...fields: string[]) {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(new CastMemberRules(data), ...newFields);
  }
}

export class CastMemberValidatorFactory {
  static create() {
    return new CastMemberValidator();
  }
}
