/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import TasksList from "./TasksList";
import TasksOverlayHeader from "./TasksOverlayHeader";
import TasksMonthView from "./TasksMonthView";
import TasksYearView from "./TasksYearView";
import type { Task, Conversation, TasksViewMode } from "./tasksTypes";
import {
    parseLocalDate,
    startOfDay,
    startOfWeek,
    endOfWeek,
    isTaskOverdue,
    formatDateKey,
} from "./tasksHelpers";
import TimePicker from "./TimePicker";

type TasksOverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    viewMode: TasksViewMode;
    onChangeViewMode: (mode: TasksViewMode) => void;
    taskCards: React.ReactNode[];
    tasks?: Task[];
    conversations?: Conversation[];
    onCompleteTask?: (taskId: string) => void;
    onDeleteTask?: (taskId: string) => void;
    periodLabel?: string;
    daysWithTasks?: number[];
    selectedDay?: number;
    onSelectDay?: (day: number) => void;
    onOpenConversationFromTask?: (conversationId: string) => void;
};

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
    onOpenConversationFromTask,
}) => {
    console.log("[overlay-tasks]", tasks);
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
            setSelectedTime("12:00");
        }
    }, [isOpen]);

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        for (const t of tasks) {
            if (!t.date) continue;
            const key = t.date.slice(0, 10);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(t);
        }
        return map;
    }, [tasks]);

    const tasksForToday = useMemo(() => {
        const today = startOfDay(new Date());
        const key = formatDateKey(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        return tasks.filter((t) => t.date && t.date.slice(0, 10) === key);
    }, [tasks]);

    const tasksForThisWeek = useMemo(() => {
        const today = new Date();
        const weekStart = startOfWeek(today);
        const weekEnd = endOfWeek(today);

        const valid = tasks.filter((t) => {
            if (!t.date) return false;
            const d = parseLocalDate(t.date);
            if (!d) return false;
            return d >= weekStart && d <= weekEnd;
        });

        valid.sort((a, b) => {
            const aTime = parseLocalDate(a.date)?.getTime() ?? 0;
            const bTime = parseLocalDate(b.date)?.getTime() ?? 0;
            return aTime - bTime;
        });

        return valid;
    }, [tasks]);

    const overdueTasks = useMemo(() => {
        const all = tasks.filter((t) => isTaskOverdue(t));
        all.sort((a, b) => {
            const aTime = parseLocalDate(a.date)?.getTime() ?? 0;
            const bTime = parseLocalDate(b.date)?.getTime() ?? 0;
            return aTime - bTime;
        });
        return all;
    }, [tasks]);

    const upcomingTasksThisMonth = useMemo(() => {
        const today = startOfDay(new Date());
        const year = today.getFullYear();
        const month = today.getMonth();

        const valid = tasks.filter((t) => {
            if (!t.date) return false;
            const d = parseLocalDate(t.date);
            if (!d) return false;
            return d.getFullYear() === year && d.getMonth() === month && d >= today;
        });

        valid.sort((a, b) => {
            const aTime = parseLocalDate(a.date)?.getTime() ?? 0;
            const bTime = parseLocalDate(b.date)?.getTime() ?? 0;
            return aTime - bTime;
        });

        return valid;
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

    const tasksToDisplay = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];

        if (hasUserSelectedDate && selectedDate) {
            return tasksForSelectedDate;
        }

        const today = startOfDay(new Date());

        type TaskWithDate = { task: Task; date: Date };

        const allWithDate: TaskWithDate[] = tasks
            .map((task) => {
                if (!task.date) return null;
                const d = parseLocalDate(task.date);
                if (!d) return null;
                return { task, date: d };
            })
            .filter((item): item is TaskWithDate => item !== null);

        if (allWithDate.length === 0) return [];

        let candidates = allWithDate;

        if (viewMode === "month") {
            candidates = allWithDate.filter((item) => {
                return (
                    item.date.getFullYear() === currentYear &&
                    item.date.getMonth() === currentMonthIndex
                );
            });
        } else if (viewMode === "year") {
            candidates = allWithDate.filter(
                (item) => item.date.getFullYear() === currentYear
            );
        }

        if (candidates.length === 0) return [];

        const future = candidates.filter((item) => item.date >= today);
        const past = candidates.filter((item) => item.date < today);

        future.sort((a, b) => a.date.getTime() - b.date.getTime());
        past.sort((a, b) => b.date.getTime() - a.date.getTime());

        const ordered =
            viewMode === "month" || viewMode === "year"
                ? [...future, ...past]
                : [...future, ...past];

        const limited =
            viewMode === "month" || viewMode === "year"
                ? ordered.slice(0, 5)
                : ordered;

        return limited.map((item) => item.task);
    }, [
        tasks,
        hasUserSelectedDate,
        selectedDate,
        tasksForSelectedDate,
        viewMode,
        currentYear,
        currentMonthIndex,
    ]);

    const daysWithTasksSet = useMemo(() => {
        const set = new Set<string>();
        tasksByDate.forEach((_, key) => set.add(key));
        return set;
    }, [tasksByDate]);

    const totalTasks = tasks.length;

    const monthLabel = now.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const monthsIndexes = useMemo(
        () => Array.from({ length: 12 }, (_, i) => i),
        []
    );

    function primaryTitle(): string {
        if (viewMode === "day") return "Hoje";
        if (viewMode === "week") return "Semana";
        if (viewMode === "month") return monthLabel;
        if (viewMode === "overdue") return "Atrasadas";
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
        if (viewMode === "overdue") {
            const count = overdueTasks.length;
            if (count === 0) return "Você não tem tarefas atrasadas. 🎯";
            if (count === 1) return "Você tem 1 tarefa atrasada";
            return `Você tem ${count} tarefas atrasadas`;
        }
        return totalTasks === 1
            ? "Você tem uma tarefa neste ano"
            : `Você tem ${totalTasks} tarefas neste ano`;
    }

    function selectedDateLabel(): string {
        const base = selectedDate ?? now;
        const day = String(base.getDate()).padStart(2, "0");
        const monthName = base.toLocaleDateString("pt-BR", { month: "long" });
        return `${day} de ${monthName}`;
    }

    function rightPanelTitle(): string {
        if (hasUserSelectedDate) {
            return `Tarefas de ${selectedDateLabel()}`;
        }
        return "Próximas tarefas";
    }

    function rightPanelSubtitle(): string {
        const count = tasksToDisplay.length;
        if (count === 1) return "1 tarefa pendente";
        return `${count} tarefas pendentes`;
    }

    function renderTaskList(taskList: Task[], emptyMessage: string) {
        return (
            <TasksList
                tasks={taskList}
                conversations={conversations}
                emptyMessage={emptyMessage}
                onCompleteTask={onCompleteTask}
                onDeleteTask={onDeleteTask}
                onOpenConversationFromTask={onOpenConversationFromTask}
                viewMode={viewMode}  // ← ADICIONADO
            />
        );
    }

    function renderListOnly() {
        if (viewMode === "day") {
            return (
                <div className="tasks-main tasks-main-simple">
                    <div className="tasks-list">
                        {renderTaskList(
                            tasksForToday,
                            "Nenhuma tarefa para hoje"
                        )}
                    </div>
                </div>
            );
        }

        if (viewMode === "week") {
            return (
                <div className="tasks-main tasks-main-simple">
                    <div className="tasks-list">
                        {renderTaskList(
                            tasksForThisWeek,
                            "Nenhuma tarefa para esta semana"
                        )}
                    </div>
                </div>
            );
        }

        if (viewMode === "overdue") {
            return (
                <div className="tasks-main tasks-main-simple">
                    <div className="tasks-list">
                        {renderTaskList(
                            overdueTasks,
                            "Você não tem tarefas atrasadas. 🎯"
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="tasks-main tasks-main-simple">
                <div className="tasks-list">
                    {taskCards.length === 0 ? (
                        <div className="tasks-empty">
                            Nenhuma tarefa para este período
                        </div>
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

    const showMonthLayout = viewMode === "month";

    return (
        <div className="tasks-overlay-backdrop">
            <div className="tasks-overlay-panel">
                <TasksOverlayHeader
                    primaryTitle={primaryTitle()}
                    subtitle={subtitle()}
                    viewMode={viewMode}
                    onChangeViewMode={onChangeViewMode}
                    onClose={onClose}
                />

                {viewMode === "year" ? (
                    <TasksYearView
                        currentYear={currentYear}
                        monthsIndexes={monthsIndexes}
                        daysWithTasksSet={daysWithTasksSet}
                        tasksToDisplay={tasksToDisplay}
                        conversations={conversations}
                        hasUserSelectedDate={hasUserSelectedDate}
                        rightPanelTitle={rightPanelTitle()}
                        rightPanelSubtitle={rightPanelSubtitle()}
                        onCompleteTask={onCompleteTask}
                        onDeleteTask={onDeleteTask}
                        onOpenConversationFromTask={onOpenConversationFromTask}
                    />
                ) : showMonthLayout ? (
                    <TasksMonthView
                        currentYear={currentYear}
                        currentMonthIndex={currentMonthIndex}
                        monthLabel={monthLabel}
                        periodLabel={periodLabel}
                        daysWithTasksSet={daysWithTasksSet}
                        hasUserSelectedDate={hasUserSelectedDate}
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                            setHasUserSelectedDate(true);
                            setSelectedDate(date);
                        }}
                        totalTasks={totalTasks}
                        rightPanelTitle={rightPanelTitle()}
                        rightPanelSubtitle={rightPanelSubtitle()}
                        tasksToDisplay={tasksToDisplay}
                        conversations={conversations}
                        onCompleteTask={onCompleteTask}
                        onDeleteTask={onDeleteTask}
                        onOpenConversationFromTask={onOpenConversationFromTask}
                    />
                ) : (
                    renderListOnly()
                )}
            </div>
        </div>
    );
};

export default TasksOverlay;