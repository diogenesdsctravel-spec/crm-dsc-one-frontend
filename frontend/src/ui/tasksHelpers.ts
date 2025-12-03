// src/ui/tasksHelpers.ts
// Helpers unificados para calendário e tarefas

// ========== CONSTANTES ==========

export const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

// ========== PARSING E FORMATAÇÃO ==========

export function parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.slice(0, 10).split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month, day);
}

export function formatDateKey(year: number, monthIndex: number, day: number): string {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

// ========== OPERAÇÕES COM DATAS ==========

export function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function endOfWeek(date: Date): Date {
    const start = startOfWeek(date);
    const d = new Date(start);
    d.setDate(start.getDate() + 6);
    return d;
}

// ========== COMPARAÇÕES ==========

export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function isSameWeek(taskDate: Date, refDate: Date): boolean {
    const start = startOfWeek(refDate);
    const end = endOfWeek(refDate);
    return taskDate >= start && taskDate <= end;
}

export function isSameMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isSameYear(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear();
}

export function isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

// ========== GRID DE CALENDÁRIO ==========

export function buildMonthGrid(year: number, monthIndex: number): (number | null)[][] {
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

// ========== TAREFAS ==========

export function isTaskOverdue(task: { date?: string }): boolean {
    if (!task.date) return false;
    const taskDate = parseLocalDate(task.date);
    if (!taskDate) return false;

    const today = startOfDay(new Date());
    const taskDay = startOfDay(taskDate);

    return taskDay < today;
}