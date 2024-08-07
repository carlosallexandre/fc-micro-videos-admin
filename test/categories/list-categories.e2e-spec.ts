import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { CategoryOutputMapper } from '../../src/core/category/application/use-cases/common/category-output';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';
import { CategoriesController } from '../../src/nest-modules/categories-module/categories.controller';
import { ListCategoriesFixture } from 'src/nest-modules/categories-module/category-fixture';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';

describe('CategoriesController (e2e)', () => {
  describe('/categories (GET)', () => {
    describe('unauthenticated', () => {
      const appHelper = startApp();

      it('should return 401 when not authenticated', () => {
        return request(appHelper.app.getHttpServer())
          .get('/categories')
          .send({})
          .expect(401);
      });

      it('should return 403 when not authenticated as admin', () => {
        return request(appHelper.app.getHttpServer())
          .get('/categories')
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });

    describe('should return categories sorted by created_at when request query is empty', () => {
      let repository: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        repository = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $send_data',
        ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .authenticate(nestApp.app)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('should return categories using paginate, filter and sort', () => {
      let repository: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        repository = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each([arrange])(
        'when query params is $send_data',
        ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .authenticate(nestApp.app)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
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
