"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Display ad placeholder. With NEXT_PUBLIC_ADSENSE_CLIENT set (and the AdSense
 * script loaded in the root layout), it renders a real AdSense unit for
 * `slot`. Without it, it shows a dashed box in development and nothing in
 * production.
 */
export function AdSlot({ slot, className = "" }: { slot: string; className?: string }) {
  useEffect(() => {
    if (!client) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers throw here. Nothing to do.
    }
  }, []);

  if (client) {
    return (
      <div className={className} aria-label="Advertisement">
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      aria-hidden
      className={`grid h-28 place-items-center rounded-2xl border-2 border-dashed border-line text-xs text-muted ${className}`}
    >
      Ad slot: {slot}
    </div>
  );
}
