import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  AuthResponseDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RegisterRequestDto
} from "@/types/auth";

export const authService = {
  register: (payload: RegisterRequestDto) =>
    apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, payload, {
      skipAuth: true
    }),

  login: (payload: LoginRequestDto) =>
    apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, payload, {
      skipAuth: true
    }),

  forgotPassword: (payload: ForgotPasswordRequestDto) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", payload, {
      skipAuth: true
    }),

  logout: () => apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
};
