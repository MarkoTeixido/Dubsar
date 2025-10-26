"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { ConversationSidebarContent } from "./SidebarContent";
import type { Conversation } from "@/hooks/conversations/useConversations";
import type { User } from "@/types/user";

type ConversationSidebarProps = {
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

export function ConversationSidebar(props: ConversationSidebarProps) {
  return (
    <Sidebar side="left" collapsible="icon">
      <ConversationSidebarContent {...props} />
    </Sidebar>
  );
}