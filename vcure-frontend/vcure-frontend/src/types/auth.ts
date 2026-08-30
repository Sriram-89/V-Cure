// Auth DTOs — locked to 05_API_CONTRACTS.md Part 5A.
// Never rename fields to match frontend conventions; mirror the API exactly.

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthUserDto {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  role: "USER" | "PREMIUM" | "ADMIN";
  onboardingCompleted: boolean;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  tokens: AuthTokensDto;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ApiErrorDto {
  statusCode: number;
  message: string;
  error?: string;
}
