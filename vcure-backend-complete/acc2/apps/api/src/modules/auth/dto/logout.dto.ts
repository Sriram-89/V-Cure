import { IsOptional, IsString } from 'class-validator';

/**
 * ACC1 calls POST /auth/logout with no body. Kept separate from
 * RefreshTokenDto (where the token is mandatory) so /auth/refresh keeps
 * strict validation.
 */
export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
