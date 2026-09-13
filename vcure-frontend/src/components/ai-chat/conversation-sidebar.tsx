"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import {
  useConversations,
  useCreateConversation,
  useRenameConversation,
  useDeleteConversation
} from "@/hooks/use-ai-chat";
import { useAiChatStore } from "@/store/ai-chat-store";

export function ConversationSidebar() {
  const { data, isLoading, isError } = useConversations();
  const activeConversationId = useAiChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useAiChatStore((state) => state.setActiveConversationId);
  const createConversation = useCreateConversation();
  const renameConversation = useRenameConversation();
  const deleteConversation = useDeleteConversation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setDraftTitle(currentTitle);
  };

  const commitRename = (id: string) => {
    const trimmed = draftTitle.trim();
    if (trimmed) {
      renameConversation.mutate({ conversationId: id, title: trimmed });
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full flex-col rounded-card border border-border bg-surface p-4 shadow-card">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => createConversation.mutate()}
        isLoading={createConversation.isPending}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        New conversation
      </Button>

      <div className="mt-4 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-surface-muted" />
            ))}
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-danger">Couldn&apos;t load conversations.</p>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MessageSquare className="h-6 w-6 text-text-secondary" aria-hidden="true" />
            <p className="text-sm text-text-secondary">Start a new conversation to begin.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1" aria-label="Conversation history">
            {data.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const isEditing = editingId === conversation.id;

              return (
                <li key={conversation.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-1 rounded-md border border-border p-2">
                      <input
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") commitRename(conversation.id);
                          if (event.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        aria-label="Conversation title"
                        className="min-w-0 flex-1 border-none bg-transparent text-sm text-text-primary outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Save title"
                        onClick={() => commitRename(conversation.id)}
                        className="rounded-md p-1 text-primary hover:bg-primary-50"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Cancel"
                        onClick={() => setEditingId(null)}
                        className="rounded-md p-1 text-text-secondary hover:bg-surface-muted"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "group flex items-center gap-1 rounded-md px-2 py-2",
                        isActive ? "bg-primary-50" : "hover:bg-surface-muted"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveConversationId(conversation.id)}
                        aria-current={isActive ? "true" : undefined}
                        className="min-w-0 flex-1 truncate text-left text-sm text-text-primary"
                      >
                        {conversation.title || "New conversation"}
                      </button>
                      <button
                        type="button"
                        aria-label="Rename conversation"
                        onClick={() => startRename(conversation.id, conversation.title)}
                        className="rounded-md p-1 text-text-secondary opacity-0 hover:bg-surface group-hover:opacity-100"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete conversation"
                        onClick={() => setPendingDeleteId(conversation.id)}
                        className="rounded-md p-1 text-text-secondary opacity-0 hover:bg-red-50 hover:text-danger group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete this conversation?"
        description="This will permanently remove the conversation and its messages."
        confirmLabel="Delete"
        isConfirming={deleteConversation.isPending}
        onConfirm={() => {
          if (pendingDeleteId) deleteConversation.mutate(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
