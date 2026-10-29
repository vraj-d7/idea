import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-4xl" aria-hidden>
        🫧
      </p>
      <h1 className="font-display text-3xl font-bold text-ink">We couldn&apos;t find that page</h1>
      <p className="text-muted">It may have moved, or the link might be mistyped.</p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-full bg-berry px-6 font-semibold text-white hover:bg-berry-dark"
      >
        Check an ingredient list
      </Link>
    </div>
  );
}
