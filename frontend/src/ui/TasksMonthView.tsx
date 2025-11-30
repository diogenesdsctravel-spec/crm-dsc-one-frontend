import React from "react";
import TasksList from "./TasksList";
import type { Task, Conversation } from "./tasksTypes";
import {
    WEEKDAY_SHORT,
    buildMonthGrid,
    formatDateKey,
} from "./tasksCalendarHelpers";

type TasksMonthViewProps = {
    currentYear: number;
    currentMonthIndex: number;
    monthLabel: string;
    periodLabel?: string;
    daysWithTasksSet: Set<string>;
    hasUserSelectedDate: boolean;
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    totalTasks: number;
    rightPanelTitle: string;
    rightPanelSubtitle: string;
    tasksToDisplay: Task[];
    conversations: Conversation[];
    onCompleteTask?: (taskId: string) => void;
    onDeleteTask?: (taskId: string) => void;
};

const TasksMonthView: React.FC<TasksMonthViewProps> = ({
    currentYear,
    currentMonthIndex,
    monthLabel,
    periodLabel,
    daysWithTasksSet,
    hasUserSelectedDate,
    selectedDate,
    onSelectDate,
    totalTasks,
    rightPanelTitle,
    rightPanelSubtitle,
    tasksToDisplay,
    conversations,
    onCompleteTask,
    onDeleteTask,
}) => {
    const monthGrid = React.useMemo(
        () => buildMonthGrid(currentYear, currentMonthIndex),
        [currentYear, currentMonthIndex]
    );

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
                                            <span className="tasks-calendar-day-number" />
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
                                        onClick={() =>
                                            onSelectDate(new Date(currentYear, currentMonthIndex, day))
                                        }
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
                    <div className="tasks-list-title">{rightPanelTitle}</div>
                    <div className="tasks-list-subtitle">{rightPanelSubtitle}</div>
                </div>

                <div className="tasks-list-divider" />

                <div className="tasks-list">
                    <TasksList
                        tasks={tasksToDisplay}
                        conversations={conversations}
                        emptyMessage={
                            hasUserSelectedDate
                                ? "Nenhuma tarefa para este dia"
                                : "Nenhuma tarefa pendente"
                        }
                        onCompleteTask={onCompleteTask}
                        onDeleteTask={onDeleteTask}
                    />
                </div>
            </div>
        </div>
    );
};

export default TasksMonthView;
