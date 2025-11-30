/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import type { Task, Conversation } from "./tasksTypes";
import TasksList from "./TasksList";
import {
    WEEKDAY_SHORT,
    buildMonthGrid,
    formatDateKey,
} from "./tasksCalendarHelpers";

type TasksYearViewProps = {
    currentYear: number;
    monthsIndexes: number[];
    daysWithTasksSet: Set<string>;
    tasksToDisplay: Task[];
    conversations?: Conversation[];
    hasUserSelectedDate: boolean;
    rightPanelTitle: string;
    rightPanelSubtitle: string;
    onCompleteTask?: (taskId: string) => void;
    onDeleteTask?: (taskId: string) => void;
};

const TasksYearView: React.FC<TasksYearViewProps> = ({
    currentYear,
    monthsIndexes,
    daysWithTasksSet,
    tasksToDisplay,
    conversations,
    hasUserSelectedDate,
    rightPanelTitle,
    rightPanelSubtitle,
    onCompleteTask,
    onDeleteTask,
}) => {
    return (
        <div className="tasks-main tasks-main-year">
            <div
                className="tasks-year-panel"
                style={{ maxHeight: 520, overflowY: "auto" }}
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

export default TasksYearView;
