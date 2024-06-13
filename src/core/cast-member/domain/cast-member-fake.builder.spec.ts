import { CastMemberFakeBuilder } from './cast-member-fake.builder';
import { CastMemberId } from './cast-member-id.vo';
import { CastMemberType, CastMemberTypes } from './cast-member-type.vo';
import { CastMember } from './cast-member.aggregate';

describe('CastMemberFakeBuilder Unit Tests', () => {
  describe('cast_member_id prop', () => {
    let faker: CastMemberFakeBuilder;

    beforeEach(() => {
      faker = CastMemberFakeBuilder.aCastMember();
    });

    it('should throws an error calling id before defining it', () => {
      expect(() => faker.id).toThrow(
        "Property id not have a factory, use 'with' methods",
      );
    });

    it('should be undefined', () => {
      expect(faker['_id']).toBeUndefined();
    });

    it('should be able pass a value to withCastMemberId', () => {
      const castMemberId = new CastMemberId();
      const castMember = faker.withCastMemberId(castMemberId).build();
      expect(castMember.id).toBe(castMemberId);
    });

    it('should be able pass a function to withCastMemberId', () => {
      const castMemberId = new CastMemberId();
      const castMember = faker.withCastMemberId(() => castMemberId).build();
      expect(castMember.id).toBe(castMemberId);
    });
  });

  describe('name prop', () => {
    const faker = CastMemberFakeBuilder.aCastMember();
    const fakerMany = CastMemberFakeBuilder.theCastMembers(2);

    it('should be defined', () => {
      expect(typeof faker['_name']).toBe('function');
    });

    it('should be a string', () => {
      expect(typeof faker.name).toBe('string');
    });

    it('should be able pass a value to withName', () => {
      const castMemberName = 'some name';
      const castMember = faker.withName(castMemberName).build();
      expect(castMember.name).toBe(castMemberName);
    });

    it('should be able pass a function to withName', () => {
      const castMemberName = (index: number) => `test name ${index}`;
      const castMember = faker.withName(castMemberName).build();
      expect(castMember.name).toBe(`test name 0`);
    });

    it('should create an invalid name', () => {
      faker.withInvalidNameTooLong();
      expect(faker.name).toHaveLength(256);
    });
  });

  describe('type prop', () => {
    let faker: CastMemberFakeBuilder;

    beforeEach(() => {
      faker = CastMemberFakeBuilder.aCastMember();
    });

    it('should be defined', () => {
      expect(typeof faker['_type']).toBe('function');
    });

    it('should be defined as an ACTOR', () => {
      expect(faker.type.value).toEqual(CastMemberTypes.ACTOR);
    });

    it('should be able pass a value to withCastMemberType', () => {
      const castMemberType = CastMemberType.createADirector();
      const castMember = faker.withCastMemberType(castMemberType).build();
      expect(castMember.type).toBe(castMemberType);
    });

    it('should be able pass a function to withCastMemberType', () => {
      const type = (index: number) => CastMemberType.createADirector();
      const castMember = faker.withCastMemberType(type).build();
      expect(castMember.type.value).toBe(CastMemberTypes.DIRECTOR);
    });
  });

  describe('created_at prop', () => {
    let faker: CastMemberFakeBuilder;

    beforeEach(() => {
      faker = CastMemberFakeBuilder.aCastMember();
    });

    it('should be undefined', () => {
      expect(faker['_created_at']).toBeUndefined();
    });

    it('should not be able call created_at before initializes it', () => {
      expect(() => faker.created_at).toThrow(
        "Property created_at not have a factory, use 'with' methods",
      );
    });

    it('should be able pass a value to withCreatedAt', () => {
      const createdAt = new Date();
      faker.withCreatedAt(createdAt);
      expect(faker.created_at).toBe(createdAt);
      expect(faker['_created_at']).toBeInstanceOf(Date);
    });

    it('should be able pass a function to withCreatedAt', () => {
      const createdAt = new Date();

      faker.withCreatedAt(
        (index) => new Date(createdAt.getTime() + 1000 * index),
      );

      expect(faker.created_at).toStrictEqual(createdAt);
    });

    it('should be able create a cast member without defining created_at', () => {
      const castMember = faker.build();
      expect(castMember.created_at).toBeInstanceOf(Date);
    });
  });

  it('should create a cast member', () => {
    // with defaults
    let castMember = CastMemberFakeBuilder.aCastMember().build();
    expect(castMember.id).toBeInstanceOf(CastMemberId);
    expect(typeof castMember.name).toBe('string');
    expect(castMember.type.value).toBe(CastMemberTypes.ACTOR);
    expect(castMember.created_at).toBeInstanceOf(Date);

    // with values
    const castMemberId = new CastMemberId();
    const createdAt = new Date();
    castMember = CastMemberFakeBuilder.aCastMember()
      .withCastMemberId(castMemberId)
      .withName('test')
      .withCastMemberType(CastMemberType.createADirector())
      .withCreatedAt(createdAt)
      .build();
    expect(castMember.id).toBe(castMemberId);
    expect(castMember.name).toBe('test');
    expect(castMember.type.value).toBe(CastMemberTypes.DIRECTOR);
    expect(castMember.created_at).toBe(createdAt);
  });

  it('should create many cast members', () => {
    // with defaults
    let castMembers = CastMemberFakeBuilder.theCastMembers(2).build();
    castMembers.forEach((castMember) => {
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(typeof castMember.name).toBe('string');
      expect(castMember.type.value).toBe(CastMemberTypes.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    // with values
    const castMemberId = new CastMemberId();
    const createdAt = new Date();
    castMembers = CastMemberFakeBuilder.theCastMembers(2)
      .withCastMemberId(castMemberId)
      .withName((index) => `test ${index}`)
      .withCastMemberType(getCastMemberType)
      .withCreatedAt(createdAt)
      .build();
    castMembers.forEach((castMember, index) => {
      expect(castMember.id).toBe(castMemberId);
      expect(castMember.name).toBe(`test ${index}`);
      expect(castMember.type).toEqual(getCastMemberType(index));
      expect(castMember.created_at).toBe(createdAt);
    });
  });
});

function getCastMemberType(val: number) {
  const isEven = (val: number) => val % 2 == 0;
  return isEven(val)
    ? CastMemberType.createAnActor()
    : CastMemberType.createADirector();
}
