import { Test } from '@nestjs/testing';
import { Controller, Get, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { EntityValidationErrorFilter } from './entity-validation-error.filter';
import { EntityValidationError } from '@core/@shared/domain/validators/validation.error';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new EntityValidationError([
      'another error',
      { field1: ['field1 is required', 'error 2'] },
      { field2: ['field2 is required'] },
    ]);
  }
}

describe('EntityValidationErrorFilter', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();

    app = await module
      .createNestApplication()
      .useGlobalFilters(new EntityValidationErrorFilter())
      .init();
  });

  it('should catch a EntityValidationError', () => {
    return request(app.getHttpServer())
      .get('/stub')
      .expect(422)
      .expect({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: [
          'another error',
          'field1 is required',
          'error 2',
          'field2 is required',
        ],
      });
  });
});
