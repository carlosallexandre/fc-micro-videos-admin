import { Chance } from 'chance';
import { CastMemberId } from './cast-member-id.vo';
import { CastMemberType } from './cast-member-type.vo';
import { CastMember } from './cast-member.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export class CastMemberFakeBuilder<TBuild = any> {
  // auto generated in entity
  private _id: PropOrFactory<CastMemberId> | undefined = undefined;

  private _name: PropOrFactory<string> = (_index) => this.chance.word();

  private _type: PropOrFactory<CastMemberType> = (_index) =>
    CastMemberType.ACTOR;

  // auto generated in entity
  private _created_at: PropOrFactory<Date> | undefined = undefined;

  private countObjs: number;

  static aCastMember() {
    return new CastMemberFakeBuilder<CastMember>();
  }

  static theCastMembers(countObjs: number) {
    return new CastMemberFakeBuilder<CastMember[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
    this._id = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withCastMemberType(valueOrFactory: PropOrFactory<CastMemberType>) {
    this._type = valueOrFactory;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._created_at = valueOrFactory;
    return this;
  }

  withInvalidNameTooLong(value?: string) {
    this._name = value ?? this.chance.word({ length: 256 });
    return this;
  }

  withInvalidType(value?: CastMemberType) {
    this._type = value ?? (0 as CastMemberType);
    return this;
  }

  build(): TBuild {
    const castMembers = new Array(this.countObjs)
      .fill(undefined)
      .map((_, index) => {
        const castMember = new CastMember({
          id: !this._id ? undefined : this.callFactory(this._id, index),
          name: this.callFactory(this._name, index),
          type: this.callFactory(this._type, index),
          created_at: !this._created_at
            ? undefined
            : this.callFactory(this._created_at, index),
        });
        castMember.validate();
        return castMember;
      });
    return this.countObjs === 1 ? (castMembers[0] as any) : castMembers;
  }

  get id() {
    return this.getValue('id');
  }

  get name() {
    return this.getValue('name');
  }

  get type() {
    return this.getValue('type');
  }

  get created_at() {
    return this.getValue('created_at');
  }

  private getValue(prop: any) {
    const optional = ['id', 'created_at'];
    const privateProp = `_${prop}` as keyof this;

    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`,
      );
    }

    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    return typeof factoryOrValue === 'function'
      ? factoryOrValue(index)
      : factoryOrValue;
  }
}
