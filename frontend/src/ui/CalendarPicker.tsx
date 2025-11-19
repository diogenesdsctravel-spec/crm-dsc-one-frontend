import React, { useState } from "react";
import "../index.css";

interface CalendarPickerProps {
    onSelectDate: (date: string) => void;
    onClose: () => void;
}

export default function CalendarPicker({
    onSelectDate,
    onClose,
}: CalendarPickerProps) {
    const today = new Date();

    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    const date = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = date.getDay();

    const weeks: Array<Array<number | null>> = [];
    let currentWeek: Array<number | null> = [];
    let dayCounter = 1;

    for (let i = 0; i < firstDay; i++) currentWeek.push(null);

    while (dayCounter <= daysInMonth) {
        currentWeek.push(dayCounter);

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }

        dayCounter++;
    }

    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    function handlePrev() {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    }

    function handleNext() {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    }

    function formatDate(d: number) {
        const m = String(month + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${year}-${m}-${dd}`;
    }

    return (
        <div className="calendar-overlay" onClick={onClose}>
            <div className="calendar-box" onClick={(e) => e.stopPropagation()}>
                <header className="calendar-header">
                    <button onClick={handlePrev}>←</button>
                    <strong>
                        {date.toLocaleString("pt-BR", {
                            month: "long",
                            year: "numeric",
                        })}
                    </strong>
                    <button onClick={handleNext}>→</button>
                </header>

                <div className="calendar-grid">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
                        <div key={d} className="calendar-weekday">
                            {d}
                        </div>
                    ))}

                    {weeks.map((w, wi) =>
                        w.map((d, di) => (
                            <div key={`${wi}-${di}`} className="calendar-day">
                                {d && (
                                    <button
                                        className="calendar-day-btn"
                                        onClick={() => onSelectDate(formatDate(d))}
                                    >
                                        {d}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
