import { MaxLength } from 'class-validator';
import { CastMember } from './cast-member.aggregate';
import { ClassValidator } from '@core/@shared/domain/validators/class-validator.validator';

class CastMemberRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(castMember: CastMember) {
    this.name = castMember.name;
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
