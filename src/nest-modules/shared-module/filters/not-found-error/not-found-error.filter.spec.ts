import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Entity } from '@core/@shared/domain/entity';
import { NotFoundErrorFilter } from './not-found-error.filter';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import request from 'supertest';

class StubEntity extends Entity {
  id: any;

  toJSON(): Record<string, any> {
    throw new Error('Method not implemented.');
  }
}

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new NotFoundError('fake id', StubEntity);
  }
}

describe('NotFoundErrorFilter', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();

    app = await module
      .createNestApplication()
      .useGlobalFilters(new NotFoundErrorFilter())
      .init();
  });

  it('should catch a NotFoundError', () => {
    // prettier-ignore
    return request(app.getHttpServer())
      .get('/stub')
      .expect(404)
      .expect({
        statusCode: 404,
        error: 'Not Found',
        message: 'StubEntity Not Found using ID fake id',
      });
  });
});
