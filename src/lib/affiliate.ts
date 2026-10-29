/**
 * Add the affiliate tag from env to an outbound URL. With
 * AFFILIATE_TAG_PARAM="tag" and AFFILIATE_TAG_VALUE="yourstore-21",
 * https://www.amazon.in/dp/X becomes https://www.amazon.in/dp/X?tag=yourstore-21.
 */
export function withAffiliateTag(
  url: string,
  param = process.env.AFFILIATE_TAG_PARAM,
  value = process.env.AFFILIATE_TAG_VALUE,
): string {
  if (!param || !value) return url;
  try {
    const u = new URL(url);
    u.searchParams.set(param, value);
    return u.toString();
  } catch {
    return url;
  }
}
