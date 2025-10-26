import type { Conversation } from "@/hooks/conversations/useConversations";

export function groupConversationsByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const groups: Record<string, Conversation[]> = {
    Hoy: [],
    Ayer: [],
    "Últimos 7 días": [],
    "Últimos 30 días": [],
    Anteriores: [],
  };

  conversations.forEach((conv) => {
    const convDate = new Date(conv.updated_at);
    const convDay = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

    if (convDay.getTime() === today.getTime()) {
      groups.Hoy.push(conv);
    } else if (convDay.getTime() === yesterday.getTime()) {
      groups.Ayer.push(conv);
    } else if (convDate > sevenDaysAgo && convDate < yesterday) {
      groups["Últimos 7 días"].push(conv);
    } else if (convDate > thirtyDaysAgo && convDate <= sevenDaysAgo) {
      groups["Últimos 30 días"].push(conv);
    } else {
      groups.Anteriores.push(conv);
    }
  });

  return Object.entries(groups)
    .filter(([, convs]) => convs.length > 0)
    .map(([groupName, convs]) => [
      groupName,
      convs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    ] as [string, Conversation[]]);
}