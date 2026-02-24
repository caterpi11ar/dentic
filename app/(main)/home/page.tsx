"use client";

import type { AppState, DayRecord } from "@/types/app";
import { useEffect, useState } from "react";
import { StartBrushingButton } from "@/components/StartBrushingButton";
import { StreakCard } from "@/components/StreakCard";
import { TodayStatusCard } from "@/components/TodayStatusCard";
import { cn } from "@/lib/utils";

function buildWeekHistory(): DayRecord[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const isToday = i === 6;
    const isPast = i < 6;
    // Deterministic mock: use day-of-month as seed to avoid SSR/client mismatch
    const seed = d.getDate();
    return {
      date: d.toISOString().slice(0, 10),
      am: isPast ? seed % 4 !== 0 : true,
      pm: isToday ? false : isPast ? seed % 3 !== 0 : false,
    };
  });
}

const DAY_LABELS = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];

function getDayOfWeek(isoDate: string): number {
  const d = new Date(isoDate);
  // Monday = 0 … Sunday = 6
  return (d.getDay() + 6) % 7;
}

interface WeekStripProps {
  history: DayRecord[];
}

function WeekStrip({ history }: WeekStripProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        This week
      </span>
      <div className="flex justify-between">
        {history.map((record, i) => {
          const partial = record.am || record.pm;
          const dayLabel = DAY_LABELS[getDayOfWeek(record.date)];
          const isToday = i === history.length - 1;
          return (
            <div key={record.date} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-xs font-bold",
                  partial && "bg-primary text-primary-foreground",
                  !partial && "bg-muted text-muted-foreground/40",
                  isToday && !partial && "ring-2 ring-primary/40",
                )}
              >
                {dayLabel}
              </div>
              <span
                className={cn(
                  "text-[11px]",
                  isToday ? "font-bold text-foreground" : "text-muted-foreground/60",
                )}
              >
                {record.date.slice(8)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const INITIAL_STATE: AppState = {
  streakDays: 12,
  todayAm: true,
  todayPm: false,
  weekHistory: buildWeekHistory(),
};

function getGreeting(days: number, amDone: boolean, pmDone: boolean, hour: number) {
  const bothDone = amDone && pmDone;

  if (bothDone) {
    return { heading: "All done today! 🎉", sub: `${days}-day streak and counting.` };
  }
  if (days > 0 && days % 7 === 6) {
    return { heading: `${days} days strong! 💪`, sub: `One more day to hit a ${days + 1}-day streak.` };
  }
  if (hour < 12) {
    return { heading: "Rise and shine! ✨", sub: `Let's make it ${days + 1} days!` };
  }
  if (hour < 18) {
    return { heading: "You're doing great! 🦷", sub: `Let's make it ${days + 1} days!` };
  }
  return { heading: "Good evening! 🌙", sub: amDone ? "Evening session still to go." : `Let's make it ${days + 1} days!` };
}

export default function HomePage() {
  const [state] = useState<AppState>(INITIAL_STATE);
  // Initialize to -1 on server; set to real hour only on client to avoid timezone mismatch
  const [hour, setHour] = useState(-1);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const { heading, sub } = getGreeting(state.streakDays, state.todayAm, state.todayPm, hour);

  return (
    <main className="flex flex-1 flex-col px-5 pb-24 pt-6">
      {/* Greeting */}
      <header className="mb-6">
        <h2 className="text-2xl font-bold">{heading}</h2>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </header>

      {/* Streak ring — fills remaining vertical space, centered */}
      <div className="flex flex-1 items-center justify-center">
        <StreakCard days={state.streakDays} />
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-4">
        <WeekStrip history={state.weekHistory} />
        <TodayStatusCard amCompleted={state.todayAm} pmCompleted={state.todayPm} />
        <StartBrushingButton />
      </div>
    </main>
  );
}
