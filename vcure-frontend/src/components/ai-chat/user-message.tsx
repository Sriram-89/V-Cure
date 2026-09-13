import type { ChatMessage } from "@/types/ai-chat";

export function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-card bg-primary px-4 py-3 text-sm text-white">
        {message.content}
      </div>
    </div>
  );
}
