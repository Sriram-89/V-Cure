import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import type { RegisterRequestDto } from "@/types/auth";

export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: RegisterRequestDto) => {
      const res = await authService.register(payload);
      return res;
    },
    onSuccess: (res: any) => {
      const data = res?.data ?? res;
      if (data?.user && data?.tokens) {
        setSession(data.user, data.tokens.accessToken, data.tokens.refreshToken);
        router.push("/onboarding");
      }
    }
  });
}

export function getRegisterErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 409) {
      return "An account with this email already exists.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
