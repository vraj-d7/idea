import { matchesRef } from "./analyze";
import {
  RATING_LABEL,
  SKIN_TYPES,
  SKIN_TYPE_LABEL,
  type ConflictRuleData,
  type Faq,
  type IngredientData,
} from "./types";

const FIT_OPENER = { 1: "Usually, yes.", 0: "It can be.", [-1]: "Be a bit careful." } as const;

/** Describe a rule side in words: "retinol" -> "Retinol", "group:aha" -> "AHAs (glycolic, ...)". */
function describeRef(ref: string, all: IngredientData[]): string {
  if (!ref.startsWith("group:")) return all.find((i) => i.slug === ref)?.name ?? ref;
  const group = ref.slice(6);
  const members = all.filter((i) => i.groups.includes(group)).map((i) => i.name);
  const label = GROUP_LABEL[group] ?? group;
  return members.length ? `${label} (${members.join(", ")})` : label;
}

const GROUP_LABEL: Record<string, string> = {
  retinoid: "retinoids",
  aha: "AHAs",
  bha: "BHAs",
  "exfoliating-acid": "exfoliating acids",
  "vitamin-c-acid": "pure vitamin C",
  "benzoyl-peroxide": "benzoyl peroxide",
  "copper-peptide": "copper peptides",
};

/**
 * Hand-written FAQs from the JSON first, then questions generated from the
 * ingredient's rating, skin-type notes and conflict rules. Adding an
 * ingredient to the seed file gives it a full FAQ section for free.
 */
export function buildFaqs(ing: IngredientData, rules: ConflictRuleData[], all: IngredientData[]): Faq[] {
  const faqs: Faq[] = [...ing.faqs];

  const safety: Record<IngredientData["rating"], string> = {
    good: `${ing.name} is rated "${RATING_LABEL.good}". It's well tolerated by most skin types. As with anything new, patch-test if your skin is reactive.`,
    care: `${ing.name} is rated "${RATING_LABEL.care}". It can work well, but it's more likely to cause dryness or irritation, so introduce it slowly and patch-test first.`,
    irritant: `${ing.name} is rated "${RATING_LABEL.irritant}". Many people use it without problems, but it's a more common cause of irritation, especially for sensitive skin.`,
  };
  faqs.push({ q: `Is ${ing.name} safe for skin?`, a: safety[ing.rating] });

  for (const type of SKIN_TYPES) {
    const note = ing.skinTypes[type];
    if (!note) continue;
    faqs.push({
      q: `Is ${ing.name} good for ${SKIN_TYPE_LABEL[type].toLowerCase()} skin?`,
      a: `${FIT_OPENER[note.fit]} ${note.note}`,
    });
  }

  for (const rule of rules) {
    const inA = matchesRef(ing, rule.ingredientA);
    const inB = matchesRef(ing, rule.ingredientB);
    if (!inA && !inB) continue;
    const other = inA ? rule.ingredientB : rule.ingredientA;
    const sameFamily = rule.ingredientA === rule.ingredientB && other.startsWith("group:");
    const otherName = sameFamily
      ? `other ${GROUP_LABEL[other.slice(6)] ?? other.slice(6)}`
      : describeRef(other, all);
    faqs.push({ q: `Can I use ${ing.name} with ${otherName}?`, a: rule.explanation });
  }

  // Drop duplicate questions (a hand-written one wins).
  const seen = new Set<string>();
  return faqs.filter((f) => {
    const key = f.q.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
