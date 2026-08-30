import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profile-service";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";

export function useDeleteAccount() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => profileService.deleteAccount(),
    onSuccess: () => {
      clearSession();
      router.replace(ROUTES.HOME);
    }
  });
}
