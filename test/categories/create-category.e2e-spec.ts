import request from 'supertest';
import { CreateCategoryFixture } from 'src/nest-modules/categories-module/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import { instanceToPlain } from 'class-transformer';
import { CategoryId } from '@core/category/domain/category-id.vo';

describe('Categories Controller (e2e)', () => {
  const appHelper = startApp();
  let categoryRepository: ICategoryRepository;

  beforeEach(() => {
    categoryRepository = appHelper.app.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/categories (POST)', () => {
    describe('unauthenticated', () => {
      it('should return 401 when not authenticated', () => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send({})
          .expect(401);
      });

      it('should return 403 when not authenticated as admin', () => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .authenticate(appHelper.app, false)
          .send({})
          .expect(403);
      });
    });

    describe('should returns a response error with 422 status code when request body is invalid', () => {
      const arrange = Object.entries(
        CreateCategoryFixture.arrangeInvalidRequest(),
      ).map(([label, value]) => ({ label, value }));

      it.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should returns a response error with 422 status code when throw EntityValidationError', () => {
      const arrange = Object.entries(
        CreateCategoryFixture.arrangeForEntityValidationError(),
      ).map(([label, value]) => ({ label, value }));

      it.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .authenticate(appHelper.app)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a category', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();

      it.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .post('/categories')
            .authenticate(appHelper.app)
            .send(send_data)
            .expect(201);

          const keysInResponse = CreateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const categoryId = new CategoryId(res.body.data.id);
          const category = await categoryRepository.findById(categoryId);
          const output = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(category),
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
