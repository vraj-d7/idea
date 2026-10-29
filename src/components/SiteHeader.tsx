import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const navLink =
  "rounded-full px-2.5 py-2 text-muted hover:bg-blush hover:text-ink sm:px-3";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full bg-blush text-base max-[360px]:hidden"
          >
            ✿
          </span>
          {SITE_NAME}
        </Link>
        <nav aria-label="Main" className="-mr-2.5 flex items-center text-sm font-medium sm:mr-0 sm:gap-1">
          <Link href="/ingredient" className={navLink}>
            Ingredients
          </Link>
          <Link href="/product" className={navLink}>
            Products
          </Link>
        </nav>
      </div>
    </header>
  );
}
