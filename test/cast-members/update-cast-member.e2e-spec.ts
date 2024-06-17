import request from 'supertest';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import { UpdateCastMemberFixture } from './cast-member-fixture';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.providers';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member.output';
import { instanceToPlain } from 'class-transformer';

describe('CastMembersController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('/cast-members/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const nestApp = startApp();
      const faker = CastMember.fake().aDirector();

      it.each([
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          send_data: { name: faker.name },
          expected: {
            message:
              'CastMember Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ])('when id is $id', async ({ id, send_data, expected }) => {
        return request(nestApp.app.getHttpServer())
          .patch(`/cast-members/${id}`)
          .send(send_data)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should a response error with 422 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      it.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .patch(`/cast-members/${uuid}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationError =
        UpdateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));
      let castMemberRepo: ICastMemberRepository;

      beforeEach(() => {
        castMemberRepo = app.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      it.each(arrange)('when body is $label', async ({ value }) => {
        const castMember = CastMember.fake().anActor().build();
        await castMemberRepo.insert(castMember);
        return request(app.app.getHttpServer())
          .patch(`/cast-members/${castMember.id.toString()}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a cast member', () => {
      const appHelper = startApp();
      const arrange = UpdateCastMemberFixture.arrangeForUpdate();
      let castMemberRepo: ICastMemberRepository;

      beforeEach(async () => {
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      it.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const castMemberCreated = CastMember.fake().anActor().build();
          await castMemberRepo.insert(castMemberCreated);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/cast-members/${castMemberCreated.id.toString()}`)
            .send(send_data)
            .expect(200);

          const keyInResponse = UpdateCastMemberFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

          const id = res.body.data.id;
          const castMemberId = new CastMemberId(id);
          const categoryUpdated = await castMemberRepo.findById(castMemberId);
          const output = CastMemberOutputMapper.toOutput(categoryUpdated);
          const presenter = CastMembersController.serialize(output);
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            name: expected?.name || serialized.name,
            type: expected?.type || serialized.type,
            created_at: serialized.created_at,
          });
        },
      );
    });
  });
});
