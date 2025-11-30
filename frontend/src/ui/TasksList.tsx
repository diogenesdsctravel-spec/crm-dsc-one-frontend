/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useCallback } from "react";
import { InboxCard } from "./Inbox";
import type { Task, Conversation } from "./tasksTypes";
import { parseLocalDate, isTaskOverdue } from "./tasksDateHelpers";

type TasksListProps = {
    tasks: Task[];
    conversations?: Conversation[]; // agora opcional
    emptyMessage: string;
    onCompleteTask?: (taskId: string) => void;
    onDeleteTask?: (taskId: string) => void;
};

interface TaskCardWithHoverProps {
    task: Task;
    conversation: Conversation;
    title: string;
    subtitle: string;
    onComplete: () => void;
    onDelete: () => void;
    isOverdue?: boolean;
}

function TaskCardWithHover({
    task,
    conversation,
    title,
    subtitle,
    onComplete,
    onDelete,
    isOverdue,
}: TaskCardWithHoverProps) {
    const [showActions, setShowActions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const timerRef = useRef<number | null>(null);

    const handleMouseEnter = useCallback(() => {
        timerRef.current = window.setTimeout(() => {
            setShowActions(true);
        }, 3000);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setShowActions(false);
        setShowDeleteConfirm(false);
    }, []);

    const handleComplete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onComplete();
        },
        [onComplete]
    );

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    }, []);

    const handleDeleteConfirm = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete();
        },
        [onDelete]
    );

    const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    }, []);

    return (
        <div
            className="task-card-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <InboxCard
                conversation={conversation}
                selected={false}
                onClick={() => { }}
                overrideTitle={title}
                overrideSubtitle={subtitle}
                isOverdue={isOverdue}
                subtitleVariant="full"
            />

            {showActions && !showDeleteConfirm && (
                <div className="task-card-actions">
                    <button
                        type="button"
                        className="task-action-btn task-action-complete"
                        onClick={handleComplete}
                        title="Concluir tarefa"
                    >
                        ✓
                    </button>
                    <button
                        type="button"
                        className="task-action-btn task-action-delete"
                        onClick={handleDeleteClick}
                        title="Excluir tarefa"
                    >
                        ✕
                    </button>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="task-card-actions task-card-confirm">
                    <span className="task-confirm-text">Excluir?</span>
                    <button
                        type="button"
                        className="task-action-btn task-action-delete"
                        onClick={handleDeleteConfirm}
                        title="Confirmar exclusão"
                    >
                        Sim
                    </button>
                    <button
                        type="button"
                        className="task-action-btn task-action-cancel"
                        onClick={handleDeleteCancel}
                        title="Cancelar exclusão"
                    >
                        Não
                    </button>
                </div>
            )}
        </div>
    );
}

function formatTaskDateTime(task: Task): string {
    const dateStr = task.date;
    const timeStr = task.time;

    if (!dateStr && !timeStr) return "";

    let dateLabel = "";

    if (dateStr) {
        const d = parseLocalDate(dateStr);
        if (d) {
            const day = d.getDate();
            const monthNames = [
                "jan.",
                "fev.",
                "mar.",
                "abr.",
                "mai.",
                "jun.",
                "jul.",
                "ago.",
                "set.",
                "out.",
                "nov.",
                "dez.",
            ];
            dateLabel = `${day} de ${monthNames[d.getMonth()]}`;
        }
    }

    if (timeStr && timeStr.trim()) {
        if (!dateLabel) return timeStr.trim();
        return `${dateLabel} às ${timeStr.trim()}`;
    }

    return dateLabel;
}

export function TasksList({
    tasks,
    conversations,
    emptyMessage,
    onCompleteTask,
    onDeleteTask,
}: TasksListProps) {
    if (tasks.length === 0) {
        return <div className="tasks-empty">{emptyMessage}</div>;
    }

    const safeConversations = conversations ?? [];

    return (
        <>
            {tasks.map((task) => {
                if (!task.conversationId) return null;

                const conv = safeConversations.find(
                    (c) => c.id === task.conversationId
                );
                if (!conv) return null;

                const when = formatTaskDateTime(task);
                const title = when ? `${conv.nome} · ${when}` : conv.nome;
                const overdue = isTaskOverdue(task);

                return (
                    <TaskCardWithHover
                        key={task.id}
                        task={task}
                        conversation={conv}
                        title={title}
                        subtitle={task.text}
                        onComplete={() => onCompleteTask?.(task.id)}
                        onDelete={() => onDeleteTask?.(task.id)}
                        isOverdue={overdue}
                    />
                );
            })}
        </>
    );
}

export default TasksList;
