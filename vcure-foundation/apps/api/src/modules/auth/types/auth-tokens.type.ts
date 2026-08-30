export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  subscriptionTier: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthenticatedUser;
}

export interface JwtAccessPayload {
  sub: string; // user id
  email: string;
  role: string;
}
