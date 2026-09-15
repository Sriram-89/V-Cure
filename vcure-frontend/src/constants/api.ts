// Global API standards locked in 05_API_CONTRACTS.md.
// Never invent endpoints. Never guess DTOs.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://v-cure.onrender.com/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout"
  },
  USER: {
    PROFILE: "/user/profile"
  },
  HEALTH_PROFILE: "/health-profile",
  LIFESTYLE: "/lifestyle",
  MEDICAL_PROFILE: "/medical-profile",
  DASHBOARD: "/dashboard"
} as const;
