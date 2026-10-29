import Link from "next/link";
import { formatInr } from "@/lib/site";
import type { ProductData } from "@/lib/types";
import { AffiliateButton } from "./AffiliateButton";

export function ProductCard({
  product,
  shared,
  compareWith,
}: {
  product: ProductData;
  /** Key ingredients it shares with what you're looking at */
  shared?: string[];
  /** Show a "Compare" link against this product slug */
  compareWith?: string;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-line bg-shell p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">{product.brand}</p>
          <h3 className="mt-0.5 font-semibold text-ink">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
        </div>
        <p className="shrink-0 rounded-full bg-blush px-3 py-1 text-sm font-bold text-ink">
          {formatInr(product.priceInr)}
        </p>
      </div>
      {shared && shared.length > 0 && (
        <p className="text-sm text-muted">
          Also has: <span className="font-medium text-ink">{shared.join(", ")}</span>
        </p>
      )}
      {product.placeholder && (
        <p className="text-xs text-muted italic">Sample listing. Placeholder data.</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <AffiliateButton href={product.affiliateUrl} productName={product.name} />
        {compareWith && (
          <Link
            href={`/compare?a=${compareWith}&b=${product.slug}`}
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-berry hover:bg-blush"
          >
            Compare
          </Link>
        )}
      </div>
    </article>
  );
}
