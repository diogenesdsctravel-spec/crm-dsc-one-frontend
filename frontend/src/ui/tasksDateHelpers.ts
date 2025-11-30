export function parseDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    d.setHours(0, 0, 0, 0);
    return d;
}

export function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function endOfWeek(date) {
    const start = startOfWeek(date);
    const d = new Date(start);
    d.setDate(start.getDate() + 6);
    return d;
}

export function isSameWeek(taskDate, refDate) {
    const start = startOfWeek(refDate);
    const end = endOfWeek(refDate);
    return taskDate >= start && taskDate <= end;
}

export function isSameMonth(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth()
    );
}

export function isSameYear(a, b) {
    return a.getFullYear() === b.getFullYear();
}

export function isPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

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

export function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function isTaskOverdue(task: { date?: string }): boolean {
    if (!task.date) return false;
    const taskDate = parseLocalDate(task.date);
    if (!taskDate) return false;

    const today = startOfDay(new Date());
    const taskDay = startOfDay(taskDate);

    return taskDay < today;
}
