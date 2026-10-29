// Loads the seed JSON the same way the seed script does, for unit tests.
import ingredientsJson from "../../prisma/data/ingredients.json";
import conflictsJson from "../../prisma/data/conflicts.json";
import productsJson from "../../prisma/data/products.json";
import type { ConflictRuleData, IngredientData, ProductData } from "./types";

export const ingredients = (ingredientsJson as Partial<IngredientData>[]).map(
  (i) =>
    ({
      aliases: [],
      functions: [],
      groups: [],
      skinTypes: {},
      faqs: [],
      ...i,
    }) as IngredientData,
);

export const rules: ConflictRuleData[] = conflictsJson.map((c) => ({
  ingredientA: c.a,
  ingredientB: c.b,
  severity: c.severity as ConflictRuleData["severity"],
  explanation: c.explanation,
}));

export const products: ProductData[] = productsJson.map((p) => ({
  imageUrl: null,
  ...p,
}));
