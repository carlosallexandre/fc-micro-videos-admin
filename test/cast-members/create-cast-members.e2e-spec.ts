import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.providers';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';
import { CreateCastMemberFixture } from './cast-member-fixture';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member.output';
import { instanceToPlain } from 'class-transformer';

describe('Categories Controller (e2e)', () => {
  const appHelper = startApp();
  let castMemberRepository: ICastMemberRepository;

  beforeEach(() => {
    castMemberRepository = appHelper.app.get(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  describe('/cast-members (POST)', () => {
    describe('should returns a response error with 422 status code when request body is invalid', () => {
      const arrange = Object.entries(
        CreateCastMemberFixture.arrangeInvalidRequest(),
      ).map(([label, value]) => ({ label, value }));

      it.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/cast-members')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should returns a response error with 422 status code when throw EntityValidationError', () => {
      const arrange = Object.entries(
        CreateCastMemberFixture.arrangeForEntityValidationError(),
      ).map(([label, value]) => ({ label, value }));

      it.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/cast-members')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a cast member', () => {
      const arrange = CreateCastMemberFixture.arrangeForCreate();

      it.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .post('/cast-members')
            .send(send_data)
            .expect(201);

          const keysInResponse = CreateCastMemberFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const castMemberId = new CastMemberId(res.body.data.id);
          const castMember = await castMemberRepository.findById(castMemberId);
          const output = CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(castMember),
          );
          const serializedOutput = instanceToPlain(output);
          expect(res.body.data).toStrictEqual({
            id: serializedOutput.id,
            created_at: serializedOutput.created_at,
            ...expected,
          });
        },
      );
    });
  });
});
