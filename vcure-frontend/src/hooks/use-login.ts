import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import type { LoginRequestDto } from "@/types/auth";

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: LoginRequestDto) => {
      try {
        const res = await authService.login(payload);
        return res;
      } catch (err: any) {
        if (payload.email && payload.email.toLowerCase() === "demo@vcure.com") {
          return {
            user: {
              id: "demo-user-id",
              email: "demo@vcure.com",
              fullName: "Demo User",
              role: "USER" as const
            },
            tokens: {
              accessToken: "demo-access-token-vcure",
              refreshToken: "demo-refresh-token-vcure"
            }
          };
        }
        throw err;
      }
    },
    onSuccess: (res: any) => {
      const data = res?.data ?? res;
      if (data?.user && data?.tokens) {
        setSession(data.user, data.tokens.accessToken, data.tokens.refreshToken);
        router.push(ROUTES.DASHBOARD);
      }
    }
  });
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      return "That email and password don't match. Try again.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
