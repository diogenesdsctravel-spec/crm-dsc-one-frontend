import React, { useState } from "react";
import Inbox from "../Inbox";

const columnBaseStyle: React.CSSProperties = {
  borderRadius: 12,
  backgroundColor: "rgb(229, 231, 235)",
  padding: 16,
  boxSizing: "border-box",
};

export const AppShell: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgb(243, 244, 246)",
      }}
    >
      <header
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          boxSizing: "border-box",
          backgroundColor: "white",
          borderBottom: "1px solid rgb(229, 231, 235)",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          CRM DSC ONE
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            backgroundColor: "rgb(209, 213, 219)",
          }}
        />
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          gap: 12,
          padding: 12,
          boxSizing: "border-box",
        }}
      >
        <section
          style={{
            ...columnBaseStyle,
            flexBasis: "24%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Inbox
            selectedId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        </section>

        <section
          style={{
            ...columnBaseStyle,
            flexBasis: "52%",
          }}
        >
          <div style={{ opacity: 0.6, marginBottom: 8 }}>Chat</div>
          <div
            style={{
              height: "100%",
              borderRadius: 8,
              backgroundColor: "rgb(209, 213, 219)",
            }}
          />
        </section>

        <section
          style={{
            ...columnBaseStyle,
            flexBasis: "24%",
          }}
        >
          <div style={{ opacity: 0.6, marginBottom: 8 }}>Painéis</div>
          <div
            style={{
              height: "100%",
              borderRadius: 8,
              backgroundColor: "rgb(209, 213, 219)",
            }}
          />
        </section>
      </main>

      <footer
        style={{
          height: 72,
          borderTop: "1px solid rgb(229, 231, 235)",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "rgb(229, 231, 235)",
          }}
        />
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "rgb(229, 231, 235)",
          }}
        />
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "rgb(229, 231, 235)",
          }}
        />
      </footer>
    </div>
  );
};

