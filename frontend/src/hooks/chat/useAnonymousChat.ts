import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';

export function useAnonymousChat() {
  const [messageCount, setMessageCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMessageCount(storage.getMessageCount());
    setConversationCount(storage.getAnonymousConversations().length);
  }, []);

  const incrementMessageCount = useCallback(() => {
    if (!mounted) return true;
    
    storage.incrementMessageCount();
    const newCount = storage.getMessageCount();
    setMessageCount(newCount);
    
    if (newCount >= 15) {
      setShowLimitModal(true);
      return false;
    }
    
    return true;
  }, [mounted]);

  const checkConversationLimit = useCallback(() => {
    if (!mounted) return true;
    
    const currentCount = storage.getAnonymousConversations().length;
    
    if (currentCount >= 3) {
      setShowLimitModal(true);
      return false;
    }
    
    return true;
  }, [mounted]);

  const incrementConversationCount = useCallback(() => {
    if (!mounted) return;
    
    storage.incrementConversationCount();
    const newCount = storage.getAnonymousConversations().length;
    setConversationCount(newCount);
  }, [mounted]);

  const resetLimits = useCallback(() => {
    storage.resetMessageCount();
    setMessageCount(0);
    setShowLimitModal(false);
  }, []);

  return {
    messageCount,
    conversationCount,
    showLimitModal,
    setShowLimitModal,
    incrementMessageCount,
    incrementConversationCount,
    checkConversationLimit,
    hasReachedMessageLimit: messageCount >= 15,
    hasReachedConversationLimit: conversationCount >= 3,
    remainingMessages: storage.getRemainingMessages(),
    remainingConversations: storage.getRemainingConversations(),
    resetLimits,
  };
}