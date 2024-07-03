import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

export async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}
bootstrap();
