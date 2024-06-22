import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule, getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config-module/config.module';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      async useFactory(configService: ConfigService<CONFIG_SCHEMA_TYPE>) {
        const dbVendor = configService.get('DB_VENDOR');

        switch (dbVendor) {
          case 'sqlite':
            return {
              dialect: 'sqlite',
              host: configService.get('DB_HOST'),
              logging: configService.get('DB_LOGGING'),
              autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            };
          case 'mysql':
            return {
              dialect: 'mysql',
              host: configService.get('DB_HOST'),
              port: configService.get('DB_PORT'),
              database: configService.get('DB_DATABASE'),
              username: configService.get('DB_USERNAME'),
              password: configService.get('DB_PASSWORD'),
              logging: configService.get('DB_LOGGING'),
              autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            };
          default:
            throw new Error(`Unsupported database configuration: ${dbVendor}`);
        }
      },
    }),
  ],
  providers: [
    {
      provide: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
      inject: [getConnectionToken()],
      useFactory(sequelize: Sequelize) {
        return new UnitOfWorkSequelize(sequelize);
      },
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
    },
  ],
  exports: ['UnitOfWork'],
})
export class DatabaseModule {}
