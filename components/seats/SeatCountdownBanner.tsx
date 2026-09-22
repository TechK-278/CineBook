"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface SeatCountdownBannerProps {
  expiresAt: string | null;
  onExpire?: () => void;
}

export function SeatCountdownBanner({
  expiresAt,
  onExpire,
}: SeatCountdownBannerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsRemaining(null);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsRemaining(remaining);

      if (remaining <= 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (secondsRemaining === null || secondsRemaining <= 0) {
    return null;
  }

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const isLowTime = secondsRemaining <= 120; // 2 minutes left
  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / 600) * 100));

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        isLowTime
          ? "border-red-500/50 bg-red-950/40 text-red-200"
          : "border-amber-500/40 bg-amber-950/30 text-amber-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isLowTime ? (
            <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse shrink-0" />
          ) : (
            <Clock className="h-5 w-5 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="text-xs sm:text-sm font-bold">
              Seats Locked Exclusively for You
            </div>
            <div className="text-[11px] text-zinc-400">
              Please complete checkout before the lock timer expires.
            </div>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`font-mono text-lg sm:text-xl font-extrabold tracking-wider ${
              isLowTime ? "text-red-400" : "text-amber-400"
            }`}
          >
            {formattedTime}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400">
            Time Left
          </span>
        </div>
      </div>

      {/* Progress countdown bar */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full transition-all duration-1000 ${
            isLowTime ? "bg-red-500" : "bg-amber-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
