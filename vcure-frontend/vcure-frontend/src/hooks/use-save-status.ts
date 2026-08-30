import { useEffect, useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

export function useSaveStatus(mutation: UseMutationResult<unknown, unknown, unknown>) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (mutation.isPending) {
      setStatus("saving");
      return;
    }
    if (mutation.isError) {
      setStatus("error");
      return;
    }
    if (mutation.isSuccess) {
      setStatus("saved");
      const timeout = setTimeout(() => setStatus("idle"), 2000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isPending, mutation.isError, mutation.isSuccess]);

  return status;
}
