export type Rating = "good" | "care" | "irritant";
export type SkinType = "oily" | "dry" | "sensitive" | "acne";
export type Severity = "high" | "medium" | "low";
/** -1 = be careful, 0 = neutral, 1 = good fit */
export type Fit = -1 | 0 | 1;

export const SKIN_TYPES: SkinType[] = ["oily", "dry", "sensitive", "acne"];

export const SKIN_TYPE_LABEL: Record<SkinType, string> = {
  oily: "Oily",
  dry: "Dry",
  sensitive: "Sensitive",
  acne: "Acne-prone",
};

export const RATING_LABEL: Record<Rating, string> = {
  good: "Good for most",
  care: "Use with care",
  irritant: "Potential irritant",
};

export type SkinTypeNote = { fit: Fit; note: string };
export type Faq = { q: string; a: string };

export type IngredientData = {
  slug: string;
  name: string;
  aliases: string[];
  functions: string[];
  groups: string[];
  description: string;
  rating: Rating;
  skinTypes: Partial<Record<SkinType, SkinTypeNote>>;
  faqs: Faq[];
};

export type ConflictRuleData = {
  ingredientA: string;
  ingredientB: string;
  severity: Severity;
  explanation: string;
};

export type ProductData = {
  slug: string;
  name: string;
  brand: string;
  priceInr: number;
  ingredients: string[];
  keyIngredients: string[];
  affiliateUrl: string;
  imageUrl: string | null;
  placeholder: boolean;
};

/** One entry of the pasted list after parsing. `slug` is null when unmatched. */
export type ParsedIngredient = { raw: string; slug: string | null };
