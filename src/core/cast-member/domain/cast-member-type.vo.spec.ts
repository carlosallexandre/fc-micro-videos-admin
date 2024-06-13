import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from './cast-member-type.vo';

describe('CastMemberType Unit Tests', () => {
  it('should create an actor', () => {
    const anActor = CastMemberType.create(CastMemberTypes.ACTOR);
    expect(anActor).toBeDefined();
    expect(CastMemberType.createAnActor()).toEqual(anActor);
  });

  it('should create a director', () => {
    const aDirector = CastMemberType.create(CastMemberTypes.DIRECTOR);
    expect(aDirector).toBeDefined();
    expect(CastMemberType.createADirector()).toEqual(aDirector);
  });

  it('should not create a CastMemberType for invalid type', () => {
    const INVALID_TYPE = 0;
    expect(() => CastMemberType.create(INVALID_TYPE as any)).toThrow(
      InvalidCastMemberTypeError,
    );
  });
});
