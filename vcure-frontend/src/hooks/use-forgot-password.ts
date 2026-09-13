import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { ApiError } from "@/lib/api-client";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword({ email })
  });
}

export function getForgotPasswordErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
