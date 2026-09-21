import React from "react";
import { Tag, Sparkles, ShieldCheck, Gift } from "lucide-react";
import { OFFERS } from "@/lib/mock-data/offers";
import { OffersCard } from "@/components/discovery/OffersCard";
import { Badge } from "@/components/ui/badge";

export default function OffersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cinebook-border mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="accent" className="gap-1 text-xs">
              <Gift className="h-3 w-3" /> Exclusive Promotions
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Tag className="h-7 w-7 text-cinebook-accent" />
            Offers & Discount Codes
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Apply promo codes at checkout to unlock savings on movie tickets and snacks
          </p>
        </div>
        <Badge variant="secondary" className="self-start md:self-auto">
          {OFFERS.length} Active Deals
        </Badge>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {OFFERS.map((offer) => (
          <OffersCard key={offer.id} offer={offer} />
        ))}
      </div>

      {/* Terms Box */}
      <div className="mt-12 rounded-xl border border-cinebook-border bg-cinebook-surface/50 p-6 text-xs text-zinc-400 space-y-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cinebook-accent" />
          General Offer Terms & Conditions
        </h3>
        <p>• Promotional discounts are subject to partner cinema availability and seat quota.</p>
        <p>• Only one promo code may be applied per ticket booking transaction.</p>
        <p>• Bank offers require payment via eligible debit/credit card or net banking accounts.</p>
      </div>
    </div>
  );
}
