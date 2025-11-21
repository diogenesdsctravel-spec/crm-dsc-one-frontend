// src/ui/TaskPanel.tsx

import React, { useEffect, useState } from "react";
import "../index.css";
import { fetchTasks, type Task } from "../features/tasks/api";

interface TaskPanelProps {
    onClose: () => void;
    onSelectPhrase: (text: string) => void;
    onSendCustom: (text: string) => void;
    conversationId: string | null;
}

const frases = [
    "Confirmar envio da cotação",
    "Acompanhar retorno do cliente",
    "Enviar atualização do preço",
    "Perguntar se conversou com a família",
];

export default function TaskPanel({
    onClose,
    onSelectPhrase,
    onSendCustom,
    conversationId,
}: TaskPanelProps) {
    const [text, setText] = useState("");

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const isTyping = text.trim().length > 0;

    useEffect(() => {
        if (!conversationId) {
            setTasks([]);
            return;
        }

        let cancelled = false;

        async function loadTasks() {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchTasks(conversationId);

                if (cancelled) return;

                setTasks(data.items ?? []);
            } catch (err) {
                if (!cancelled) {
                    setError("Erro ao carregar tarefas.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadTasks();

        return () => {
            cancelled = true;
        };
    }, [conversationId, reloadToken]);

    return (
        <div className="taskpanel-overlay" onClick={onClose}>
            <div className="taskpanel-box" onClick={(e) => e.stopPropagation()}>
                <h3>Criar tarefa</h3>

                {!conversationId && (
                    <div className="tasks-empty">Nenhuma conversa selecionada</div>
                )}

                {conversationId && loading && (
                    <div className="tasks-loading">Carregando tarefas...</div>
                )}

                {conversationId && error && (
                    <div className="tasks-error">
                        <div>{error}</div>
                        <button
                            type="button"
                            onClick={() => setReloadToken((x) => x + 1)}
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {conversationId && !loading && !error && (tasks?.length ?? 0) > 0 && (
                    <div className="taskpanel-list">
                        {tasks.map((t) => (
                            <div key={t.id} className="taskpanel-task-item">
                                <div className="taskpanel-task-title">{t.title}</div>
                                <div className="taskpanel-task-meta">
                                    {t.dueDate &&
                                        new Date(t.dueDate).toLocaleString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    {t.status ? ` · ${t.status}` : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Frases pré-prontas */}
                <div className="taskpanel-phrases">
                    {frases.map((f) => (
                        <button
                            key={f}
                            className="taskpanel-phrase-btn"
                            onClick={() => onSelectPhrase(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Campo para digitar */}
                <textarea
                    placeholder="Escreva sua tarefa…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {/* Botão enviar – só aparece se estiver digitando */}
                {isTyping && (
                    <button
                        className="taskpanel-send"
                        onClick={() => {
                            onSendCustom(text);
                            setText("");
                        }}
                    >
                        Enviar tarefa →
                    </button>
                )}
            </div>
        </div>
    );
}
