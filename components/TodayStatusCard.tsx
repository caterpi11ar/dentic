import { Check, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodayStatusCardProps {
  amCompleted: boolean;
  pmCompleted: boolean;
}

interface SessionPillProps {
  icon: React.ReactNode;
  label: string;
  done: boolean;
}

function SessionPill({ icon, label, done }: SessionPillProps) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-3 rounded-2xl px-4 py-3.5",
        done ? "bg-primary/10" : "bg-muted/60",
      )}
    >
      <span className={cn("shrink-0", done ? "text-primary" : "text-muted-foreground/40")}>
        {icon}
      </span>
      <span className={cn("flex-1 text-sm font-medium", done ? "text-primary" : "text-muted-foreground")}>
        {label}
      </span>
      {done
        ? <Check size={16} strokeWidth={2.5} className="shrink-0 text-primary" />
        : <span className="size-4 shrink-0 rounded-full border-2 border-muted-foreground/20" />}
    </div>
  );
}

export function TodayStatusCard({ amCompleted, pmCompleted }: TodayStatusCardProps) {
  return (
    <div className="flex gap-3">
      <SessionPill icon={<Sun size={18} />} label="Morning" done={amCompleted} />
      <SessionPill icon={<Moon size={18} />} label="Evening" done={pmCompleted} />
    </div>
  );
}
