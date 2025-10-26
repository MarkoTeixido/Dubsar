import { useState, useMemo, useRef, useEffect } from "react";
import type { RefObject } from "react";
import type { Conversation } from "@/hooks/conversations/useConversations";

export function useConversationSearch(
  conversations: Conversation[],
  isCollapsed: boolean,
  setOpen: (open: boolean) => void
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const handleSearchClick = () => {
    if (isCollapsed) {
      setOpen(true);
      setShouldFocusSearch(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Auto-focus en búsqueda después de expandir
  useEffect(() => {
    if (!isCollapsed && shouldFocusSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        setShouldFocusSearch(false);
      }, 300);
    }
  }, [isCollapsed, shouldFocusSearch]);

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    searchInputRef: searchInputRef as RefObject<HTMLInputElement>,
    filteredConversations,
    handleSearchClick,
    clearSearch,
  };
}