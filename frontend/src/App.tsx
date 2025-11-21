// frontend/src/App.tsx
import React, { useState } from "react";

import { useCRMData } from "./hooks/useCRMData";
import Inbox from "./ui/Inbox";
import LeadCard from "./ui/LeadCard";
import Chat from "./ui/Chat";
import Dock from "./ui/Dock";

type Workspace = "inbox" | "fantasma";

export default function App() {
  const {
    conversations,
    selectedConversationId,
    selectConversation,
    selectedConversation,
    messages,
    composer,
    setComposer,
    sendMessage,
    currentQuotes,
    selectedQuoteId,
    setSelectedQuoteId,
  } = useCRMData();

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>("inbox");

  function handleSelectConversation(id: string) {
    selectConversation(id);
  }

  const filteredConversations = conversations.filter(
    (c) => c.workspace === activeWorkspace
  );

  const inboxPendingCount = conversations.filter(
    (c) => c.workspace === "inbox" && (c.unreadCount ?? 0) > 0
  ).length;

  const fantasmaPendingCount = conversations.filter(
    (c) => c.workspace === "fantasma" && (c.unreadCount ?? 0) > 0
  ).length;

  const activeConversation =
    selectedConversation || filteredConversations[0];

  return (
    <div
      className={
        "app" + (activeWorkspace === "fantasma" ? " app-fantasma" : "")
      }
    >
      <header className="topbar">
        <div className="app-title">DSC CRM</div>

        <div className="user">
          <div className="avatar">D</div>
          <strong>DSC TRAVEL</strong>
        </div>
      </header>

      <main className="main">
        {/* Coluna 1 – Inbox */}
        <section>
          <Inbox
            conversations={filteredConversations}
            selectedId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </section>

        {/* Coluna 2 – Lead / Viagens do cliente */}
        <section>
          <LeadCard
            clientName={
              activeConversation ? activeConversation.nome : "Cliente"
            }
            leads={currentQuotes}
            selectedLeadId={selectedQuoteId}
            onSelectLead={setSelectedQuoteId}
          />
        </section>

        {/* Coluna 3 – Chat */}
        <section>
          <Chat
            conversation={
              activeConversation
                ? {
                  id: activeConversation.id,
                  name: activeConversation.nome,
                  avatarUrl: activeConversation.avatarUrl,
                }
                : undefined
            }
            contact={
              activeConversation
                ? {
                  id: activeConversation.id,
                  name: activeConversation.nome,
                  phone: activeConversation.phone,
                  avatarUrl: activeConversation.avatarUrl,
                  channelLabel:
                    activeConversation.channelLabel || "via WhatsApp",
                }
                : undefined
            }
            messages={messages}
            composer={composer}
            onComposerChange={setComposer}
            onSendMessage={sendMessage}
          />
        </section>
      </main>

      <Dock
        activeWorkspace={activeWorkspace}
        inboxPendingCount={inboxPendingCount}
        fantasmaPendingCount={fantasmaPendingCount}
        onSelectWorkspace={setActiveWorkspace}
      />
    </div>
  );
}
