"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-white px-6 py-12">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <span className="text-8xl">🦷</span>
        <h1 className="text-3xl font-black tracking-tight text-primary">
          Dentic
        </h1>
        <p className="text-sm text-foreground/60">
          Clean habits, daily.
        </p>
      </div>

      <div className="w-full rounded-2xl bg-muted p-5 text-center">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Sponsored
        </p>
        <p className="text-base font-semibold text-foreground">
          Start your free trial today
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Premium brushing coach — 7 days free
        </p>
      </div>
    </div>
  );
}
