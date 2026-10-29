# Skinsight: skincare ingredient checker (India)

Paste a skincare product's ingredient list and get:

- a plain-language **breakdown** of every ingredient, rated _Good for most_, _Use with care_ or _Potential irritant_
- **clash warnings** for pairs that work against each other (retinoids + acids, vitamin C + benzoyl peroxide, …)
- a **skin-type fit** for oily, dry, sensitive and acne-prone skin
- **cheaper alternatives** from the product catalog, with affiliate links

Results are saved and shareable by URL. Every ingredient and product has its own statically generated, SEO-ready page.

> "Skinsight" is a placeholder name. Change it in `src/lib/site.ts`.

## Tech

- Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind CSS 4
- Prisma 6 with SQLite for local dev (Postgres-ready)
- Vitest for unit tests

## Setup

Requires Node 20+.

```bash
npm install
cp .env.example .env        # then edit if needed
npm run db:push             # create the SQLite database from the schema
npm run db:seed             # load prisma/data/*.json
npm run dev                 # http://localhost:3000
```

Other scripts:

| Command             | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `npm test`          | Run unit tests (parser, conflict detection, alternatives, FAQs)   |
| `npm run typecheck` | Generate route types and run TypeScript                            |
| `npm run lint`      | ESLint                                                             |
| `npm run build`     | Syncs the DB schema, re-seeds, then builds (pages are prerendered) |
| `npm run db:reset`  | Wipe the database (including saved results) and re-seed            |

## Environment variables

| Variable                     | Purpose                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`               | `file:./dev.db` for SQLite, or a Postgres URL in production                                   |
| `NEXT_PUBLIC_SITE_URL`       | Your live URL, e.g. `https://example.in`. Used in the sitemap, canonical links and robots.txt |
| `AFFILIATE_TAG_PARAM`        | Query param name for your affiliate tag, e.g. `tag` for Amazon Associates                     |
| `AFFILIATE_TAG_VALUE`        | Your tag, e.g. `yourstore-21`. Added to every outbound product link when both are set         |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher ID (`ca-pub-…`). Empty = dashed placeholder boxes in dev, nothing in prod   |

## Adding ingredients, rules and products

All catalog data lives in `prisma/data/`. Edit the JSON, then run `npm run db:seed`. The seed script checks the data first and stops with a clear error if, for example, a product points at an ingredient slug that doesn't exist.

**Write all descriptions in your own words.** Don't copy text from INCIDecoder, Nykaa, brand sites or anywhere else.

### `ingredients.json`

```json
{
  "slug": "azelaic-acid",
  "name": "Azelaic Acid",
  "aliases": ["potassium azelaoyl diglycinate"],
  "functions": ["brightening", "calming"],
  "groups": [],
  "description": "Plain-language description, in your own words.",
  "rating": "good",
  "skinTypes": {
    "acne": { "fit": 1, "note": "Helps with bumps and lingering marks." },
    "sensitive": { "fit": 0, "note": "Often fine. Patch-test." }
  },
  "faqs": [{ "q": "Can I use azelaic acid every day?", "a": "…" }]
}
```

- `slug` is the URL (`/ingredient/azelaic-acid`). Don't change it once the page is live.
- `aliases` are other label spellings: INCI names, common names, salts and esters. Matching is case-insensitive, ignores percentages and `[nano]`, tries text with and without parentheses, and forgives small typos. Very short aliases (under 5 letters, like `bha`) must match exactly.
- `rating`: `good`, `care` or `irritant`.
- `skinTypes`: any of `oily`, `dry`, `sensitive` or `acne`, with `fit` set to `1` (good), `0` (neutral) or `-1` (be careful). Leave out a type if there's nothing to say.
- `groups` (optional) are families used by conflict rules and alternatives, e.g. `retinoid`, `aha`, `bha`, `exfoliating-acid`, `vitamin-c`, `vitamin-c-acid` (pure L-ascorbic acid only), `benzoyl-peroxide`, `copper-peptide`.
- `faqs` (optional) are hand-written questions. Each ingredient page also **generates** questions from the rating, the skin-type notes and the conflict rules, so a new ingredient gets a full FAQ section automatically.

### `conflicts.json`

```json
{ "a": "group:retinoid", "b": "group:aha", "severity": "high", "explanation": "One line, plain words." }
```

`a` and `b` are either an ingredient slug (`"alcohol-denat"`) or a group (`"group:aha"`). `severity` is `high`, `medium` or `low`. A rule only fires when the two sides are different ingredients, so `group:retinoid` + `group:retinoid` means "two different retinoids".

### `products.json`

```json
{
  "slug": "brand-product-name",
  "name": "Product Name",
  "brand": "Brand",
  "category": "serum",
  "priceInr": 499,
  "ingredients": ["Aqua", "Niacinamide", "…in label order…"],
  "keyIngredients": ["niacinamide"],
  "affiliateUrl": "https://www.amazon.in/dp/XXXXXXXX",
  "imageUrl": null,
  "placeholder": false
}
```

- `ingredients` is the label as printed, in order. Copy it from the brand's official product page or the pack, not from a reseller. `keyIngredients` are ingredient slugs and drive "cheaper alternatives".
- `category` (`serum`, `moisturiser`, `cleanser`, `sunscreen`, …) keeps alternatives like-for-like, so a face wash is never suggested in place of a serum.
- `priceInr` is the MRP for the size in the product name. Prices change, so re-check them now and then.
- `affiliateUrl` currently points at each brand's own product page. Swap in your affiliate links (Amazon Associates, Nykaa, Cuelinks, …) as you join programs. `AFFILIATE_TAG_*` only helps for stores that use a URL tag, like Amazon.
- Set `"placeholder": true` for any made-up test product. Placeholder products are `noindex` and left out of the sitemap.

**Current catalog:** 14 real products from Minimalist, The Derma Co, Deconstruct, Plum and Re'equil. Ingredient lists and MRPs were taken from each brand's official product page on 29 Oct 2026. Obvious typos on those pages were fixed ("Cholestrol" → "Cholesterol", "Ethylexanoate" → "Ethylhexanoate"), and "(and)" blends were split into separate ingredients. A unit test checks that every catalog label parses with fewer than half its ingredients unidentified, and that each product's key ingredients are recognised.

## How it works

```
src/
  app/
    page.tsx                 Home: paste box + examples
    actions.ts               Server action: parse, save AnalysisResult, redirect
    result/[id]/             Shareable result (noindex)
    ingredient/, ingredient/[slug]/   A–Z index + one SEO page per ingredient
    product/, product/[slug]/         Catalog + product breakdown and alternatives
    compare/                 Two products side by side (?a=slug&b=slug)
    about/, disclaimer/      Static pages (#affiliates anchor for disclosure)
    sitemap.ts, robots.ts
  components/                AffiliateButton, AffiliateDisclosure, AdSlot, Disclaimer, analysis UI …
  lib/
    parse.ts                 Split, normalize, exact + fuzzy matching
    analyze.ts               Breakdown, conflicts, skin-type fit, alternatives
    faqs.ts                  Generated FAQ questions
    data.ts                  Cached Prisma reads ("use cache")
    affiliate.ts             Adds the affiliate tag to URLs
prisma/
  schema.prisma, seed.ts, data/*.json
```

- **Saved results store the pasted text and the matched slugs, not the analysis.** The analysis is recomputed on view, so improving the data also improves old shared links.
- **Skin-type fit** adds up each identified ingredient's `fit` for that skin type. Ingredients in positions 1–5 count fully, 6–10 at 70% and the rest at 40%. A total of −0.5 or lower is "Be careful". A total of +1 or higher with no negatives is "Good fit".
- **Alternatives** rank catalog products by how many of their key ingredients match yours (same ingredient or same family), then by price. If a pasted list matches a catalog product's label, that product is excluded and only cheaper ones are shown.
- **Catalog pages are prerendered at build** and cached for a day (`cacheLife("days")`). After re-seeding in production, rebuild or revalidate the `catalog` cache tag.
- With Cache Components, an unknown `/ingredient/...` or `/product/...` URL serves the not-found page with `noindex`, but the HTTP status is 200 in production.

## Moving to Postgres / Supabase

1. In `prisma/schema.prisma`, set `provider = "postgresql"`.
2. Set `DATABASE_URL` to your Postgres connection string (for Supabase, use the pooled connection string for the app).
3. Run `npm run db:push && npm run db:seed`.

All list fields are `Json` columns, so there's nothing else to migrate. For a production workflow, switch from `db push` to `prisma migrate`.

## Content and legal

- Every result, ingredient and product page shows the "general information, not medical advice" disclaimer.
- Don't make medical claims like "cures acne" or "treats eczema". Describe what an ingredient does, not what it cures.
- Every group of affiliate links has a disclosure line next to it, and affiliate links use `rel="sponsored nofollow"`.
- The disclaimer page wording is a starting point. Have it reviewed before launch.
