"use client";

type ConversationFooterProps = {
  totalConversations: number;
  filteredCount: number;
  hasSearchQuery: boolean;
};

export function ConversationFooter({
  totalConversations,
  filteredCount,
  hasSearchQuery,
}: ConversationFooterProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-0">
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-3 px-4">
        {hasSearchQuery ? (
          <>
            {filteredCount} de {totalConversations}{" "}
            {totalConversations === 1 ? "conversación" : "conversaciones"}
          </>
        ) : (
          <>
            {totalConversations}{" "}
            {totalConversations === 1 ? "conversación" : "conversaciones"}
          </>
        )}
      </div>
    </div>
  );
}