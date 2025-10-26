import { useState } from "react";

export function useConversationDelete(onDeleteConversation: (id: string) => void) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const handleDeleteClick = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
      setConversationToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setConversationToDelete(null);
    setDeleteDialogOpen(false);
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
  };
}