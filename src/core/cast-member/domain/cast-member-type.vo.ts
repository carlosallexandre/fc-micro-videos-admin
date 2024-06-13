import { ValueObject } from '@core/@shared/domain/value-objects/value-object';

export enum CastMemberTypes {
  DIRECTOR = 1,
  ACTOR = 2,
}

export class CastMemberType extends ValueObject {
  constructor(readonly value: CastMemberTypes) {
    super();
    this.validate();
  }

  static create(value: CastMemberTypes): CastMemberType {
    const type = new CastMemberType(value);
    return type;
  }

  static createAnActor(): CastMemberType {
    return new CastMemberType(CastMemberTypes.ACTOR);
  }

  static createADirector(): CastMemberType {
    return new CastMemberType(CastMemberTypes.DIRECTOR);
  }

  private validate() {
    const knownTypes = Object.values(CastMemberTypes);
    const isValid = knownTypes.includes(this.value);
    if (!isValid) throw new InvalidCastMemberTypeError(this.value);
  }
}

export class InvalidCastMemberTypeError extends Error {
  constructor(invalidType: CastMemberTypes) {
    super(`Invalid cast member type: ${invalidType}`);
  }
}
