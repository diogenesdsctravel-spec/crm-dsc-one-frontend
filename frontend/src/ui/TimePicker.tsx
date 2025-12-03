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
const VISIBLE_COUNT = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const PADDING = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

function parseTime(value: string): { hour: number; minute: number } {
    const [h, m] = value.split(":").map((x) => parseInt(x, 10));
    return {
        hour: Number.isFinite(h) ? h : 0,
        minute: Number.isFinite(m) ? m : 0,
    };
}

function formatTime(hour: number, minute: number): string {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
    )}`;
}

function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
}

function detectNearestIndex(container: HTMLElement, total: number): number {
    const raw = container.scrollTop / ITEM_HEIGHT;
    let index = Math.round(raw);
    if (index < 0) index = 0;
    if (index > total - 1) index = total - 1;
    return index;
}

function scrollToIndex(container: HTMLElement, index: number) {
    const top = index * ITEM_HEIGHT;
    container.scrollTo({ top, behavior: "smooth" });
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

    const hoursListRef = useRef<HTMLDivElement>(null);
    const minutesListRef = useRef<HTMLDivElement>(null);

    const hourScrollTimeout = useRef<number | null>(null);
    const minuteScrollTimeout = useRef<number | null>(null);

    // horas
    const hours: number[] = [];
    for (let h = minHour; h <= maxHour; h += 1) {
        hours.push(h);
    }

    // minutos
    const minutes: number[] = [];
    const step = minuteStep > 0 ? minuteStep : 5;
    for (let m = 0; m < 60; m += step) {
        minutes.push(m);
    }

    function findNearestMinute(target: number) {
        return minutes.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        );
    }

    function updateTime(newHour: number, newMinute: number) {
        const safeHour = clamp(newHour, minHour, maxHour);
        const nearestMinute = findNearestMinute(newMinute);

        setSelectedHour(safeHour);
        setSelectedMinute(nearestMinute);

        onChange(formatTime(safeHour, nearestMinute));
    }

    // detecção via scroll (igual lógica do sandbox)
    const detectCenterHour = () => {
        if (!hoursListRef.current) return;
        const index = detectNearestIndex(hoursListRef.current, hours.length);
        updateTime(hours[index], selectedMinute);
    };

    const detectCenterMinute = () => {
        if (!minutesListRef.current) return;
        const index = detectNearestIndex(
            minutesListRef.current,
            minutes.length
        );
        updateTime(selectedHour, minutes[index]);
    };

    const handleHourScroll = () => {
        if (hourScrollTimeout.current) {
            clearTimeout(hourScrollTimeout.current);
        }
        hourScrollTimeout.current = window.setTimeout(() => {
            detectCenterHour();
            if (hoursListRef.current) {
                const i = hours.indexOf(selectedHour);
                if (i >= 0) {
                    scrollToIndex(hoursListRef.current, i);
                }
            }
        }, 60);
    };

    const handleMinuteScroll = () => {
        if (minuteScrollTimeout.current) {
            clearTimeout(minuteScrollTimeout.current);
        }
        minuteScrollTimeout.current = window.setTimeout(() => {
            detectCenterMinute();
            if (minutesListRef.current) {
                const i = minutes.indexOf(selectedMinute);
                if (i >= 0) {
                    scrollToIndex(minutesListRef.current, i);
                }
            }
        }, 60);
    };

    // sincroniza value vindo de fora
    useEffect(() => {
        const { hour, minute } = parseTime(value);

        const safeHour = clamp(hour, minHour, maxHour);
        const nearestMinute = findNearestMinute(minute);

        setSelectedHour(safeHour);
        setSelectedMinute(nearestMinute);

        setTimeout(() => {
            if (hoursListRef.current) {
                const i = hours.indexOf(safeHour);
                if (i >= 0) {
                    scrollToIndex(hoursListRef.current, i);
                }
            }
            if (minutesListRef.current) {
                const i = minutes.indexOf(nearestMinute);
                if (i >= 0) {
                    scrollToIndex(minutesListRef.current, i);
                }
            }
        }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <div
            style={{
                display: "flex",
                gap: 24,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* HORAS --------------------------------------------------- */}
            <div style={{ textAlign: "center" }}>
                <div
                    style={{
                        marginBottom: 8,
                        fontSize: 13,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                        opacity: 0.7,
                    }}
                >
                    Hora
                </div>

                <div
                    style={{
                        position: "relative",
                        width: 96,
                        height: CONTAINER_HEIGHT,
                    }}
                >
                    {/* barra de destaque central */}
                    <div
                        style={{
                            position: "absolute",
                            insetInline: 4,
                            top: CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2,
                            height: ITEM_HEIGHT,
                            borderRadius: 999,
                            background: "rgba(148,163,184,0.12)",
                            boxShadow:
                                "0 0 0 1px rgba(148,163,184,0.28), 0 10px 25px rgba(15,23,42,0.20)",
                            pointerEvents: "none",
                            zIndex: 1,
                        }}
                    />

                    <div
                        ref={hoursListRef}
                        onScroll={handleHourScroll}
                        style={{
                            position: "relative",
                            zIndex: 2,
                            width: "100%",
                            height: "100%",
                            overflowY: "scroll",
                            borderRadius: 999,
                            background: "rgba(15,23,42,0.02)",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        <div style={{ paddingTop: PADDING, paddingBottom: PADDING }}>
                            {hours.map((h) => {
                                const isActive = h === selectedHour;
                                return (
                                    <div
                                        key={h}
                                        style={{
                                            height: ITEM_HEIGHT,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: isActive ? 22 : 18,
                                            fontWeight: isActive ? 600 : 400,
                                            opacity: isActive ? 1 : 0.35,
                                            transform: isActive ? "scale(1)" : "scale(0.96)",
                                            transition:
                                                "opacity 120ms ease, font-size 120ms ease, transform 120ms ease",
                                        }}
                                        onClick={() => updateTime(h, selectedMinute)}
                                    >
                                        {String(h).padStart(2, "0")}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* SEPARADOR */}
            <div style={{ fontSize: 32, marginTop: 10 }}>:</div>

            {/* MINUTOS ------------------------------------------------ */}
            <div style={{ textAlign: "center" }}>
                <div
                    style={{
                        marginBottom: 8,
                        fontSize: 13,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                        opacity: 0.7,
                    }}
                >
                    Minutos
                </div>

                <div
                    style={{
                        position: "relative",
                        width: 96,
                        height: CONTAINER_HEIGHT,
                    }}
                >
                    {/* barra de destaque central */}
                    <div
                        style={{
                            position: "absolute",
                            insetInline: 4,
                            top: CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2,
                            height: ITEM_HEIGHT,
                            borderRadius: 999,
                            background: "rgba(148,163,184,0.12)",
                            boxShadow:
                                "0 0 0 1px rgba(148,163,184,0.28), 0 10px 25px rgba(15,23,42,0.20)",
                            pointerEvents: "none",
                            zIndex: 1,
                        }}
                    />

                    <div
                        ref={minutesListRef}
                        onScroll={handleMinuteScroll}
                        style={{
                            position: "relative",
                            zIndex: 2,
                            width: "100%",
                            height: "100%",
                            overflowY: "scroll",
                            borderRadius: 999,
                            background: "rgba(15,23,42,0.02)",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        <div style={{ paddingTop: PADDING, paddingBottom: PADDING }}>
                            {minutes.map((m) => {
                                const isActive = m === selectedMinute;
                                return (
                                    <div
                                        key={m}
                                        style={{
                                            height: ITEM_HEIGHT,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: isActive ? 22 : 18,
                                            fontWeight: isActive ? 600 : 400,
                                            opacity: isActive ? 1 : 0.35,
                                            transform: isActive ? "scale(1)" : "scale(0.96)",
                                            transition:
                                                "opacity 120ms ease, font-size 120ms ease, transform 120ms ease",
                                        }}
                                        onClick={() => updateTime(selectedHour, m)}
                                    >
                                        {String(m).padStart(2, "0")}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimePicker;
