/**
 * Outbound affiliate link. If AFFILIATE_TAG_PARAM and AFFILIATE_TAG_VALUE are
 * set, the tag is added to the URL, e.g. ?tag=yourstore-21 for Amazon.
 */
export function withAffiliateTag(url: string): string {
  const param = process.env.AFFILIATE_TAG_PARAM;
  const value = process.env.AFFILIATE_TAG_VALUE;
  if (!param || !value) return url;
  try {
    const u = new URL(url);
    u.searchParams.set(param, value);
    return u.toString();
  } catch {
    return url;
  }
}

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
