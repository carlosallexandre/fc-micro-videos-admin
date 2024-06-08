import request from 'supertest';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';

describe('CategoriesControllet (e2e)', () => {
  describe('/categories/:id (GET)', () => {
    const appHelper = startApp();

    it('should return a response error with 422 status code when id is invalid', () => {
      return request(appHelper.app.getHttpServer())
        .get('/categories/fake-id')
        .expect(422)
        .expect({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Validation failed (uuid is expected)',
        });
    });

    it('should return a response error with 404 status code when category not found', () => {
      return request(appHelper.app.getHttpServer())
        .get('/categories/7c60e95e-1130-4b3f-9e00-40bcfc46f280')
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message:
            'Category Not Found using ID 7c60e95e-1130-4b3f-9e00-40bcfc46f280',
        });
    });

    it('should returns a category', async () => {
      const category = Category.fake().aCategory().build();
      const categoryRepository = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      await categoryRepository.insert(category);

      await request(appHelper.app.getHttpServer())
        .get(`/categories/${category.id.toString()}`)
        .expect(200)
        .expect({
          data: {
            id: category.id.toString(),
            name: category.name,
            description: category.description,
            is_active: category.is_active,
            created_at: category.created_at.toISOString(),
          },
        });
    });
  });
});
