import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/sequelize';
import { TestingModule, Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { AppModule } from 'src/app.module';
import { applyGlobalConfig } from 'src/global-config';

export function startApp() {
  let _app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        inject: [getConnectionToken()],
        factory(sequelize: Sequelize) {
          return new UnitOfWorkSequelize(sequelize);
        },
      })
      .compile();

    _app = moduleFixture.createNestApplication();
    applyGlobalConfig(_app);

    await _app.get(getConnectionToken()).sync({ force: true });
    await _app.init();
  });

  afterEach(async () => {
    await _app?.close();
  });

  return {
    get app() {
      return _app;
    },
  };
}
