"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "./SidebarLogo";
import { ConversationHeader } from "./SidebarHeader";
import { ConversationList } from "./SidebarList";
import { ConversationFooter } from "./SidebarFooter";
import { DeleteConfirmDialog } from "./SidebarAlertDialog";
import { UserProfile } from "@/components/user/UserProfile";
import { MobileAuthButtons } from "@/components/auth/MobileAuthButtons";
import { useConversationEdit } from "@/hooks/conversations/useConversationEdit";
import { useConversationDelete } from "@/hooks/conversations/useConversationDelete";
import { useConversationSearch } from "@/hooks/conversations/useConversationSearch";
import { groupConversationsByDate } from "@/lib/dateGrouping";
import type { Conversation } from "@/hooks/conversations/useConversations";
import type { User } from "@/types/user";

type ConversationSidebarContentProps = {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  user?: User | null;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
};

export function ConversationSidebarContent({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onUpdateTitle,
  user,
  onLogout,
  onOpenProfile,
  onLoginClick,
  onRegisterClick,
}: ConversationSidebarContentProps) {
  const { state, setOpen, isMobile } = useSidebar();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const isCollapsed = state === "collapsed";

  // Hooks personalizados
  const editHook = useConversationEdit(conversations, onUpdateTitle);
  const deleteHook = useConversationDelete(onDeleteConversation);
  const searchHook = useConversationSearch(conversations, isCollapsed, setOpen);

  // Agrupar conversaciones filtradas
  const groupedConversations = useMemo(
    () => groupConversationsByDate(searchHook.filteredConversations),
    [searchHook.filteredConversations]
  );

  // Handler para eliminar con cierre de menú
  const handleDelete = (conversationId: string) => {
    setMenuOpenId(null);
    deleteHook.handleDeleteClick(conversationId);
  };

  // Handler para editar con cierre de menú
  const handleStartEdit = (conversation: Conversation) => {
    setMenuOpenId(null);
    editHook.startEditing(conversation);
  };

  // Vista colapsada (solo íconos)
  if (isCollapsed) {
    return (
      <>
        <SidebarHeader className="p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center">
            <Logo size={25} />
          </div>

          <button
            onClick={onCreateConversation}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
            aria-label="Nueva conversación"
          >
            <Plus size={20} />
          </button>

          <button
            onClick={searchHook.handleSearchClick}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg text-gray-600 dark:text-gray-300"
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>
        </SidebarHeader>

        <SidebarContent className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" />

        <SidebarSeparator className="bg-gray-200 dark:bg-gray-700 m-0" />

        <SidebarFooter className="bg-white dark:bg-gray-900 p-3 flex items-center justify-center">
          {user && onLogout && onOpenProfile ? (
            <UserProfile
              user={user}
              conversationCount={conversations.length}
              onLogout={onLogout}
              onOpenProfile={onOpenProfile}
              isCollapsed={true}
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {conversations.length}
            </div>
          )}
        </SidebarFooter>
      </>
    );
  }

  // Vista expandida (normal)
  return (
    <>
      <SidebarHeader>
        <ConversationHeader
          onCreateConversation={onCreateConversation}
          searchQuery={searchHook.searchQuery}
          setSearchQuery={searchHook.setSearchQuery}
          isSearchFocused={searchHook.isSearchFocused}
          setIsSearchFocused={searchHook.setIsSearchFocused}
          searchInputRef={searchHook.searchInputRef}
          onClearSearch={searchHook.clearSearch}
        />
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        <ConversationList
          groupedConversations={groupedConversations}
          filteredCount={searchHook.filteredConversations.length}
          searchQuery={searchHook.searchQuery}
          currentConversationId={currentConversationId}
          editingId={editHook.editingId}
          editTitle={editHook.editTitle}
          setEditTitle={editHook.setEditTitle}
          inputRef={editHook.inputRef}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          onSelectConversation={onSelectConversation}
          onSaveEdit={editHook.saveTitle}
          onCancelEdit={editHook.cancelEditing}
          onStartEdit={handleStartEdit}
          onDelete={handleDelete}
          onClearSearch={searchHook.clearSearch}
        />
      </SidebarContent>

      <SidebarSeparator className="bg-gray-200 dark:bg-gray-700 m-0" />

      <SidebarFooter>
        {user && onLogout && onOpenProfile ? (
          <UserProfile
            user={user}
            conversationCount={conversations.length}
            onLogout={onLogout}
            onOpenProfile={onOpenProfile}
            isCollapsed={false}
          />
        ) : (
          <>
            {/* Mostrar botones de auth solo en mobile */}
            {isMobile && onLoginClick && onRegisterClick ? (
              <MobileAuthButtons
                onLoginClick={onLoginClick}
                onRegisterClick={onRegisterClick}
              />
            ) : (
              <ConversationFooter
                totalConversations={conversations.length}
                filteredCount={searchHook.filteredConversations.length}
                hasSearchQuery={!!searchHook.searchQuery}
              />
            )}
          </>
        )}
      </SidebarFooter>

      {/* Dialog de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={deleteHook.deleteDialogOpen}
        onOpenChange={deleteHook.setDeleteDialogOpen}
        onConfirm={deleteHook.confirmDelete}
      />
    </>
  );
}