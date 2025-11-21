import React, { useEffect, useState } from "react";
import { fetchConversations } from "../features/conversations/api";
import type { ConversationSummary } from "../features/conversations/api";

interface Conversation {
  id: string;
  nome: string;
  ultimaMensagem?: string;
  avatarUrl?: string;
}

interface Props {
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
}

export default function Inbox({ selectedId, onSelectConversation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchConversations("open");

        if (cancelled) return;

        const mapped: Conversation[] = data.items.map(
          (c: ConversationSummary): Conversation => ({
            id: c.id,
            nome: c.contactName,
            ultimaMensagem: c.lastMessagePreview,
            avatarUrl: undefined,
          })
        );

        setConversations(mapped);
        console.log("[Inbox] conversas da API:", mapped);
      } catch (err) {
        if (!cancelled) {
          setError("Erro ao carregar conversas.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  if (loading) {
    return <div>Carregando conversas...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 12 }}>
        <div style={{ color: "red", fontSize: 14, marginBottom: 8 }}>
          {error}
        </div>
        <button
          type="button"
          onClick={() => setReloadToken((x) => x + 1)}
          style={{
            fontSize: 14,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const total = conversations.length;

  return (
    <div className="inbox-root">
      <p className="inbox-count">{total} conversas</p>

      <div className="inbox-list">
        {conversations.map((c) => {
          const initial = c.nome?.trim()?.[0]?.toUpperCase() || "C";

          return (
            <button
              key={c.id}
              type="button"
              className={
                "inbox-item" + (c.id === selectedId ? " inbox-item-active" : "")
              }
              onClick={() => onSelectConversation(c.id)}
            >
              <div className="inbox-avatar">
                {c.avatarUrl ? (
                  <img
                    src={c.avatarUrl}
                    alt={c.nome}
                    className="inbox-avatar-img"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>

              <div className="inbox-text">
                <div className="inbox-name">{c.nome}</div>
                <div className="inbox-last">
                  {c.ultimaMensagem || "Última mensagem de exemplo…"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
