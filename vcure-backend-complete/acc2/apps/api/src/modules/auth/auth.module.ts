import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { FirebaseAdminProvider } from './firebase-admin.provider';
import { AppConfig } from '../../config/configuration';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        secret: configService.get('jwt', { infer: true }).accessSecret,
        signOptions: {
          expiresIn: configService.get('jwt', { infer: true }).accessExpiry,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthRepository, 
    AuthService,
    JwtStrategy,
    FirebaseAdminProvider,
    // Applied globally: every route requires auth unless annotated @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthRepository, AuthService],
})
export class AuthModule {}
