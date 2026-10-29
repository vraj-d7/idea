import { withAffiliateTag } from "@/lib/affiliate";

/** Outbound affiliate link. Put an <AffiliateDisclosure /> near it. */
export function AffiliateButton({
  href,
  productName,
  label = "Check price",
}: {
  href: string;
  productName: string;
  label?: string;
}) {
  return (
    <a
      href={withAffiliateTag(href)}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      aria-label={`${label} for ${productName} (affiliate link, opens in a new tab)`}
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-berry-dark"
    >
      {label}
      <span aria-hidden>↗</span>
    </a>
  );
}
