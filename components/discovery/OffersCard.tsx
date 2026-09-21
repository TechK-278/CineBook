import React from "react";
import { Tag, Copy, Sparkles } from "lucide-react";
import { OfferItem } from "@/lib/mock-data/offers";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OffersCardProps {
  offer: OfferItem;
  className?: string;
}

export function OffersCard({ offer, className }: OffersCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-cinebook-border bg-cinebook-surface p-5 transition-all hover:border-zinc-700 hover:shadow-lg",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="accent" className="text-[10px] font-bold">
            {offer.discountBadge}
          </Badge>
          <span className="text-[11px] text-zinc-400">{offer.category}</span>
        </div>

        <h3 className="text-base font-bold text-white mb-1">{offer.title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-3">{offer.description}</p>
      </div>

      <div className="pt-3 border-t border-cinebook-border/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-md bg-cinebook-dark border border-cinebook-border px-2.5 py-1 text-xs font-mono font-bold text-cinebook-accent">
          <Tag className="h-3 w-3" />
          {offer.code}
        </div>
        <span className="text-[10px] text-zinc-500">Valid till {offer.validUntil}</span>
      </div>
    </article>
  );
}
