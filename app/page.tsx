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
    <div>
      SplashPage
    </div>
  );
}
