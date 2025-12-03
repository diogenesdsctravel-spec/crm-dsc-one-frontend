// src/ui/CalendarPicker.tsx

import React, { useState } from "react";
import TimePicker from "./TimePicker";
import "../index.css";

interface CalendarPickerProps {
    onSelectDate: (date: string, time?: string) => void;
    onClose: () => void;
}

export default function CalendarPicker({
    onSelectDate,
    onClose,
}: CalendarPickerProps) {
    const today = new Date();

    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(
        today.getMonth() === month && today.getFullYear() === year
            ? today.getDate()
            : null
    );

    const [selectedTime, setSelectedTime] = useState(() => {
        const h = today.getHours();
        const m = Math.round(today.getMinutes() / 5) * 5;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    });

    function handlePrev() {
        if (month === 0) {
            setMonth(11);
            setYear((prev) => prev - 1);
        } else {
            setMonth((prev) => prev - 1);
        }
        setSelectedDay(null);
    }

    function handleNext() {
        if (month === 11) {
            setMonth(0);
            setYear((prev) => prev + 1);
        } else {
            setMonth((prev) => prev + 1);
        }
        setSelectedDay(null);
    }

    function formatDate(d: number) {
        const m = String(month + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${year}-${m}-${dd}`;
    }

    function handleOverlayClick() {
        if (selectedDay) {
            const dateStr = formatDate(selectedDay);
            onSelectDate(dateStr, selectedTime);
        }
        onClose();
    }

    // Construção das semanas
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: Array<Array<number | null>> = [];
    let currentWeek: Array<number | null> = [];
    let dayCounter = 1;

    for (let i = 0; i < firstDay; i += 1) currentWeek.push(null);

    while (dayCounter <= daysInMonth) {
        currentWeek.push(dayCounter);

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }

        dayCounter += 1;
    }

    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    return (
        <div className="calendar-overlay" onClick={handleOverlayClick}>
            <div className="calendar-box" onClick={(e) => e.stopPropagation()}>
                <header className="calendar-header">
                    <button type="button" onClick={handlePrev}>
                        ←
                    </button>
                    <strong>
                        {new Date(year, month).toLocaleString("pt-BR", {
                            month: "long",
                            year: "numeric",
                        })}
                    </strong>
                    <button type="button" onClick={handleNext}>
                        →
                    </button>
                </header>

                <div className="calendar-content">
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
                                            type="button"
                                            className={
                                                "calendar-day-btn" +
                                                (selectedDay === d ? " is-selected" : "")
                                            }
                                            onClick={() => setSelectedDay(d)}
                                        >
                                            {d}
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="calendar-time-section">
                        <div className="calendar-time-label">Horário</div>
                        <TimePicker
                            value={selectedTime}
                            onChange={setSelectedTime}
                            minuteStep={5}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}