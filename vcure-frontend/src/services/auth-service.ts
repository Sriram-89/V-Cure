import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  AuthResponseDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RegisterRequestDto
} from "@/types/auth";

import { demoShowcaseService } from "@/lib/demo-showcase-service";

export const authService = {
  register: async (payload: RegisterRequestDto): Promise<AuthResponseDto> => {
    const res = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, payload, {
      skipAuth: true
    });
    if (res?.user?.email) {
      const demoPersona = demoShowcaseService.getPersona(res.user.email);
      if (demoPersona && res.user) {
        res.user.fullName = demoPersona.fullName;
        demoShowcaseService.initializeDemoPersona(demoPersona, res.user.id);
      }
    }
    return res;
  },

  login: async (payload: LoginRequestDto): Promise<AuthResponseDto> => {
    const res = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, payload, {
      skipAuth: true
    });
    if (res?.user?.email) {
      const demoPersona = demoShowcaseService.getPersona(res.user.email);
      if (demoPersona && res.user) {
        res.user.fullName = demoPersona.fullName;
        demoShowcaseService.initializeDemoPersona(demoPersona, res.user.id);
      }
    }
    return res;
  },

  forgotPassword: (payload: ForgotPasswordRequestDto) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", payload, {
      skipAuth: true
    }),

  logout: () => apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
};
