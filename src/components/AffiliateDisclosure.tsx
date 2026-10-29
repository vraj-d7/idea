import Link from "next/link";

/** Put this next to every group of affiliate links. */
export function AffiliateDisclosure() {
  return (
    <p className="text-xs text-muted">
      <span aria-hidden>ⓘ </span>
      Affiliate links: we may earn a small commission if you buy, at no extra cost to you. It never changes our
      ratings.{" "}
      <Link href="/disclaimer#affiliates" className="underline underline-offset-2 hover:text-ink">
        Learn more
      </Link>
    </p>
  );
}
