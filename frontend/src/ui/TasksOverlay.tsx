/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, useRef, useCallback } from "react";
import { InboxCard } from "./Inbox";

export type TasksViewMode = "day" | "week" | "month" | "year";

type Task = {
    id: string;
    date: string;
    text: string;
    conversationId?: string;
    time?: string;
};

type Conversation = {
    id: string;
    nome: string;
    ultimaMensagem?: string;
    avatarUrl?: string;
    unreadCount?: number;
    workspace?: string;
};

interface TasksOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    viewMode: TasksViewMode;
    onChangeViewMode: (mode: TasksViewMode) => void;

    taskCards: React.ReactNode[];

    tasks?: Task[];
    conversations?: Conversation[];

    // Callbacks para ações
    onCompleteTask?: (taskId: string) => void;
    onDeleteTask?: (taskId: string) => void;

    periodLabel?: string;
    daysWithTasks?: number[];
    selectedDay?: number;
    onSelectDay?: (day: number) => void;
}

const VIEW_MODE_LABEL: Record<TasksViewMode, string> = {
    day: "Dia",
    week: "Semana",
    month: "Mês",
    year: "Ano",
};

const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

// ========================================
// Componente TaskCardWithHover
// ========================================
interface TaskCardWithHoverProps {
    task: Task;
    conversation: Conversation;
    title: string;
    subtitle: string;
    onComplete: () => void;
    onDelete: () => void;
}

function TaskCardWithHover({
    task,
    conversation,
    title,
    subtitle,
    onComplete,
    onDelete,
}: TaskCardWithHoverProps) {
    const [showActions, setShowActions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const timerRef = useRef<number | null>(null);

    const handleMouseEnter = useCallback(() => {
        // Inicia timer de 3 segundos
        timerRef.current = window.setTimeout(() => {
            setShowActions(true);
        }, 3000);
    }, []);

    const handleMouseLeave = useCallback(() => {
        // Cancela timer e esconde ações
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
                        title="Cancelar"
                    >
                        Não
                    </button>
                </div>
            )}
        </div>
    );
}

// ========================================
// Funções auxiliares
// ========================================

function buildMonthGrid(year: number, monthIndex: number) {
    const first = new Date(year, monthIndex, 1);
    const firstWeekday = first.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstWeekday; i += 1) {
        cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
        cells.push(d);
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
}

function formatDateKey(year: number, monthIndex: number, day: number): string {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

function parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.slice(0, 10).split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month, day);
}

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfWeek(date: Date): Date {
    const d = startOfDay(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
}

function endOfWeek(date: Date): Date {
    const start = startOfWeek(date);
    const d = new Date(start);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
}

// ========================================
// Componente Principal
// ========================================

const TasksOverlay: React.FC<TasksOverlayProps> = ({
    isOpen,
    onClose,
    viewMode,
    onChangeViewMode,
    taskCards,
    tasks = [],
    conversations = [],
    onCompleteTask,
    onDeleteTask,
    periodLabel,
    daysWithTasks,
    selectedDay,
    onSelectDay,
}) => {
    if (!isOpen) return null;

    const now = useMemo(() => new Date(), []);
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();

    const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setHasUserSelectedDate(false);
            setSelectedDate(null);
        }
    }, [isOpen]);

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        for (const t of tasks) {
            if (!t.date) continue;
            const key = t.date.slice(0, 10);
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)!.push(t);
        }
        return map;
    }, [tasks]);

    const tasksForToday = useMemo(() => {
        const today = startOfDay(new Date());
        const todayKey = formatDateKey(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        return tasks.filter((t) => {
            if (!t.date) return false;
            return t.date.slice(0, 10) === todayKey;
        });
    }, [tasks]);

    const tasksForThisWeek = useMemo(() => {
        const today = new Date();
        const weekStart = startOfWeek(today);
        const weekEnd = endOfWeek(today);

        const validTasks = tasks.filter((t) => {
            if (!t.date) return false;
            const taskDate = parseLocalDate(t.date);
            if (!taskDate) return false;
            return taskDate >= weekStart && taskDate <= weekEnd;
        });

        validTasks.sort((a, b) => {
            const dateA = parseLocalDate(a.date)?.getTime() ?? 0;
            const dateB = parseLocalDate(b.date)?.getTime() ?? 0;
            return dateA - dateB;
        });

        return validTasks;
    }, [tasks]);

    const upcomingTasksThisMonth = useMemo(() => {
        const today = startOfDay(new Date());
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();

        const validTasks = tasks.filter((t) => {
            if (!t.date) return false;
            const taskDate = parseLocalDate(t.date);
            if (!taskDate) return false;

            const taskYear = taskDate.getFullYear();
            const taskMonth = taskDate.getMonth();

            return (
                taskYear === todayYear &&
                taskMonth === todayMonth &&
                taskDate >= today
            );
        });

        validTasks.sort((a, b) => {
            const dateA = parseLocalDate(a.date)?.getTime() ?? 0;
            const dateB = parseLocalDate(b.date)?.getTime() ?? 0;
            return dateA - dateB;
        });

        return validTasks;
    }, [tasks]);

    const tasksForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const key = formatDateKey(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
        );
        return tasksByDate.get(key) ?? [];
    }, [selectedDate, tasksByDate]);

    const tasksToDisplay = hasUserSelectedDate
        ? tasksForSelectedDate
        : upcomingTasksThisMonth;

    const daysWithTasksSet = useMemo(() => {
        const set = new Set<string>();
        tasksByDate.forEach((_, key) => {
            set.add(key);
        });
        return set;
    }, [tasksByDate]);

    const totalTasks = tasks.length;

    const monthLabel = now.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const monthGrid = useMemo(
        () => buildMonthGrid(currentYear, currentMonthIndex),
        [currentYear, currentMonthIndex]
    );

    const monthsIndexes = useMemo(
        () => Array.from({ length: 12 }, (_, i) => i),
        []
    );

    function primaryTitle(): string {
        if (viewMode === "day") return "Hoje";
        if (viewMode === "week") return "Semana";
        if (viewMode === "month") return monthLabel;
        return String(currentYear);
    }

    function subtitle(): string {
        if (viewMode === "day") {
            const count = tasksForToday.length;
            return count === 1
                ? "Você tem uma tarefa pendente"
                : `Você tem ${count} tarefas pendentes`;
        }

        if (viewMode === "week") {
            const count = tasksForThisWeek.length;
            return count === 1
                ? "Você tem uma tarefa nesta semana"
                : `Você tem ${count} tarefas nesta semana`;
        }

        if (viewMode === "month") {
            return totalTasks === 1
                ? "Você tem uma tarefa neste mês"
                : `Você tem ${totalTasks} tarefas neste mês`;
        }

        return totalTasks === 1
            ? "Você tem uma tarefa neste ano"
            : `Você tem ${totalTasks} tarefas neste ano`;
    }

    function selectedDateLabel(): string {
        if (selectedDate) {
            const dia = String(selectedDate.getDate()).padStart(2, "0");
            const monthName = selectedDate.toLocaleDateString("pt-BR", {
                month: "long",
            });
            return `${dia} de ${monthName}`;
        }
        const dia = String(now.getDate()).padStart(2, "0");
        const monthName = now.toLocaleDateString("pt-BR", { month: "long" });
        return `${dia} de ${monthName}`;
    }

    function rightPanelTitle(): string {
        if (hasUserSelectedDate) {
            return `Tarefas de ${selectedDateLabel()}`;
        }
        return "Próximas tarefas";
    }

    function rightPanelSubtitle(): string {
        const count = tasksToDisplay.length;
        if (count === 1) {
            return "1 tarefa pendente";
        }
        return `${count} tarefas pendentes`;
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

    // Renderiza lista de tasks com hover
    function renderTaskList(taskList: Task[], emptyMessage: string) {
        if (taskList.length === 0) {
            return <div className="tasks-empty">{emptyMessage}</div>;
        }

        return taskList.map((task) => {
            if (!task.conversationId) return null;

            const conv = conversations.find((c) => c.id === task.conversationId);
            if (!conv) return null;

            const when = formatTaskDateTime(task);
            const title = when ? `${conv.nome} · ${when}` : conv.nome;

            return (
                <TaskCardWithHover
                    key={task.id}
                    task={task}
                    conversation={conv}
                    title={title}
                    subtitle={task.text}
                    onComplete={() => onCompleteTask?.(task.id)}
                    onDelete={() => onDeleteTask?.(task.id)}
                />
            );
        });
    }

    function renderViewToggle() {
        return (
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
        );
    }

    function renderListOnly() {
        if (viewMode === "day") {
            return (
                <div className="tasks-main tasks-main-simple">
                    <div className="tasks-list">
                        {renderTaskList(tasksForToday, "Nenhuma tarefa para hoje")}
                    </div>
                </div>
            );
        }

        if (viewMode === "week") {
            return (
                <div className="tasks-main tasks-main-simple">
                    <div className="tasks-list">
                        {renderTaskList(tasksForThisWeek, "Nenhuma tarefa para esta semana")}
                    </div>
                </div>
            );
        }

        return (
            <div className="tasks-main tasks-main-simple">
                <div className="tasks-list">
                    {taskCards.length === 0 ? (
                        <div className="tasks-empty">Nenhuma tarefa para este período</div>
                    ) : (
                        taskCards.map((card, index) => (
                            <div key={index} className="tasks-list-item">
                                {card}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    function renderMonth() {
        return (
            <div className="tasks-main tasks-main-month">
                <div className="tasks-calendar-panel">
                    <div className="tasks-calendar-header">
                        <span className="tasks-calendar-month">
                            {periodLabel || monthLabel}
                        </span>
                    </div>

                    <div className="tasks-calendar-weekdays">
                        {WEEKDAY_SHORT.map((d, i) => (
                            <span key={i} className="tasks-calendar-weekday">
                                {d}
                            </span>
                        ))}
                    </div>

                    <div className="tasks-calendar-grid">
                        {monthGrid.map((week, rowIndex) => (
                            <div key={rowIndex} className="tasks-calendar-week-row">
                                {week.map((day, colIndex) => {
                                    if (!day) {
                                        return (
                                            <button
                                                key={`empty-${rowIndex}-${colIndex}`}
                                                type="button"
                                                className="tasks-calendar-day is-empty"
                                                disabled
                                            >
                                                <span className="tasks-calendar-day-number"></span>
                                            </button>
                                        );
                                    }

                                    const dateKey = formatDateKey(
                                        currentYear,
                                        currentMonthIndex,
                                        day
                                    );
                                    const hasTasks = daysWithTasksSet.has(dateKey);

                                    const isSelected =
                                        hasUserSelectedDate &&
                                        selectedDate &&
                                        selectedDate.getDate() === day &&
                                        selectedDate.getMonth() === currentMonthIndex &&
                                        selectedDate.getFullYear() === currentYear;

                                    let className = "tasks-calendar-day";
                                    if (hasTasks) className += " has-tasks";
                                    if (isSelected) className += " is-selected";

                                    return (
                                        <button
                                            key={dateKey}
                                            type="button"
                                            className={className}
                                            onClick={() => {
                                                setHasUserSelectedDate(true);
                                                setSelectedDate(
                                                    new Date(currentYear, currentMonthIndex, day)
                                                );
                                            }}
                                        >
                                            <span className="tasks-calendar-day-number">{day}</span>
                                            {hasTasks && <span className="tasks-calendar-dot" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="tasks-calendar-footer">
                        <div className="tasks-calendar-footer-row">
                            <span className="tasks-calendar-footer-label">Hoje</span>
                            <span className="tasks-calendar-footer-value">
                                {totalTasks} tarefas
                            </span>
                        </div>
                    </div>
                </div>

                <div className="tasks-list-panel">
                    <div className="tasks-list-header">
                        <div className="tasks-list-title">{rightPanelTitle()}</div>
                        <div className="tasks-list-subtitle">{rightPanelSubtitle()}</div>
                    </div>

                    <div className="tasks-list-divider" />

                    <div className="tasks-list">
                        {renderTaskList(
                            tasksToDisplay,
                            hasUserSelectedDate
                                ? "Nenhuma tarefa para este dia"
                                : "Nenhuma tarefa pendente"
                        )}
                    </div>
                </div>
            </div>
        );
    }

    function renderYear() {
        return (
            <div className="tasks-main tasks-main-year">
                <div
                    className="tasks-year-panel"
                    style={{
                        maxHeight: 520,
                        overflowY: "auto",
                    }}
                >
                    <div
                        className="tasks-year-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "18px 22px",
                            marginTop: 4,
                        }}
                    >
                        {monthsIndexes.map((monthIndex) => {
                            const monthNameShort = new Date(currentYear, monthIndex, 1)
                                .toLocaleDateString("pt-BR", { month: "short" })
                                .replace(".", "");

                            const miniGrid = buildMonthGrid(currentYear, monthIndex);

                            return (
                                <div key={monthIndex} className="tasks-year-month">
                                    <div className="tasks-year-month-name">{monthNameShort}</div>

                                    <div className="tasks-year-weekdays">
                                        {WEEKDAY_SHORT.map((d, i) => (
                                            <span key={i} className="tasks-year-weekday">
                                                {d}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="tasks-year-month-grid">
                                        {miniGrid.map((week, rowIndex) => (
                                            <div
                                                key={rowIndex}
                                                className="tasks-year-month-week-row"
                                            >
                                                {week.map((day, colIndex) => {
                                                    if (!day) {
                                                        return (
                                                            <div
                                                                key={`empty-${monthIndex}-${rowIndex}-${colIndex}`}
                                                                className="tasks-year-day is-empty"
                                                            />
                                                        );
                                                    }

                                                    const dateKey = formatDateKey(
                                                        currentYear,
                                                        monthIndex,
                                                        day
                                                    );
                                                    const hasTasks = daysWithTasksSet.has(dateKey);

                                                    let className = "tasks-year-day";
                                                    if (hasTasks) className += " has-tasks";

                                                    return (
                                                        <div key={dateKey} className={className}>
                                                            <span className="tasks-year-day-number">
                                                                {day}
                                                            </span>
                                                            {hasTasks && (
                                                                <span className="tasks-year-day-dot" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="tasks-list-panel">
                    <div className="tasks-list-header">
                        <div className="tasks-list-title">{rightPanelTitle()}</div>
                        <div className="tasks-list-subtitle">{rightPanelSubtitle()}</div>
                    </div>

                    <div className="tasks-list-divider" />

                    <div className="tasks-list">
                        {renderTaskList(
                            tasksToDisplay,
                            hasUserSelectedDate
                                ? "Nenhuma tarefa para este dia"
                                : "Nenhuma tarefa pendente"
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const showMonthLayout = viewMode === "month";

    return (
        <div className="tasks-overlay-backdrop">
            <div className="tasks-overlay-panel">
                <header className="tasks-header">
                    <div className="tasks-header-left">
                        <div className="tasks-header-label">Tarefas</div>
                        <h2 className="tasks-header-title">{primaryTitle()}</h2>
                        <p className="tasks-header-subtitle">{subtitle()}</p>
                    </div>

                    <div className="tasks-header-right">
                        {renderViewToggle()}

                        <button
                            type="button"
                            className="tasks-close-btn"
                            onClick={onClose}
                        >
                            Fechar
                        </button>
                    </div>
                </header>

                {viewMode === "year"
                    ? renderYear()
                    : showMonthLayout
                        ? renderMonth()
                        : renderListOnly()}
            </div>
        </div>
    );
};

export default TasksOverlay;