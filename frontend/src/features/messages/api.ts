// src/features/messages/api.ts

const API_BASE = "http://127.0.0.1:5050";

export type ChatMessage = {
  id: string;
  from: "me" | "client";
  body: string;
  time?: string;
};

type BackendMessage = {
  id: string;
  authorType: "user" | "contact" | "system";
  body: string;
  type: string;
  sentAt: string;
};

type BackendMessagesResponse = {
  conversationId: string;
  items: BackendMessage[];
};

export async function fetchMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const url = `${API_BASE}/api/conversations/${encodeURIComponent(
    conversationId
  )}/messages`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erro ao buscar mensagens: ${res.status}`);
  }

  const data = (await res.json()) as BackendMessagesResponse;
  const items = Array.isArray(data.items) ? data.items : [];

  return items.map((m) => {
    const from: "me" | "client" =
      m.authorType === "user" ? "me" : "client";

    const time = m.sentAt
      ? new Date(m.sentAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : undefined;

    return {
      id: m.id,
      from,
      body: m.body ?? "",
      time,
    };
  });
}

// Função fina, com URL relativa, conforme solicitado
export async function getMessages(
  conversationId: string
): Promise<BackendMessagesResponse> {
  const url = `/api/conversations/${encodeURIComponent(
    conversationId
  )}/messages`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Erro ao buscar mensagens");
  }

  return (await res.json()) as BackendMessagesResponse;
}
