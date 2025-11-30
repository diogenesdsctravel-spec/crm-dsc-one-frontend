import React from "react";

type Conversation = {
  id: string;
  nome: string;
  ultimaMensagem?: string;
  avatarUrl?: string;
  unreadCount?: number;
  workspace?: string;
};

export type InboxCardProps = {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
  onDragStart?: (
    event: React.DragEvent<HTMLButtonElement>,
    conversationId: string,
    fromWorkspace: string
  ) => void;
  overrideTitle?: string;
  overrideSubtitle?: string;
  isOverdue?: boolean;
  subtitleVariant?: "default" | "full";
};

export function InboxCard({
  conversation,
  selected,
  onClick,
  onDragStart,
  overrideTitle,
  overrideSubtitle,
  isOverdue,
  subtitleVariant = "default",
}: InboxCardProps) {
  const initial = conversation.nome?.trim()?.[0]?.toUpperCase() || "C";
  const hasUnread = (conversation.unreadCount ?? 0) > 0;

  const displayTitle = overrideTitle ?? conversation.nome;
  const displaySubtitle =
    overrideSubtitle ??
    conversation.ultimaMensagem ??
    "Última mensagem de exemplo…";

  const subtitleStyle: React.CSSProperties | undefined =
    subtitleVariant === "full"
      ? {
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "unset",
        maxWidth: "none",
      }
      : undefined;

  return (
    <button
      type="button"
      className={
        "inbox-item" +
        (selected ? " inbox-item-active" : "") +
        (hasUnread ? " inbox-item-unread" : "")
      }
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={
        onDragStart
          ? (event) =>
            onDragStart(
              event,
              conversation.id,
              conversation.workspace ?? "inbox"
            )
          : undefined
      }
    >
      {isOverdue && (
        <span className="inbox-overdue-badge" title="Tarefa atrasada">
          ⚠️
        </span>
      )}

      <div className="inbox-avatar">
        {conversation.avatarUrl ? (
          <img
            src={conversation.avatarUrl}
            alt={conversation.nome}
            className="inbox-avatar-img"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      <div className="inbox-text">
        <div className="inbox-name">{displayTitle}</div>
        <div className="inbox-last" style={subtitleStyle}>
          {displaySubtitle}
        </div>
      </div>
    </button>
  );
}

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onDragStartConversation?: (id: string) => void;
};

export default function Inbox({
  conversations,
  selectedId,
  onSelectConversation,
  onDragStartConversation,
}: Props) {
  const total = conversations.length;

  function handleDragStart(
    event: React.DragEvent<HTMLButtonElement>,
    conversationId: string,
    fromWorkspace: string
  ) {
    console.log("[Inbox] dragStart id:", conversationId);
    console.log("[DRAG] onDragStart", { conversationId, fromWorkspace });

    event.dataTransfer.setData("text/plain", conversationId);
    event.dataTransfer.setData("source-workspace", fromWorkspace);
    event.dataTransfer.effectAllowed = "move";

    if (onDragStartConversation) {
      onDragStartConversation(conversationId);
    }
  }

  return (
    <div className="inbox-root">
      <p className="inbox-count">
        {total} {total === 1 ? "conversa" : "conversas"}
      </p>

      <div className="inbox-list">
        {conversations.map((c) => (
          <InboxCard
            key={c.id}
            conversation={c}
            selected={c.id === selectedId}
            onClick={() => onSelectConversation(c.id)}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
}
