import React, { useState } from "react";

type Workspace = "inbox" | "fantasma";

interface DockProps {
    activeWorkspace: Workspace;
    inboxPendingCount: number;
    fantasmaPendingCount: number;
    onSelectWorkspace: (workspace: Workspace) => void;
}

export default function Dock({
    activeWorkspace,
    inboxPendingCount,
    fantasmaPendingCount,
    onSelectWorkspace,
}: DockProps) {
    const [search, setSearch] = useState("");

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
                    className={
                        "dock-item" +
                        (activeWorkspace === "inbox" ? " dock-item-active" : "")
                    }
                    type="button"
                    aria-label="Caixa de entrada"
                    title="Caixa de entrada"
                    onClick={() => onSelectWorkspace("inbox")}
                >
                    <span>Inbox</span>
                    {inboxPendingCount > 0 && (
                        <span className="dock-badge">{inboxPendingCount}</span>
                    )}
                </button>

                <button
                    className={
                        "dock-item" +
                        (activeWorkspace === "fantasma" ? " dock-item-active" : "")
                    }
                    type="button"
                    aria-label="Espaço Fantasma"
                    title="Espaço Fantasma"
                    onClick={() => onSelectWorkspace("fantasma")}
                >
                    <span>Fantasma</span>
                    {fantasmaPendingCount > 0 && (
                        <span className="dock-badge">{fantasmaPendingCount}</span>
                    )}
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
