import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SCHEMA_TYPE } from '../config-module/config.module';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory(configService: ConfigService<CONFIG_SCHEMA_TYPE>) {
        return {
          privateKey: configService.get('JWT_PRIVATE_KEY'),
          publicKey: configService.get('JWT_PUBLIC_KEY'),
          signOptions: {
            algorithm: 'RS256',
            expiresIn: '300s',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {}
