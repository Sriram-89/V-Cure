import { Sparkles, AlertCircle } from "lucide-react";
import { SafetyWarningBanner } from "@/components/ai-chat/safety-warning-banner";
import { SourceReferences } from "@/components/ai-chat/source-references";
import type { ChatMessage } from "@/types/ai-chat";

export function AiResponseMessage({ message, onRetry }: { message: ChatMessage; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="flex max-w-[80%] flex-col gap-2">
        {message.status === "error" ? (
          <div className="flex items-start gap-2 rounded-card border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p>Something went wrong generating a response.</p>
              {onRetry ? (
                <button type="button" onClick={onRetry} className="mt-1 text-xs font-medium underline">
                  Retry
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-card bg-surface-muted px-4 py-3 text-sm text-text-primary">
            {message.content}
            {message.status === "streaming" ? (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-text-secondary align-middle" aria-hidden="true" />
            ) : null}
          </div>
        )}

        {message.safetyWarning ? <SafetyWarningBanner warning={message.safetyWarning} /> : null}
        {message.sources ? <SourceReferences sources={message.sources} /> : null}
      </div>
    </div>
  );
}
