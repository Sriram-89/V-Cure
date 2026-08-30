/**
 * Canonical authentication contract (locked decision D-1).
 *
 * Response shape is `{ user, tokens }` to match ACC1's `AuthResponseDto`
 * exactly — ACC1 reads `response.tokens.accessToken`. Do NOT reintroduce the
 * previous flat shape or a second competing auth response.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** ISO-8601 absolute expiry. ACC1 expects a timestamp, not a duration. */
  accessTokenExpiresAt: string;
}

/** Auth-response user payload. Mirrors ACC1 `AuthUserDto`. */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  /**
   * F-2: ACC3 canonicalises roles as UserRole[]. All roles are exposed; they
   * are never collapsed into one.
   */
  roles: string[];
  /**
   * ACC1 compatibility. Populated ONLY when the user holds exactly one role —
   * that is the only case where a single value is deterministic. With multiple
   * roles it is null and ACC1 must read `roles` (ACC1-CONTRADICTION-1).
   */
  role: string | null;
  /** F-3: no deterministic rule selects a current subscription — always null. */
  subscriptionTier: string | null;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/**
 * Per-request principal attached by JwtStrategy and read via @CurrentUser().
 * Intentionally NOT the same as AuthUser: this is derived from the JWT plus a
 * single user lookup, and must stay cheap — it does not load UserProfile.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  /** Canonical multi-role set; RolesGuard authorises against this. */
  roles: string[];
}

export interface JwtAccessPayload {
  sub: string; // user id
  email: string;
  /** Canonical role set. Replaces the previous single `role` claim. */
  roles: string[];
}
