import { AggregateRoot } from '@core/@shared/domain/aggregate-root';
import { CastMemberId } from './cast-member-id.vo';
import { CastMemberType } from './cast-member-type.vo';
import { CastMemberValidatorFactory } from './cast-member.validator';
import { CastMemberFakeBuilder } from './cast-member-fake.builder';

export interface CastMemberProps {
  id: CastMemberId;
  name: string; // Name
  type: CastMemberType;
  created_at: Date;
}

export class CastMember extends AggregateRoot {
  static create(props: { name: string; type: CastMemberType }): CastMember {
    const castMember = new CastMember(props);
    castMember.validate(['name', 'type']);
    return castMember;
  }

  static fake() {
    return CastMemberFakeBuilder;
  }

  protected props: CastMemberProps;

  constructor(props: {
    id?: CastMemberId;
    name: string;
    type: CastMemberType;
    created_at?: Date;
  }) {
    super();

    this.props = {
      id: props.id ?? new CastMemberId(),
      name: props.name,
      type: props.type,
      created_at: props.created_at ?? new Date(),
    };
  }

  get id(): CastMemberId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): CastMemberType {
    return this.props.type;
  }

  get created_at(): Date {
    return this.props.created_at;
  }

  validate(fields: string[] = []) {
    const validator = CastMemberValidatorFactory.create();
    const notification = validator.validate(this, ...fields);
    this.notification.copyErrors(notification);
    return this.notification;
  }

  changeName(name: string): void {
    this.props.name = name;
    this.validate(['name']);
  }

  changeType(type: CastMemberType): void {
    this.props.type = type;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id.toString(),
      name: this.name,
      type: this.type.value,
      created_at: this.created_at,
    };
  }
}
