import React, { useState } from "react";
import "../index.css";

interface TaskPanelProps {
    onClose: () => void;
    onSelectPhrase: (text: string) => void;
    onSendCustom: (text: string) => void;
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
}: TaskPanelProps) {
    const [text, setText] = useState("");

    const isTyping = text.trim().length > 0;

    return (
        <div className="taskpanel-overlay" onClick={onClose}>
            <div className="taskpanel-box" onClick={(e) => e.stopPropagation()}>
                <h3>Criar tarefa</h3>

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
