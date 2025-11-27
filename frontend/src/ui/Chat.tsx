// src/ui/Chat.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import ContactPanel from "./ContactPanel";
import TaskPanel from "./TaskPanel";
import CalendarPicker from "./CalendarPicker";

import { createTask } from "../features/tasks/api";
import { fetchMessages } from "../features/conversations/api";

interface ChatContact {
    id: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    channelLabel?: string;
}

interface ChatProps {
    // mensagens vindas da API ou de mock
    messages: any[];

    // estado do composer (texto digitado)
    composer: string;

    conversation?: {
        id: string;
        name?: string;
        avatarUrl?: string;
    };

    contact?: ChatContact;

    onComposerChange?: (value: string) => void;
    setComposer?: (value: string) => void;

    onSend?: (body: string) => void;
    onSendMessage?: (body: string) => void;

    onOpenContact?: () => void;

    // Callback chamado após criar task com sucesso na API
    onCreateTask?: (date: string, text: string, time?: string) => void;
}

type MockAttachment = {
    id: number;
    name: string;
};

export default function Chat({
    messages: _unusedMessages,
    composer,
    conversation,
    contact,
    onComposerChange,
    setComposer,
    onSend,
    onSendMessage,
    onOpenContact,
    onCreateTask,
}: ChatProps) {
    const bodyRef = useRef<HTMLDivElement | null>(null);

    const contactName =
        (contact?.name || conversation?.name || "").trim() || "Cliente";
    const avatarUrl = contact?.avatarUrl || conversation?.avatarUrl || "";
    const avatarInitial = contactName.trim().charAt(0).toUpperCase() || "C";
    const channelLabel = contact?.channelLabel || "via WhatsApp";
    const contactId = contact?.id || conversation?.id || "";
    const contactPhone = contact?.phone;

    const [attachments, setAttachments] = useState<MockAttachment[]>([]);
    const [attachMenuOpen, setAttachMenuOpen] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [isRecordingPaused, setIsRecordingPaused] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const [contactOpen, setContactOpen] = useState(false);

    const [showTaskPanel, setShowTaskPanel] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [pendingTaskText, setPendingTaskText] = useState("");

    const convId = conversation?.id || "";

    // estados da Fase 8 para mensagens
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const hasText = (composer || "").trim().length > 0;

    const changeComposer = onComposerChange || setComposer || (() => undefined);
    const sendFn = onSend || onSendMessage || (() => undefined);

    const scrollToBottom = useCallback(() => {
        const el = bodyRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight + 9999;
    }, []);

    // carrega mensagens da API com padrão loading/error/reloadToken
    useEffect(() => {
        if (!convId) return;

        let cancelled = false;

        async function loadMessages() {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchMessages(convId);

                if (cancelled) return;

                setMessages(data.items);
            } catch (err) {
                if (!cancelled) {
                    setError("Erro ao carregar mensagens.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadMessages();

        return () => {
            cancelled = true;
        };
    }, [convId, reloadToken]);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length, scrollToBottom]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = (composer || "").trim();
        const hasAttachments = attachments.length > 0;

        if (!text && !hasAttachments) return;

        sendFn(text || "[mensagem só com anexo]");

        changeComposer("");
        setAttachments([]);
        setAttachMenuOpen(false);
        requestAnimationFrame(scrollToBottom);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const fakeEvent = { preventDefault() { } } as React.FormEvent;
            handleSubmit(fakeEvent);
        }
    };

    const handleStartRecording = () => {
        setRecordingSeconds(0);
        setIsRecording(true);
        setIsRecordingPaused(false);
    };

    const handleCancelRecording = () => {
        setIsRecording(false);
        setIsRecordingPaused(false);
        setRecordingSeconds(0);
    };

    const handleTogglePauseRecording = () => {
        setIsRecordingPaused((prev) => !prev);
    };

    const handleSendRecording = () => {
        sendFn("[Áudio]");
        setIsRecording(false);
        setIsRecordingPaused(false);
        setRecordingSeconds(0);
        requestAnimationFrame(scrollToBottom);
    };

    useEffect(() => {
        if (!isRecording || isRecordingPaused) return;

        const id = window.setInterval(() => {
            setRecordingSeconds((prev) => prev + 1);
        }, 1000);

        return () => window.clearInterval(id);
    }, [isRecording, isRecordingPaused]);

    const formatSeconds = (total: number): string => {
        const m = Math.floor(total / 60);
        const s = total % 60;
        const mm = m.toString();
        const ss = s.toString().padStart(2, "0");
        return `${mm}:${ss}`;
    };

    const handleAddAttachment = () => {
        setAttachments((prev) => [
            ...prev,
            {
                id: Date.now() + prev.length,
                name: `Arquivo ${prev.length + 1}`,
            },
        ]);
        setAttachMenuOpen(false);
    };

    const handleRemoveAttachment = (id: number) => {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
    };

    const handleAvatarClick = () => {
        setContactOpen(true);
        if (onOpenContact) onOpenContact();
    };

    const formatTime = (value: any): string => {
        if (!value) return "";
        if (typeof value === "string") {
            const d = new Date(value);
            if (!Number.isNaN(d.getTime())) {
                return d.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }
            return value;
        }
        return String(value);
    };

    // bloqueios de retorno (Fase 8) – mensagens
    if (!convId) {
        return <div className="chat-empty">Selecione uma conversa</div>;
    }

    if (loading) {
        return <div className="chat-loading">Carregando mensagens...</div>;
    }

    if (error) {
        return (
            <div className="chat-error">
                <div>{error}</div>
                <button type="button" onClick={() => setReloadToken((x) => x + 1)}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <>
            {showTaskPanel && (
                <TaskPanel
                    conversationId={convId}
                    onClose={() => setShowTaskPanel(false)}
                    onSelectPhrase={(text: string) => {
                        setPendingTaskText(text);
                        setShowTaskPanel(false);
                        setShowCalendar(true);
                    }}
                    onSendCustom={(text: string) => {
                        setPendingTaskText(text);
                        setShowTaskPanel(false);
                        setShowCalendar(true);
                    }}
                />
            )}

            {showCalendar && (
                <CalendarPicker
                    onClose={() => setShowCalendar(false)}
                    onSelectDate={async (date: string) => {
                        if (!convId) {
                            setShowCalendar(false);
                            return;
                        }

                        try {
                            const title =
                                pendingTaskText.trim() || "Tarefa de acompanhamento";

                            await createTask({
                                conversationId: convId,
                                title,
                                dueDate: date,
                            });

                            // Notifica o App.tsx para atualizar o estado local
                            if (onCreateTask) {
                                onCreateTask(date, title);
                            }
                        } catch (err) {
                            console.error("Erro ao criar tarefa", err);
                            alert("Erro ao salvar tarefa");
                        } finally {
                            setShowCalendar(false);
                            setPendingTaskText("");
                        }
                    }}
                />
            )}

            <div className="panel-header chat-header">
                <div className="chat-header-left" onClick={handleAvatarClick}>
                    <button type="button" className="chat-header-avatar">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={contactName} />
                        ) : (
                            <span>{avatarInitial}</span>
                        )}
                    </button>

                    <div className="chat-header-texts">
                        <div className="chat-header-name">{contactName}</div>
                        <div className="chat-header-sub">{channelLabel}</div>
                    </div>
                </div>
            </div>

            <div className="chat-wrapper">
                <div className="chat-body" ref={bodyRef}>
                    {(!messages || messages.length === 0) && (
                        <div className="chat-empty">
                            Nenhuma mensagem ainda. Comece a conversa pelo campo abaixo.
                        </div>
                    )}

                    {messages?.map((m: any) => {
                        const isAgent =
                            m.from === "agencia" ||
                            m.from === "agent" ||
                            m.from === "me" ||
                            m.direction === "out" ||
                            m.authorType === "user";

                        const text = m.body ?? m.texto ?? "";
                        const time = m.time ?? formatTime(m.sentAt);

                        return (
                            <div
                                key={m.id}
                                className={
                                    "bubble-row " + (isAgent ? "from-agent" : "from-client")
                                }
                            >
                                <div className={"bubble " + (isAgent ? "agent" : "client")}>
                                    <span className="bubble-text">{text}</span>
                                    {time && <span className="bubble-time">{time}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {attachments.length > 0 && (
                    <div className="chat-attachments-strip">
                        {attachments.map((att) => (
                            <div key={att.id} className="chat-attach-thumb">
                                <div className="chat-attach-thumb-inner">
                                    <span className="chat-attach-icon" aria-hidden="true">
                                        📄
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="chat-attach-remove"
                                    aria-label="Remover anexo"
                                    onClick={() => handleRemoveAttachment(att.id)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {attachments.length < 6 && (
                            <button
                                type="button"
                                className="chat-attach-thumb chat-attach-plus"
                                onClick={handleAddAttachment}
                                aria-label="Adicionar outro anexo"
                            >
                                +
                            </button>
                        )}
                    </div>
                )}

                {isRecording ? (
                    <div className="chat-recording-bar">
                        <button
                            type="button"
                            className="chat-recording-btn"
                            aria-label="Cancelar gravação"
                            onClick={handleCancelRecording}
                        >
                            🗑
                        </button>

                        <span className="chat-recording-dot" />

                        <span className="chat-recording-time">
                            {formatSeconds(recordingSeconds)}
                        </span>

                        <div className="chat-recording-wave" />

                        <button
                            type="button"
                            className="chat-recording-btn"
                            aria-label={
                                isRecordingPaused ? "Retomar gravação" : "Pausar gravação"
                            }
                            onClick={handleTogglePauseRecording}
                        >
                            {isRecordingPaused ? "▶" : "⏸"}
                        </button>

                        <button
                            type="button"
                            className="chat-recording-send"
                            aria-label="Enviar áudio"
                            onClick={handleSendRecording}
                        >
                            ➤
                        </button>
                    </div>
                ) : (
                    <form className="chat-input" onSubmit={handleSubmit}>
                        <button
                            type="button"
                            className="chat-icon-btn"
                            onClick={() => setAttachMenuOpen((open) => !open)}
                            aria-label="Anexar arquivo"
                        >
                            📎
                        </button>

                        <button
                            type="button"
                            className="chat-icon-btn"
                            onClick={() => setShowTaskPanel(true)}
                            aria-label="Criar tarefa"
                        >
                            📅
                        </button>

                        <input
                            placeholder="Mensagem…"
                            value={composer}
                            onChange={(e) => changeComposer(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        {hasText ? (
                            <button
                                type="submit"
                                className="chat-send-btn"
                                aria-label="Enviar mensagem"
                            >
                                ➤
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="chat-icon-btn"
                                aria-label="Gravar áudio"
                                onClick={handleStartRecording}
                            >
                                🎤
                            </button>
                        )}
                    </form>
                )}

                {attachMenuOpen && !isRecording && (
                    <div className="chat-attach-menu">
                        <button
                            type="button"
                            className="chat-attach-menu-item"
                            onClick={handleAddAttachment}
                        >
                            <span className="chat-attach-menu-icon" aria-hidden="true">
                                📄
                            </span>
                            <span className="chat-attach-menu-label">Anexar</span>
                        </button>
                    </div>
                )}
            </div>

            <ContactPanel
                open={contactOpen}
                onClose={() => setContactOpen(false)}
                contact={{
                    name: contactName,
                    phone: contactPhone,
                    id: contactId,
                    avatarUrl: avatarUrl || undefined,
                }}
            />
        </>
    );
}