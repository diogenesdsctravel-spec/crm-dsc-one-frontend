import React, { useState } from "react";

export default function Dock() {
    const [search, setSearch] = useState("");

    const unansweredMock = 7;

    return (
        <nav className="dock" aria-label="Dock de ações">
            <div className="dock-inner">
                <button
                    className="dock-item"
                    type="button"
                    aria-label="Funil"
                    title="Funil"
                >
                    <span>⋮</span>
                </button>

                <button
                    className="dock-item"
                    type="button"
                    aria-label="Caixa de entrada"
                    title="Caixa de entrada"
                >
                    <span>Inbox</span>
                    {unansweredMock > 0 && (
                        <span className="dock-badge">{unansweredMock}</span>
                    )}
                </button>

                <button
                    className="dock-item"
                    type="button"
                    aria-label="Espaço Fantasma"
                    title="Espaço Fantasma"
                >
                    <span>Fantasma</span>
                </button>

                <div className="dock-sep" />

                <div className="dock-search">
                    <input
                        type="search"
                        placeholder="Pesquisar (⌘K)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Pesquisar conversas"
                    />
                </div>
            </div>
        </nav>
    );
}
