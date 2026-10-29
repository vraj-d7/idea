import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer & Affiliate Disclosure",
  description: `Medical disclaimer and affiliate disclosure for ${SITE_NAME}.`,
  alternates: { canonical: "/disclaimer" },
};

// Starting-point wording. Have it reviewed before launch.
export default function DisclaimerPage() {
  return (
    <article className="space-y-8 leading-relaxed text-ink/90">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Disclaimer &amp; affiliate disclosure</h1>

      <section aria-labelledby="medical" className="space-y-2">
        <h2 id="medical" className="font-display text-xl font-bold text-ink">
          General information, not medical advice
        </h2>
        <p>
          Everything on {SITE_NAME}, including ingredient descriptions, ratings, clash warnings and skin-type fit, is
          general information for educational purposes. It is not medical advice and is not a substitute for advice
          from a dermatologist or other qualified health professional.
        </p>
        <p>
          We don&apos;t diagnose, treat or cure any condition, and we don&apos;t claim that any product or ingredient
          will. Results depend on the full formula, concentrations we can&apos;t see on a label, and your own skin.
        </p>
        <p>
          Always patch-test new products. Stop using a product and seek professional advice if you notice a reaction. If
          you are pregnant, breastfeeding, on prescription skincare or medication, or have a skin condition, check with
          a doctor before trying new active ingredients.
        </p>
      </section>

      <section aria-labelledby="accuracy" className="space-y-2">
        <h2 id="accuracy" className="font-display text-xl font-bold text-ink">
          Accuracy
        </h2>
        <p>
          We work to keep our ingredient information accurate and up to date, but we can&apos;t guarantee it is
          complete or error-free. Ingredient matching is automatic and can occasionally get a name wrong. Brands change
          formulas, so always check the label on the product you buy.
        </p>
      </section>

      <section aria-labelledby="affiliates" className="scroll-mt-4 space-y-2">
        <h2 id="affiliates" className="font-display text-xl font-bold text-ink">
          Affiliate disclosure
        </h2>
        <p>
          Some links on {SITE_NAME} are affiliate links. If you buy through them, we may earn a small commission from
          the retailer at no extra cost to you. This helps keep the site free.
        </p>
        <p>
          Commissions never affect ingredient ratings, clash warnings or skin-type fit, which are worked out the same way
          for every product. &ldquo;Cheaper alternatives&rdquo; are picked by shared key ingredients and price, not by
          commission.
        </p>
        <p>We may also show display ads. Ads are labelled and are separate from our content.</p>
      </section>
    </article>
  );
}
