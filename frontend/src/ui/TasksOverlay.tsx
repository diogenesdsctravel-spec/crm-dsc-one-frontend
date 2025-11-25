/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";

export type TasksViewMode = "day" | "week" | "month" | "year";

interface TasksOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    viewMode: TasksViewMode;
    onChangeViewMode: (mode: TasksViewMode) => void;

    // cards já prontos (InboxCard) vindos do App
    taskCards: React.ReactNode[];

    // props opcionais, caso queira passar algo depois
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

function buildMonthGrid(year: number, monthIndex: number) {
    const first = new Date(year, monthIndex, 1);
    const firstWeekday = first.getDay(); // 0 = domingo
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

const TasksOverlay: React.FC<TasksOverlayProps> = ({
    isOpen,
    onClose,
    viewMode,
    onChangeViewMode,
    taskCards,
    periodLabel,
    daysWithTasks,
    selectedDay,
    onSelectDay,
}) => {
    if (!isOpen) return null;

    const totalTasks = taskCards.length;
    const now = useMemo(() => new Date(), []);
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();

    const monthLabel = now.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const [internalSelectedDay, setInternalSelectedDay] = useState<number>(
        selectedDay || now.getDate()
    );

    const effectiveSelectedDay = selectedDay ?? internalSelectedDay;

    const baseDaysWithTasks =
        daysWithTasks && daysWithTasks.length > 0 ? daysWithTasks : [6, 10, 12, 28];

    const daysWithTasksSet = new Set(baseDaysWithTasks);

    const monthGrid = useMemo(
        () => buildMonthGrid(currentYear, currentMonthIndex),
        [currentYear, currentMonthIndex]
    );

    const monthsIndexes = useMemo(
        () => Array.from({ length: 12 }, (_, i) => i),
        []
    );

    function handleDayClick(day: number | null) {
        if (!day) return;
        setInternalSelectedDay(day);
        if (onSelectDay) onSelectDay(day);
    }

    function primaryTitle(): string {
        if (viewMode === "day") return "Hoje";
        if (viewMode === "week") return "Semana";
        if (viewMode === "month") return monthLabel;
        return String(currentYear);
    }

    function subtitle(): string {
        if (viewMode === "day") {
            return totalTasks === 1
                ? "Você tem uma tarefa pendente"
                : `Você tem ${totalTasks} tarefas pendentes`;
        }

        if (viewMode === "week") {
            return totalTasks === 1
                ? "Você tem uma tarefa nesta semana"
                : `Você tem ${totalTasks} tarefas nesta semana`;
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
        const dia = String(effectiveSelectedDay).padStart(2, "0");
        const monthName = now.toLocaleDateString("pt-BR", { month: "long" });
        return `${dia} de ${monthName}`;
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
                                    const isEmpty = !day;
                                    const hasTasks = !!(day && daysWithTasksSet.has(day));
                                    const isSelected = !!(day && day === effectiveSelectedDay);

                                    let className = "tasks-calendar-day";
                                    if (isEmpty) className += " is-empty";
                                    if (hasTasks) className += " has-tasks";
                                    if (isSelected) className += " is-selected";

                                    return (
                                        <button
                                            key={`${rowIndex}-${colIndex}`}
                                            type="button"
                                            className={className}
                                            onClick={() => handleDayClick(day)}
                                            disabled={isEmpty}
                                        >
                                            {day && (
                                                <span className="tasks-calendar-day-number">{day}</span>
                                            )}
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
                        <div className="tasks-list-title">
                            Tarefas de {selectedDateLabel()}
                        </div>
                        <div className="tasks-list-subtitle">
                            {totalTasks} tarefas pendentes
                        </div>
                    </div>

                    <div className="tasks-list-divider" />

                    <div className="tasks-list">
                        {taskCards.length === 0 ? (
                            <div className="tasks-empty">Nenhuma tarefa para este dia</div>
                        ) : (
                            taskCards.map((card, index) => (
                                <div key={index} className="tasks-list-item">
                                    {card}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Visão de ANO – 2 meses por linha + scroll, sem repetir o título 2025
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
                    {/* removido o subtítulo interno "2025" para não repetir o título do overlay */}

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
                                                    const isEmpty = !day;
                                                    const hasTasks = !!(
                                                        day && daysWithTasksSet.has(day)
                                                    );

                                                    let className = "tasks-year-day";
                                                    if (isEmpty) className += " is-empty";
                                                    if (hasTasks) className += " has-tasks";

                                                    return (
                                                        <div
                                                            key={`${rowIndex}-${colIndex}`}
                                                            className={className}
                                                        >
                                                            {day && (
                                                                <span className="tasks-year-day-number">
                                                                    {day}
                                                                </span>
                                                            )}
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
                        <div className="tasks-list-title">
                            Tarefas de {selectedDateLabel()}
                        </div>
                        <div className="tasks-list-subtitle">
                            {totalTasks} tarefas pendentes
                        </div>
                    </div>

                    <div className="tasks-list-divider" />

                    <div className="tasks-list">
                        {taskCards.length === 0 ? (
                            <div className="tasks-empty">Nenhuma tarefa para este dia</div>
                        ) : (
                            taskCards.map((card, index) => (
                                <div key={index} className="tasks-list-item">
                                    {card}
                                </div>
                            ))
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
