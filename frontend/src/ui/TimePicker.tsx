/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";

type TimePickerProps = {
    value: string; // formato "HH:MM"
    onChange: (value: string) => void;
    minuteStep?: number;
    minHour?: number;
    maxHour?: number;
};

const ITEM_HEIGHT = 44;

function parseTime(value: string): { hour: number; minute: number } {
    const [h, m] = value.split(":").map((x) => parseInt(x, 10));
    return {
        hour: Number.isFinite(h) ? h : 0,
        minute: Number.isFinite(m) ? m : 0,
    };
}

function formatTime(hour: number, minute: number): string {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const TimePicker: React.FC<TimePickerProps> = ({
    value,
    onChange,
    minuteStep = 5,
    minHour = 0,
    maxHour = 23,
}) => {
    const { hour: initialHour, minute: initialMinute } = parseTime(value);

    const [selectedHour, setSelectedHour] = useState(initialHour);
    const [selectedMinute, setSelectedMinute] = useState(initialMinute);

    const hoursListRef = useRef<HTMLUListElement>(null);
    const minutesListRef = useRef<HTMLUListElement>(null);

    const hourItemRefs = useRef<Map<number, HTMLLIElement>>(new Map());
    const minuteItemRefs = useRef<Map<number, HTMLLIElement>>(new Map());

    // Gerar arrays de horas e minutos
    const hours: number[] = [];
    for (let h = minHour; h <= maxHour; h++) {
        hours.push(h);
    }

    const minutes: number[] = [];
    const step = minuteStep > 0 ? minuteStep : 5;
    for (let m = 0; m < 60; m += step) {
        minutes.push(m);
    }

    const findNearestMinute = (target: number): number => {
        return minutes.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        );
    };

    const scrollToHour = (h: number) => {
        const element = hourItemRefs.current.get(h);
        if (element) {
            element.scrollIntoView({ block: "center", behavior: "auto" });
        }
    };

    const scrollToMinute = (m: number) => {
        const element = minuteItemRefs.current.get(m);
        if (element) {
            element.scrollIntoView({ block: "center", behavior: "auto" });
        }
    };

    const updateTime = (newHour: number, newMinute: number) => {
        const safeHour = Math.max(minHour, Math.min(maxHour, newHour));
        const nearestMinute = findNearestMinute(newMinute);

        setSelectedHour(safeHour);
        setSelectedMinute(nearestMinute);
        onChange(formatTime(safeHour, nearestMinute));
    };

    const handleHourClick = (h: number) => {
        updateTime(h, selectedMinute);
        scrollToHour(h);
    };

    const handleMinuteClick = (m: number) => {
        updateTime(selectedHour, m);
        scrollToMinute(m);
    };

    // Detecção ao rolar manualmente
    const detectCenterHour = () => {
        if (!hoursListRef.current) return;

        const listRect = hoursListRef.current.getBoundingClientRect();
        const centerY = listRect.top + listRect.height / 2;

        let closestHour = selectedHour;
        let minDistance = Infinity;

        hourItemRefs.current.forEach((element, h) => {
            const rect = element.getBoundingClientRect();
            const itemCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(itemCenterY - centerY);

            if (distance < minDistance) {
                minDistance = distance;
                closestHour = h;
            }
        });

        if (closestHour !== selectedHour) {
            updateTime(closestHour, selectedMinute);
        }
    };

    const detectCenterMinute = () => {
        if (!minutesListRef.current) return;

        const listRect = minutesListRef.current.getBoundingClientRect();
        const centerY = listRect.top + listRect.height / 2;

        let closestMinute = selectedMinute;
        let minDistance = Infinity;

        minuteItemRefs.current.forEach((element, m) => {
            const rect = element.getBoundingClientRect();
            const itemCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(itemCenterY - centerY);

            if (distance < minDistance) {
                minDistance = distance;
                closestMinute = m;
            }
        });

        if (closestMinute !== selectedMinute) {
            updateTime(selectedHour, closestMinute);
        }
    };

    const hourScrollTimeout = useRef<number | null>(null);
    const minuteScrollTimeout = useRef<number | null>(null);

    const handleHourScroll = () => {
        if (hourScrollTimeout.current) clearTimeout(hourScrollTimeout.current);
        hourScrollTimeout.current = window.setTimeout(detectCenterHour, 100);
    };

    const handleMinuteScroll = () => {
        if (minuteScrollTimeout.current) clearTimeout(minuteScrollTimeout.current);
        minuteScrollTimeout.current = window.setTimeout(detectCenterMinute, 100);
    };

    // Sincronização inicial
    useEffect(() => {
        const { hour, minute } = parseTime(value);
        const safeHour = Math.max(minHour, Math.min(maxHour, hour));
        const nearestMinute = findNearestMinute(minute);

        setSelectedHour(safeHour);
        setSelectedMinute(nearestMinute);

        // Aguarda o render para garantir que os refs existem
        setTimeout(() => {
            scrollToHour(safeHour);
            scrollToMinute(nearestMinute);
        }, 0);
    }, [value]);

    useEffect(() => {
        return () => {
            if (hourScrollTimeout.current) clearTimeout(hourScrollTimeout.current);
            if (minuteScrollTimeout.current) clearTimeout(minuteScrollTimeout.current);
        };
    }, []);

    return (
        <div className="timepicker">
            <div className="timepicker-column">
                <div className="timepicker-label">Hora</div>
                <div className="timepicker-window">
                    <div className="timepicker-highlight" />
                    <ul
                        className="timepicker-list"
                        ref={hoursListRef}
                        onScroll={handleHourScroll}
                    >
                        {hours.map((h) => (
                            <li
                                key={h}
                                ref={(el) => {
                                    if (el) hourItemRefs.current.set(h, el);
                                    else hourItemRefs.current.delete(h);
                                }}
                                className={`timepicker-item${h === selectedHour ? " timepicker-item--active" : ""
                                    }`}
                                onClick={() => handleHourClick(h)}
                            >
                                {String(h).padStart(2, "0")}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="timepicker-separator">:</div>

            <div className="timepicker-column">
                <div className="timepicker-label">Minutos</div>
                <div className="timepicker-window">
                    <div className="timepicker-highlight" />
                    <ul
                        className="timepicker-list"
                        ref={minutesListRef}
                        onScroll={handleMinuteScroll}
                    >
                        {minutes.map((m) => (
                            <li
                                key={m}
                                ref={(el) => {
                                    if (el) minuteItemRefs.current.set(m, el);
                                    else minuteItemRefs.current.delete(m);
                                }}
                                className={`timepicker-item${m === selectedMinute ? " timepicker-item--active" : ""
                                    }`}
                                onClick={() => handleMinuteClick(m)}
                            >
                                {String(m).padStart(2, "0")}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TimePicker;