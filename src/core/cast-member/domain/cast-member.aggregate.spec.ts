import { CastMemberId } from './cast-member-id.vo';
import { CastMemberType } from './cast-member-type.vo';
import { CastMember } from './cast-member.aggregate';

describe('CastMember Unit Tests', () => {
  describe('create', () => {
    it('should create a cast member', () => {
      const castMember = CastMember.create({
        name: 'test',
        type: CastMemberType.ACTOR,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('test');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    it('should not create a cast member with invalid name too long', () => {
      const INVALID_NAME = 'a'.repeat(256);

      const castMember = CastMember.create({
        name: INVALID_NAME,
        type: CastMemberType.ACTOR,
      });

      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification.toJSON()).toStrictEqual([
        { name: ['name must be shorter than or equal to 255 characters'] },
      ]);
    });

    it('should not create a cast member with invalid cast member type', () => {
      const INVALID_CAST_MEMBER_TYPE = 0;

      const castMember = CastMember.create({
        name: 'test',
        // @ts-expect-error
        type: INVALID_CAST_MEMBER_TYPE,
      });

      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification.toJSON()).toStrictEqual([
        { type: ['type must be one of the following values: '] },
      ]);
    });
  });

  describe('changeName', () => {
    it('should change a cast member name', () => {
      const castMember = CastMember.fake().aCastMember().build();

      castMember.changeName('other name');

      expect(castMember.name).toBe('other name');
      expect(castMember.notification.hasErrors()).toBeFalsy();
    });

    it('should not change a cast member name to invalid name too long', () => {
      const INVALID_NAME = CastMember.fake()
        .aCastMember()
        .withInvalidNameTooLong().name;
      const castMember = CastMember.fake().aCastMember().build();

      castMember.changeName(INVALID_NAME);

      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification.toJSON()).toStrictEqual([
        { name: ['name must be shorter than or equal to 255 characters'] },
      ]);
    });
  });

  describe('changeType', () => {
    it('should change a cast member type', () => {
      const castMember = CastMember.fake()
        .aCastMember()
        .withCastMemberType(CastMemberType.DIRECTOR)
        .build();

      castMember.changeType(CastMemberType.ACTOR);

      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.notification.hasErrors()).toBeFalsy();
    });

    it('should not change a cast member type to invalid cast member type', () => {
      const INVALID_CAST_MEMBER_TYPE = CastMember.fake()
        .aCastMember()
        .withInvalidType().type;

      const castMember = CastMember.fake()
        .aCastMember()
        .withCastMemberType(CastMemberType.DIRECTOR)
        .build();

      castMember.changeType(INVALID_CAST_MEMBER_TYPE);

      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification.toJSON()).toStrictEqual([
        { type: ['type must be one of the following values: '] },
      ]);
    });
  });
});
