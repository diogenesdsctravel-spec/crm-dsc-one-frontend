/* src/ui/ContactPanel.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface ContactPanelProps {
    open: boolean;
    onClose: () => void;
    contact: {
        name: string;
        phone?: string;
        id: string | number;
        avatarUrl?: string;
    };
}

export default function ContactPanel({
    open,
    onClose,
    contact,
}: ContactPanelProps) {

    const [tab, setTab] = React.useState<"dados" | "midia">("dados");

    if (!open) return null;

    const initial = contact.name?.trim()?.charAt(0)?.toUpperCase() || "?";

    return (
        <div className="contact-overlay" onClick={onClose}>
            <div className="contact-card" onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <header className="contact-card-header">
                    <div className="contact-avatar-large">
                        {contact.avatarUrl ? (
                            <img src={contact.avatarUrl} alt={contact.name} />
                        ) : (
                            <span>{initial}</span>
                        )}
                    </div>

                    <div className="contact-card-title">
                        <div className="contact-card-name">{contact.name}</div>
                        <div className="contact-card-phone">{contact.phone ?? "Sem telefone"}</div>
                        <div className="contact-card-id">ID: {contact.id}</div>
                    </div>

                    <button
                        type="button"
                        className="contact-close-btn"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </header>

                {/* TABS */}
                <nav className="contact-tabs">
                    <button
                        type="button"
                        className={
                            "contact-tab" + (tab === "dados" ? " contact-tab-active" : "")
                        }
                        onClick={() => setTab("dados")}
                    >
                        Dados
                    </button>

                    <button
                        type="button"
                        className={
                            "contact-tab" + (tab === "midia" ? " contact-tab-active" : "")
                        }
                        onClick={() => setTab("midia")}
                    >
                        Mídia
                    </button>
                </nav>

                {/* CONTENT */}
                <div className="contact-body">

                    {tab === "dados" && (
                        <button
                            type="button"
                            className="contact-export-btn"
                            onClick={() => alert("Exportar conversa (mock)")}
                        >
                            Exportar conversa
                        </button>
                    )}

                    {tab === "midia" && (
                        <div className="contact-media-grid">
                            {Array.from({ length: 20 }).map((_, idx) => (
                                <div key={idx} className="contact-media-item">
                                    <div className="contact-media-thumb" />
                                    <span className="contact-media-label">Mídia {idx + 1}</span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
