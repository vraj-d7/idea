import Link from "next/link";

/** Shown on every result page, and on ingredient and product pages. */
export function Disclaimer() {
  return (
    <aside
      aria-label="Disclaimer"
      className="rounded-2xl border border-line bg-shell px-4 py-3 text-sm leading-relaxed text-muted"
    >
      <strong className="font-semibold text-ink">General information only, not medical advice.</strong> Everyone&apos;s
      skin is different. Patch-test new products, and see a dermatologist for persistent skin concerns.{" "}
      <Link href="/disclaimer" className="underline underline-offset-2 hover:text-ink">
        Read the full disclaimer
      </Link>
      .
    </aside>
  );
}
