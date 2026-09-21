"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getTodayDateIST } from "@/lib/supabase/show-utils";

interface DateOption {
  day: string;
  date: string;
  isoDate: string;
}

export function generateDateOptions(count = 5): DateOption[] {
  const options: DateOption[] = [];
  const todayStr = getTodayDateIST();
  const [y, m, d] = todayStr.split("-").map(Number);

  for (let i = 0; i < count; i++) {
    const targetDate = new Date(Date.UTC(y, m - 1, d + i));
    const isoDate = targetDate.toISOString().split("T")[0];

    let dayLabel = targetDate.toLocaleDateString("en-IN", {
      weekday: "short",
      timeZone: "Asia/Kolkata",
    });
    if (i === 0) dayLabel = "Today";
    if (i === 1) dayLabel = "Tomorrow";

    const dateLabel = targetDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "Asia/Kolkata",
    });

    options.push({
      day: dayLabel,
      date: dateLabel,
      isoDate,
    });
  }

  return options;
}

interface DateSelectorProps {
  selectedDate?: string;
  className?: string;
}

export function DateSelector({ selectedDate, className }: DateSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dates = generateDateOptions(5);
  const activeDate = selectedDate || dates[0]?.isoDate || getTodayDateIST();

  const handleSelectDate = (isoDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", isoDate);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      role="tablist"
      aria-label="Select showtime date"
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-cinebook-border scrollbar-none",
        className
      )}
    >
      {dates.map((d) => {
        const isSelected = d.isoDate === activeDate;
        return (
          <button
            key={d.isoDate}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => handleSelectDate(d.isoDate)}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border px-4 py-2.5 min-w-[85px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinebook-accent",
              isSelected
                ? "bg-cinebook-accent text-white border-cinebook-accent shadow-md"
                : "bg-cinebook-surface text-zinc-300 border-cinebook-border hover:border-zinc-600 hover:text-white"
            )}
          >
            <span className="text-xs font-medium">{d.day}</span>
            <span className="text-sm font-bold">{d.date}</span>
          </button>
        );
      })}
    </div>
  );
}
