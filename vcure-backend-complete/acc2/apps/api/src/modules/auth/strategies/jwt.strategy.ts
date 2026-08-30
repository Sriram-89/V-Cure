import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepository } from '../auth.repository';
import { AppConfig } from '../../../config/configuration';
import { JwtAccessPayload, AuthenticatedUser } from '../types/auth-tokens.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<AppConfig, true>,
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt', { infer: true }).accessSecret,
    });
  }

  async validate(payload: JwtAccessPayload): Promise<AuthenticatedUser> {
    const user = await this.authRepository.findUserById(payload.sub);

    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      // Canonical multi-role set (F-2) — never collapsed.
      roles: (user as unknown as { userRoles?: { role: { name: string } }[] })
        .userRoles?.map((ur) => ur.role.name) ?? [],
    };
  }
}
