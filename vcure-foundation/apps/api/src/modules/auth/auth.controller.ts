import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseLoginDto } from './dto/firebase-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponse, AuthTokens, AuthenticatedUser } from './types/auth-tokens.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: FirebaseLoginDto): Promise<AuthResponse> {
    return this.authService.loginWithFirebase(dto.idToken);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(user.id, dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.authService.logoutAllSessions(user.id);
  }
}
