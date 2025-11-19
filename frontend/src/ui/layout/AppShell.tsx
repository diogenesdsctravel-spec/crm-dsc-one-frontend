// src/ui/layout/AppShell.tsx
import React, { useEffect, useState } from "react";
import Inbox from "../Inbox";
import Chat from "../Chat";
import type { ChatMessage } from "../../features/messages/api";
import { fetchMessages } from "../../features/messages/api";

export default function AppShell() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composer, setComposer] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // sempre que trocar a conversa selecionada, busca mensagens
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        setMessagesError(null);

        const data = await fetchMessages(selectedConversationId);
        if (!cancelled) {
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setMessagesError("Não foi possível carregar as mensagens.");
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  return (
    <div className="app-root">
      {/* Header simples */}
      <header className="app-header">
        <div className="app-title">CRM DSC ONE</div>
        <button className="app-user-badge" type="button" aria-label="Usuário">
          D
        </button>
      </header>

      <div className="app-columns">
        {/* COLUNA 1 – INBOX */}
        <section className="app-column inbox-column">
          <div className="app-column-header">Inbox</div>
          <Inbox
            selectedId={selectedConversationId}
            onSelectConversation={(id) => {
              setSelectedConversationId(id);
              setComposer("");
            }}
          />
        </section>

        {/* COLUNA 2 – CHAT */}
        <section className="app-column chat-column">
          <div className="app-column-header">Chat</div>

          {loadingMessages && (
            <div className="chat-loading">Carregando mensagens…</div>
          )}

          {messagesError && (
            <div className="chat-error">{messagesError}</div>
          )}

          {!selectedConversationId && !loadingMessages && (
            <div className="chat-empty-global">
              Selecione uma conversa na Inbox para ver o histórico.
            </div>
          )}

          {selectedConversationId && !loadingMessages && (
            <Chat
              messages={messages}
              composer={composer}
              conversation={{ id: selectedConversationId }}
              onComposerChange={setComposer}
            />
          )}
        </section>

        {/* COLUNA 3 – PAINÉIS (placeholder por enquanto) */}
        <section className="app-column panels-column">
          <div className="app-column-header">Painéis</div>
          <div className="panel-placeholder">
            Em breve: informações do cliente, lead, tarefas etc.
          </div>
        </section>
      </div>

      {/* Dock inferior simples */}
      <footer className="app-dock">
        <button className="dock-btn" type="button">
          Inbox
        </button>
        <button className="dock-btn" type="button">
          Vendas
        </button>
        <button className="dock-btn" type="button">
          Config
        </button>
      </footer>
    </div>
  );
}
