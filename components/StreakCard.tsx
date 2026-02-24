interface StreakCardProps {
  days: number;
}

export function StreakCard({ days }: StreakCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-8xl font-black tabular-nums leading-none text-foreground">
        {days}
      </span>
      <span className="text-base text-muted-foreground">Day Streak</span>
    </div>
  );
}
