import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";
import type { Conversation } from "./useConversations";

export function useConversationEdit(
  conversations: Conversation[],
  onUpdateTitle: (id: string, title: string) => void
) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus cuando se empieza a editar
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const saveTitle = (id: string) => {
    if (editTitle.trim() && editTitle !== conversations.find((c) => c.id === id)?.title) {
      onUpdateTitle(id, editTitle.trim());
    }
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return {
    editingId,
    editTitle,
    setEditTitle,
    inputRef: inputRef as RefObject<HTMLInputElement>,
    startEditing,
    saveTitle,
    cancelEditing,
  };
}