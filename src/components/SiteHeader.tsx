import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-blush text-base">
            ✿
          </span>
          {SITE_NAME}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium">
          <Link href="/ingredient" className="rounded-full px-3 py-2 text-muted hover:bg-blush hover:text-ink">
            Ingredients
          </Link>
          <Link href="/product" className="rounded-full px-3 py-2 text-muted hover:bg-blush hover:text-ink">
            Products
          </Link>
        </nav>
      </div>
    </header>
  );
}
