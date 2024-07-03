import { Module } from '@nestjs/common';
import {
  ConfigModuleOptions,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import Joi from 'joi';
import { join } from 'node:path';

type DB_SCHEMA_TYPE = {
  DB_VENDOR: 'mysql' | 'sqlite';
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_LOGGING: boolean;
  DB_AUTO_LOAD_MODELS: boolean;
};

export const CONFIG_DB_SCHEMA: Joi.StrictSchemaMap<DB_SCHEMA_TYPE> = {
  DB_VENDOR: Joi.string().required().valid('mysql', 'sqlite'),
  DB_HOST: Joi.string().required(),
  DB_DATABASE: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_USERNAME: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_PASSWORD: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_PORT: Joi.number().integer().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_LOGGING: Joi.boolean().required(),
  DB_AUTO_LOAD_MODELS: Joi.boolean().required(),
};

type GOOGLE_CLOUD_SCHEMA_TYPE = {
  GOOGLE_CLOUD_CREDENTIALS: string;
  GOOGLE_CLOUD_STORAGE_BUCKET_NAME: string;
};

export const CONFIG_GOOGLE_CLOUD_SCHEMA: Joi.StrictSchemaMap<GOOGLE_CLOUD_SCHEMA_TYPE> =
  {
    GOOGLE_CLOUD_CREDENTIALS: Joi.string().required(),
    GOOGLE_CLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
  };

type RABBITMQ_SCHEMA_TYPE = {
  RABBITMQ_URI: string;
  RABBITMQ_REGISTER_HANDLERS: boolean;
};

export const CONFIG_RABBITMQ_SCHEMA: Joi.StrictSchemaMap<RABBITMQ_SCHEMA_TYPE> =
  {
    RABBITMQ_URI: Joi.string().required(),
    RABBITMQ_REGISTER_HANDLERS: Joi.boolean().required(),
  };

export type CONFIG_SCHEMA_TYPE = DB_SCHEMA_TYPE &
  GOOGLE_CLOUD_SCHEMA_TYPE &
  RABBITMQ_SCHEMA_TYPE;

@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot({
    envFilePath = [],
    ...otherOptions
  }: ConfigModuleOptions = {}) {
    return super.forRoot({
      isGlobal: true,
      envFilePath: [
        ...(Array.isArray(envFilePath) ? envFilePath : [envFilePath]),
        join(process.cwd(), 'envs', `.env.${process.env.NODE_ENV}`),
        join(process.cwd(), 'envs', `.env`),
      ],
      validationSchema: Joi.object({
        ...CONFIG_DB_SCHEMA,
        ...CONFIG_GOOGLE_CLOUD_SCHEMA,
        ...CONFIG_RABBITMQ_SCHEMA,
      }),
      ...otherOptions,
    });
  }
}
