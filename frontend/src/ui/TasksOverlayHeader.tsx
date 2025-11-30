import React from "react";
import type { TasksViewMode } from "./tasksTypes";

type TasksOverlayHeaderProps = {
    primaryTitle: string;
    subtitle: string;
    viewMode: TasksViewMode;
    onChangeViewMode: (mode: TasksViewMode) => void;
    onClose: () => void;
};

const VIEW_MODE_LABEL: Record<TasksViewMode, string> = {
    day: "Dia",
    week: "Semana",
    month: "Mês",
    year: "Ano",
};

export function TasksOverlayHeader({
    primaryTitle,
    subtitle,
    viewMode,
    onChangeViewMode,
    onClose,
}: TasksOverlayHeaderProps) {
    return (
        <header className="tasks-header">
            <div className="tasks-header-left">
                <div className="tasks-header-label">Tarefas</div>
                <h2 className="tasks-header-title">{primaryTitle}</h2>
                <p className="tasks-header-subtitle">{subtitle}</p>
            </div>

            <div className="tasks-header-right">
                <div className="tasks-view-toggle">
                    {(["day", "week", "month", "year"] as TasksViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            className={
                                "tasks-view-pill" + (mode === viewMode ? " is-active" : "")
                            }
                            onClick={() => onChangeViewMode(mode)}
                        >
                            {VIEW_MODE_LABEL[mode]}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="tasks-close-btn"
                    onClick={onClose}
                >
                    Fechar
                </button>
            </div>
        </header>
    );
}

export default TasksOverlayHeader;
