// src/ui/TaskPanel.tsx

import React, { useState } from "react";
import "../index.css";
import { Task } from "../features/tasks/api";

interface TaskPanelProps {
    onClose: () => void;
    onSelectPhrase: (text: string) => void;
    onSendCustom: (text: string) => void;
    tasks: Task[];
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
    tasks,
}: TaskPanelProps) {
    const [text, setText] = useState("");

    const isTyping = text.trim().length > 0;

    return (
        <div className="taskpanel-overlay" onClick={onClose}>
            <div className="taskpanel-box" onClick={(e) => e.stopPropagation()}>
                <h3>Criar tarefa</h3>

                {/* Tarefas já ligadas a esta conversa */}
                {tasks.length > 0 && (
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
