/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Task } from "./tasksTypes";

type Props = {
    viewMode: "day" | "week";
    tasksForToday: Task[];
    tasksForThisWeek: Task[];
    taskCards: React.ReactNode[];
    renderTaskList: (taskList: Task[], emptyMessage: string) => React.ReactNode;
};

export default function TasksSimpleView({
    viewMode,
    tasksForToday,
    tasksForThisWeek,
    taskCards,
    renderTaskList,
}: Props) {
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
