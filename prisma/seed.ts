// Loads prisma/data/*.json into the database. Safe to re-run: it replaces
// ingredients, rules and products, and leaves saved analysis results alone.
//   npm run db:seed
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dataDir = join(__dirname, "data");
const load = (file: string) => JSON.parse(readFileSync(join(dataDir, file), "utf8"));

type RawIngredient = {
  slug: string;
  name: string;
  aliases?: string[];
  functions?: string[];
  groups?: string[];
  description: string;
  rating: "good" | "care" | "irritant";
  skinTypes?: Record<string, { fit: number; note: string }>;
  faqs?: { q: string; a: string }[];
};
type RawConflict = { a: string; b: string; severity: string; explanation: string };
type RawProduct = {
  slug: string;
  name: string;
  brand: string;
  category?: string;
  priceInr: number;
  ingredients: string[];
  keyIngredients: string[];
  affiliateUrl: string;
  imageUrl?: string;
  placeholder?: boolean;
};

function validate(ingredients: RawIngredient[], conflicts: RawConflict[], products: RawProduct[]) {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const groups = new Set<string>();
  for (const i of ingredients) {
    if (slugs.has(i.slug)) errors.push(`Duplicate ingredient slug: ${i.slug}`);
    slugs.add(i.slug);
    if (!["good", "care", "irritant"].includes(i.rating)) errors.push(`${i.slug}: bad rating "${i.rating}"`);
    for (const g of i.groups ?? []) groups.add(g);
  }
  const ref = (r: string) => (r.startsWith("group:") ? groups.has(r.slice(6)) : slugs.has(r));
  for (const c of conflicts) {
    for (const r of [c.a, c.b]) if (!ref(r)) errors.push(`Conflict rule refers to unknown "${r}"`);
    if (!["high", "medium", "low"].includes(c.severity)) errors.push(`Conflict ${c.a}+${c.b}: bad severity`);
  }
  for (const p of products) {
    for (const k of p.keyIngredients) if (!slugs.has(k)) errors.push(`${p.slug}: unknown key ingredient "${k}"`);
  }
  if (errors.length) {
    throw new Error("Seed data has problems:\n  " + errors.join("\n  "));
  }
}

async function main() {
  const ingredients: RawIngredient[] = load("ingredients.json");
  const conflicts: RawConflict[] = load("conflicts.json");
  const products: RawProduct[] = load("products.json");
  validate(ingredients, conflicts, products);

  await prisma.$transaction([
    prisma.ingredient.deleteMany(),
    prisma.conflictRule.deleteMany(),
    prisma.product.deleteMany(),
    prisma.ingredient.createMany({
      data: ingredients.map((i) => ({
        slug: i.slug,
        name: i.name,
        aliases: i.aliases ?? [],
        functions: i.functions ?? [],
        groups: i.groups ?? [],
        description: i.description,
        rating: i.rating,
        skinTypes: i.skinTypes ?? {},
        faqs: i.faqs ?? [],
      })),
    }),
    prisma.conflictRule.createMany({
      data: conflicts.map((c) => ({
        ingredientA: c.a,
        ingredientB: c.b,
        severity: c.severity,
        explanation: c.explanation,
      })),
    }),
    prisma.product.createMany({
      data: products.map((p) => ({
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category ?? null,
        priceInr: p.priceInr,
        ingredients: p.ingredients,
        keyIngredients: p.keyIngredients,
        affiliateUrl: p.affiliateUrl,
        imageUrl: p.imageUrl ?? null,
        placeholder: p.placeholder ?? true,
      })),
    }),
  ]);

  console.log(
    `Seeded ${ingredients.length} ingredients, ${conflicts.length} conflict rules, ${products.length} products.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
