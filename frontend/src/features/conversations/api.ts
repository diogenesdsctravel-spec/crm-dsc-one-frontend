const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5050";

export type ConversationStatus = "open" | "archived";

export type ConversationSummary = {
  id: string;
  contactId: string;
  contactName: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  status: ConversationStatus;
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

  const url =
    API_BASE_URL +
    "/api/conversations" +
    (params.toString() ? "?" + params.toString() : "");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      "Failed to load conversations: " + res.status + " " + res.statusText
    );
  }

  return res.json();
}

