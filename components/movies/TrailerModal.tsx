"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrailerModalProps {
  trailerYoutubeId?: string;
  movieTitle: string;
}

export function TrailerModal({ trailerYoutubeId, movieTitle }: TrailerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    // Prevent body scrolling while modal is active
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!trailerYoutubeId) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2 text-xs sm:text-sm font-semibold border-zinc-700 bg-cinebook-surface/80 hover:bg-cinebook-surface text-white hover:text-cinebook-accent shadow-lg"
        aria-haspopup="dialog"
      >
        <Play className="h-4 w-4 fill-cinebook-accent text-cinebook-accent" />
        <span>Watch Trailer</span>
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Official trailer for ${movieTitle}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-cinebook-border bg-cinebook-dark shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cinebook-border bg-cinebook-surface">
              <div className="text-sm font-bold text-white truncate max-w-md">
                {movieTitle} — Official Trailer
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinebook-accent"
                aria-label="Close trailer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Iframe Container (16:9 Aspect Ratio) */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailerYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={`Trailer for ${movieTitle}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
