import request from 'supertest';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.providers';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members/:id (DELETE)', () => {
    const appHelper = startApp();

    it('should return a response error with 422 status code when id is invalid', () => {
      return request(appHelper.app.getHttpServer())
        .delete('/cast-members/fake-id')
        .expect(422)
        .expect({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Validation failed (uuid is expected)',
        });
    });

    it('should return a response error with 404 status code when cast member not found', () => {
      return request(appHelper.app.getHttpServer())
        .delete('/cast-members/7c60e95e-1130-4b3f-9e00-40bcfc46f280')
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message:
            'CastMember Not Found using ID 7c60e95e-1130-4b3f-9e00-40bcfc46f280',
        });
    });

    it('should delete a cast member', async () => {
      const castMember = CastMember.fake().aDirector().build();
      const castMemberRepository = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
      await castMemberRepository.insert(castMember);

      await request(appHelper.app.getHttpServer())
        .delete(`/cast-members/${castMember.id.toString()}`)
        .expect(204);

      await expect(
        castMemberRepository.findById(castMember.id),
      ).resolves.toBeNull();
    });
  });
});
