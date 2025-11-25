import React, { useState } from "react";

import { useCRMData } from "./hooks/useCRMData";
import Inbox, { InboxCard } from "./ui/Inbox";
import LeadCard from "./ui/LeadCard";
import Chat from "./ui/Chat";
import Dock from "./ui/Dock";
import TasksOverlay from "./ui/TasksOverlay";
import type { TasksViewMode } from "./ui/TasksOverlay";

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
    moveConversationWorkspace,
  } = useCRMData();

  const [showFantasma, setShowFantasma] = useState(false);
  const [selectedFantasmaId, setSelectedFantasmaId] = useState<string | null>(
    null
  );

  const [fantasmaPosition, setFantasmaPosition] = useState({ x: 0, y: 0 });
  const [isDraggingFantasma, setIsDraggingFantasma] = useState(false);
  const [fantasmaDragOffset, setFantasmaDragOffset] = useState({
    x: 0,
    y: 0,
  });

  const [showTasks, setShowTasks] = useState(false);
  const [tasksViewMode, setTasksViewMode] = useState<TasksViewMode>("day");

  function handleFantasmaMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    setIsDraggingFantasma(true);

    setFantasmaDragOffset({
      x: event.clientX - fantasmaPosition.x,
      y: event.clientY - fantasmaPosition.y,
    });
  }

  function handleFantasmaMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!isDraggingFantasma) return;

    setFantasmaPosition({
      x: event.clientX - fantasmaDragOffset.x,
      y: event.clientY - fantasmaDragOffset.y,
    });
  }

  function handleFantasmaMouseUp() {
    setIsDraggingFantasma(false);
  }

  const inboxConversations = conversations.filter(
    (c) => c.workspace === "inbox"
  );

  const fantasmaConversations = conversations.filter(
    (c) => c.workspace === "fantasma"
  );

  const activeFantasmaConversation =
    fantasmaConversations.find((c) => c.id === selectedFantasmaId) ||
    fantasmaConversations[0];

  const activeWorkspace: Workspace = showFantasma ? "fantasma" : "inbox";

  function handleSelectConversation(id: string) {
    selectConversation(id);
  }

  const inboxPendingCount = inboxConversations.filter(
    (c) => (c.unreadCount ?? 0) > 0
  ).length;

  const fantasmaPendingCount = fantasmaConversations.filter(
    (c) => (c.unreadCount ?? 0) > 0
  ).length;

  const activeConversationMain =
    inboxConversations.find((c) => c.id === selectedConversationId) ||
    inboxConversations[0];

  const taskCards = inboxConversations.map((c) => (
    <InboxCard
      key={c.id}
      conversation={c}
      selected={c.id === selectedConversationId}
      onClick={() => handleSelectConversation(c.id)}
    />
  ));

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
        <section>
          <Inbox
            conversations={inboxConversations}
            selectedId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </section>

        <section>
          <LeadCard
            clientName={
              activeConversationMain ? activeConversationMain.nome : "Cliente"
            }
            leads={currentQuotes}
            selectedLeadId={selectedQuoteId}
            onSelectLead={setSelectedQuoteId}
          />
        </section>

        <section>
          <Chat
            conversation={
              activeConversationMain
                ? {
                  id: activeConversationMain.id,
                  name: activeConversationMain.nome,
                  avatarUrl: activeConversationMain.avatarUrl,
                }
                : undefined
            }
            contact={
              activeConversationMain
                ? {
                  id: activeConversationMain.id,
                  name: activeConversationMain.nome,
                  phone: activeConversationMain.phone,
                  avatarUrl: activeConversationMain.avatarUrl,
                  channelLabel:
                    activeConversationMain.channelLabel || "via WhatsApp",
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
        onSelectWorkspace={(w) => setShowFantasma(w === "fantasma")}
        onDropToFantasma={(conversationId) => {
          moveConversationWorkspace(conversationId, "fantasma");
          setShowFantasma(true);
        }}
        onOpenTasks={() => setShowTasks(true)}
      />

      {showFantasma && (
        <div
          className="fantasma-overlay"
          onMouseMove={handleFantasmaMouseMove}
          onMouseUp={handleFantasmaMouseUp}
          onMouseLeave={handleFantasmaMouseUp}
          onDragOver={(event) => {
            event.preventDefault();
            console.log("[DRAG] overlay dragOver", {
              x: event.clientX,
              y: event.clientY,
            });
          }}
          onDrop={(event) => {
            event.preventDefault();
            const conversationId = event.dataTransfer.getData("text/plain");
            const sourceWorkspace =
              event.dataTransfer.getData("source-workspace");

            console.log("[DRAG] overlay drop", {
              conversationId,
              sourceWorkspace,
            });
          }}
        >
          <div
            className="fantasma-backdrop"
            onClick={() => setShowFantasma(false)}
            onDragEnter={() => {
              console.log("[DRAG] backdrop dragEnter");
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              console.log("[DRAG] backdrop dragOver");
            }}
            onDragLeave={() => {
              console.log("[DRAG] backdrop dragLeave");
            }}
            onDrop={(event) => {
              event.preventDefault();

              const conversationId =
                event.dataTransfer.getData("text/plain");
              const sourceWorkspace =
                event.dataTransfer.getData("source-workspace");

              console.log("[DRAG] backdrop drop", {
                conversationId,
                sourceWorkspace,
              });

              if (sourceWorkspace === "fantasma" && conversationId) {
                moveConversationWorkspace(conversationId, "inbox");
              }
            }}
          />

          <div
            className="fantasma-shell"
            onMouseDown={handleFantasmaMouseDown}
            style={{
              transform: `translate(${fantasmaPosition.x}px, ${fantasmaPosition.y}px)`,
              cursor: isDraggingFantasma ? "grabbing" : "grab",
            }}
          >
            <header className="fantasma-header">
              <div>
                <div className="fantasma-title">Espaço Fantasma</div>
                <div className="fantasma-subtitle">
                  Conversas fora do ciclo de venda atual
                </div>
              </div>

              <button
                type="button"
                className="fantasma-close"
                onClick={() => setShowFantasma(false)}
              >
                Voltar ao CRM
              </button>
            </header>

            <div className="fantasma-body">
              <div
                className="fantasma-column"
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  const conversationId =
                    e.dataTransfer.getData("text/plain");
                  if (conversationId) {
                    moveConversationWorkspace(conversationId, "fantasma");
                  }
                }}
              >
                <Inbox
                  conversations={fantasmaConversations}
                  selectedId={activeFantasmaConversation?.id || null}
                  onSelectConversation={(id) => setSelectedFantasmaId(id)}
                />
              </div>

              <div className="fantasma-column">
                {activeFantasmaConversation ? (
                  <LeadCard
                    clientName={activeFantasmaConversation.nome}
                    leads={activeFantasmaConversation.quotes}
                    selectedLeadId={
                      activeFantasmaConversation.quotes[0]?.id ?? null
                    }
                    onSelectLead={() => { }}
                  />
                ) : (
                  <div className="fantasma-placeholder">
                    Nenhuma conversa fantasma selecionada
                  </div>
                )}
              </div>

              <div className="fantasma-column">
                {activeFantasmaConversation ? (
                  <Chat
                    conversation={{
                      id: activeFantasmaConversation.id,
                      name: activeFantasmaConversation.nome,
                      avatarUrl: activeFantasmaConversation.avatarUrl,
                    }}
                    contact={{
                      id: activeFantasmaConversation.id,
                      name: activeFantasmaConversation.nome,
                      phone: activeFantasmaConversation.phone,
                      avatarUrl: activeFantasmaConversation.avatarUrl,
                      channelLabel:
                        activeFantasmaConversation.channelLabel ||
                        "via WhatsApp",
                    }}
                    messages={messages}
                    composer={composer}
                    onComposerChange={setComposer}
                    onSendMessage={sendMessage}
                  />
                ) : (
                  <div className="fantasma-placeholder">
                    Nenhuma conversa fantasma selecionada
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTasks && (
        <TasksOverlay
          isOpen={showTasks}
          onClose={() => setShowTasks(false)}
          viewMode={tasksViewMode}
          onChangeViewMode={setTasksViewMode}
          taskCards={taskCards}
        />
      )}
    </div>
  );
}
