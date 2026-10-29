// Site-wide settings. Rename the site here.
export const SITE_NAME = "Skinsight";
export const SITE_TAGLINE = "Paste an ingredient list. Get the real story.";
export const SITE_DESCRIPTION =
  "Free skincare ingredient checker for India. Paste any product's ingredient list to see what each ingredient does, which ones clash, how it suits your skin type, and cheaper alternatives.";

export function siteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatInr = (rupees: number) => inr.format(rupees);

/** Max characters accepted from the paste box. */
export const MAX_INPUT_LENGTH = 6000;
