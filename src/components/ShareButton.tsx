"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User closed the share sheet. Fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-shell px-4 text-sm font-semibold text-ink hover:border-berry hover:bg-blush"
    >
      <span aria-hidden>↗</span>
      <span aria-live="polite">{copied ? "Link copied!" : "Share result"}</span>
    </button>
  );
}
