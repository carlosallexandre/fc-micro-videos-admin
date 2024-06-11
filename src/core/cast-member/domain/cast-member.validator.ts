import { IsEnum, MaxLength } from 'class-validator';
import { Notification } from '@core/@shared/domain/validators/notification';
import { ClassValidatorFields } from '@core/@shared/domain/validators/validator-fields';
import { CastMember } from './cast-member.aggregate';
import { CastMemberType } from './cast-member-type.vo';

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

class CastMemberValidator extends ClassValidatorFields {
  validate(
    notification: Notification,
    data: CastMember,
    fields: string[],
  ): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new CastMemberRules(data), newFields);
  }
}

export class CastMemberValidatorFactory {
  static create() {
    return new CastMemberValidator();
  }
}
