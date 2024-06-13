import { CastMemberId } from './cast-member-id.vo';
import { CastMemberType } from './cast-member-type.vo';
import { CastMember } from './cast-member.aggregate';

describe('CastMember Unit Tests', () => {
  describe('create', () => {
    it('should create a cast member', () => {
      const anActor = CastMemberType.createAnActor();
      const castMember = CastMember.create({
        name: 'test',
        type: anActor,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('test');
      expect(castMember.type).toBe(anActor);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    it('should not create a cast member with invalid name too long', () => {
      const INVALID_NAME = 'a'.repeat(256);

      const castMember = CastMember.create({
        name: INVALID_NAME,
        type: CastMemberType.createAnActor(),
      });

      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification.toJSON()).toStrictEqual([
        { name: ['name must be shorter than or equal to 255 characters'] },
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
      const aDirector = CastMemberType.createADirector();
      const castMember = CastMember.fake()
        .aCastMember()
        .withCastMemberType(aDirector)
        .build();

      const anActor = CastMemberType.createAnActor();
      castMember.changeType(anActor);

      expect(castMember.type).toBe(anActor);
    });
  });
});
