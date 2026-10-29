import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "./db";
import type {
  ConflictRuleData,
  IngredientData,
  ProductData,
  Rating,
  Severity,
} from "./types";

// Catalog data only changes when you re-seed, so it's cached for days.
// Saved analysis results are read uncached (see getAnalysis).

type IngredientRow = Awaited<ReturnType<typeof prisma.ingredient.findMany>>[number];
type ProductRow = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

function toIngredient(r: IngredientRow): IngredientData {
  return {
    slug: r.slug,
    name: r.name,
    aliases: r.aliases as string[],
    functions: r.functions as string[],
    groups: r.groups as string[],
    description: r.description,
    rating: r.rating as Rating,
    skinTypes: r.skinTypes as IngredientData["skinTypes"],
    faqs: r.faqs as IngredientData["faqs"],
  };
}

function toProduct(r: ProductRow): ProductData {
  return {
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    category: r.category,
    priceInr: r.priceInr,
    ingredients: r.ingredients as string[],
    keyIngredients: r.keyIngredients as string[],
    affiliateUrl: r.affiliateUrl,
    imageUrl: r.imageUrl,
    placeholder: r.placeholder,
  };
}

export async function getIngredients(): Promise<IngredientData[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  const rows = await prisma.ingredient.findMany({ orderBy: { name: "asc" } });
  return rows.map(toIngredient);
}

export async function getIngredient(slug: string): Promise<IngredientData | null> {
  const all = await getIngredients();
  return all.find((i) => i.slug === slug) ?? null;
}

export async function getConflictRules(): Promise<ConflictRuleData[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  const rows = await prisma.conflictRule.findMany();
  return rows.map((r) => ({
    ingredientA: r.ingredientA,
    ingredientB: r.ingredientB,
    severity: r.severity as Severity,
    explanation: r.explanation,
  }));
}

export async function getProducts(): Promise<ProductData[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  const rows = await prisma.product.findMany({ orderBy: { priceInr: "asc" } });
  return rows.map(toProduct);
}

export async function getProduct(slug: string): Promise<ProductData | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getAnalysis(id: string) {
  return prisma.analysisResult.findUnique({ where: { id } });
}
