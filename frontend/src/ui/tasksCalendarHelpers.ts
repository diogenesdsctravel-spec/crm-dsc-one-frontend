export const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

export function buildMonthGrid(year: number, monthIndex: number) {
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

export function formatDateKey(year: number, monthIndex: number, day: number): string {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}
