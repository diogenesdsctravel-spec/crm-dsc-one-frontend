import { apiUrl } from "../../services/config";

export type ConversationWorkspace = "inbox" | "fantasma";

export type ConversationStatus = "open" | "archived";

export type ConversationSummary = {
  id: string;
  contactId: string;
  contactName: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  status: ConversationStatus;
  workspace: ConversationWorkspace;
};

export type ConversationListResponse = {
  items: ConversationSummary[];
  page: number;
  pageSize: number;
  total: number;
};

export async function fetchConversations(
  status?: ConversationStatus
): Promise<ConversationListResponse> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);

  let path = "/api/conversations";
  const query = params.toString();
  if (query) {
    path += "?" + query;
  }

  const res = await fetch(apiUrl(path));

  if (!res.ok) {
    throw new Error(
      "Failed to load conversations: " + res.status + " " + res.statusText
    );
  }

  return res.json();
}

// mensagens de uma conversa específica
export type ConversationMessage = {
  id: string;
  from: string;
  body?: string;
  texto?: string;
  sentAt?: string;
  time?: string;
  direction?: string;
  authorType?: string;
};

export type MessagesResponse = {
  items: ConversationMessage[];
};

export async function fetchMessages(
  conversationId: string
): Promise<MessagesResponse> {
  const res = await fetch(
    apiUrl(`/api/conversations/${encodeURIComponent(conversationId)}/messages`)
  );

  if (!res.ok) {
    throw new Error(
      "Failed to load messages: " + res.status + " " + res.statusText
    );
  }

  return res.json();
}
