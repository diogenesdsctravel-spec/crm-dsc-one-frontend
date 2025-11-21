/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { fetchContact, type Contact } from "../features/contacts/api";

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
    const [tab, setTab] = useState<"dados" | "midia">("dados");
    const [fullContact, setFullContact] = useState<Contact | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    // Quando abrir o painel, tenta buscar o contato no backend.
    // Se der erro ou a rota não existir, ficamos só com o mock.
    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchContact(String(contact.id));

                if (!cancelled && data) {
                    setFullContact(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Erro ao carregar contato.");
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
    }, [open, contact.id, reloadToken]);

    if (!open) return null;

    if (!contact?.id) {
        return <div className="contact-empty">Nenhum contato selecionado</div>;
    }

    if (loading) {
        return <div className="contact-loading">Carregando contato...</div>;
    }

    if (error) {
        return (
            <div className="contact-error">
                <div>{error}</div>
                <button type="button" onClick={() => setReloadToken((x) => x + 1)}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    const base: Contact = {
        id: String(contact.id),
        name: fullContact?.name ?? contact.name,
        phone: fullContact?.phone ?? contact.phone,
        avatarUrl: fullContact?.avatarUrl ?? contact.avatarUrl,
        channelLabel: fullContact?.channelLabel,
    };

    const initial = base.name.trim().charAt(0).toUpperCase() || "?";

    return (
        <div className="contact-overlay" onClick={onClose}>
            <div className="contact-card" onClick={(e) => e.stopPropagation()}>
                {/* topo: avatar, nome, telefone, ID */}
                <header className="contact-card-header">
                    <div className="contact-avatar-large">
                        {base.avatarUrl ? (
                            <img src={base.avatarUrl} alt={base.name} />
                        ) : (
                            <span>{initial}</span>
                        )}
                    </div>

                    <div className="contact-card-title">
                        <div className="contact-card-name">{base.name}</div>
                        {base.phone && (
                            <div className="contact-card-phone">{base.phone}</div>
                        )}
                        <div className="contact-card-id">ID: {base.id}</div>
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

                {/* abas Dados / Mídia */}
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

                {/* conteúdo das abas */}
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
                                    <span className="contact-media-label">
                                        Mídia {idx + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
