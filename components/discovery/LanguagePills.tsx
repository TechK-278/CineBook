import React from "react";
import Link from "next/link";
import { LANGUAGES } from "@/lib/mock-data/languages";
import { cn } from "@/lib/utils";

interface LanguagePillsProps {
  activeLanguage?: string;
  className?: string;
}

export function LanguagePills({ activeLanguage, className }: LanguagePillsProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2", className)}>
      {LANGUAGES.map((lang) => {
        const isSelected = activeLanguage?.toLowerCase() === lang.id.toLowerCase();
        return (
          <Link
            key={lang.id}
            href={`/movies?language=${lang.id}`}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-150 hover:-translate-y-0.5",
              isSelected
                ? "bg-cinebook-accent text-white border-cinebook-accent shadow-md"
                : "bg-cinebook-surface text-zinc-300 border-cinebook-border hover:border-zinc-600 hover:text-white"
            )}
          >
            <span className="text-sm font-bold">{lang.name}</span>
            <span className="text-[11px] text-zinc-400 mt-0.5">{lang.nativeName}</span>
          </Link>
        );
      })}
    </div>
  );
}
