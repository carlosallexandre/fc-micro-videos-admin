import request from 'supertest';
import qs from 'qs';
import { instanceToPlain } from 'class-transformer';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { ListCastMembersFixture } from './cast-member-fixture';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.providers';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member.output';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members (GET)', () => {
    describe('should return cast members sorted by created_at when request query is empty', () => {
      let repository: ICastMemberRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } =
        ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        repository = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      it.each(arrange)(
        'when query params is $send_data',
        ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('should return cast members using paginate, filter and sort', () => {
      let repository: ICastMemberRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        repository = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      it.each(arrange)(
        'when query params is $send_data',
        ({ send_data, expected }) => {
          const queryParams = qs.stringify(send_data);
          return request(nestApp.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});
