import type { IngredientData, ParsedIngredient } from "./types";

/**
 * Split a pasted ingredient list into individual label entries.
 * Splits on commas, semicolons, bullets and new lines, but keeps commas
 * between digits ("1,2-Hexanediol") intact.
 */
export function splitIngredients(text: string): string[] {
  const body = text
    // Drop a leading "Ingredients:" / "Full ingredients list -" label.
    .replace(/^\s*(full\s+)?ingredients?(\s+list)?\s*[:\-–]\s*/i, "")
    // "May contain (+/-): CI 77891, ..." is still a list of ingredients.
    .replace(/(\bmay contain|\+\/-)\s*:?/gi, ",");

  return body
    // Blends are written "Phenoxyethanol (and) Ethylhexylglycerin" or
    // "Allantoin and Sodium Gluconate": treat each part as its own ingredient.
    .split(/(?<!\d),|,(?!\d)|;|\n|\r|•|·|\||\s*\(and\)\s*|\s+and\s+(?=[A-Z])/)
    .map((s) => s.trim().replace(/^[\s.*\-–]+|[\s.*]+$/g, ""))
    .filter((s) => s.length > 0);
}

/** Lowercase, tidy whitespace and punctuation. Keeps parentheses. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[‐-―]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/\[[^\]]*\]/g, " ") // "[nano]"
    .replace(/\b\d+(\.\d+)?\s*%/g, " ") // "10%"
    .replace(/\*+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[\s.]+$/, "")
    .trim();
}

/**
 * The spellings worth trying for one label entry, most specific first.
 * "Butyrospermum Parkii (Shea) Butter" -> ["butyrospermum parkii (shea) butter",
 * "butyrospermum parkii butter", "shea", ...]. "Aqua/Water" -> also "aqua", "water".
 */
export function candidates(raw: string): string[] {
  const n = normalize(raw);
  const out = [n];
  const noParens = n.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  out.push(noParens);
  for (const m of n.matchAll(/\(([^)]*)\)/g)) out.push(m[1].trim());
  for (const c of [n, noParens]) {
    if (c.includes("/")) out.push(...c.split("/").map((p) => p.trim()));
  }
  return [...new Set(out.filter(Boolean))];
}

/** Classic edit distance, with an early exit once it passes `max`. */
export function levenshtein(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** How many typos we forgive, by word length. Short names must match exactly. */
function allowedDistance(len: number): number {
  if (len < 5) return 0;
  if (len < 9) return 1;
  if (len < 16) return 2;
  return 3;
}

export type IngredientIndex = Map<string, string>;

/** Map every normalized name, alias and slug to its ingredient slug. */
export function buildIndex(ingredients: Pick<IngredientData, "slug" | "name" | "aliases">[]): IngredientIndex {
  const index: IngredientIndex = new Map();
  for (const ing of ingredients) {
    const names = [ing.name, ing.slug.replace(/-/g, " "), ...ing.aliases];
    for (const name of names) {
      for (const c of candidates(name)) {
        if (!index.has(c)) index.set(c, ing.slug);
      }
    }
  }
  return index;
}

const digitsOf = (s: string) => (s.match(/\d+/g) ?? []).join(",");

/**
 * Typos keep the start of a word and its numbers. Different chemicals with
 * similar names often don't: Dipropylene vs Propylene Glycol, Diethanolamine
 * vs Triethanolamine, Benzophenone-4 vs Benzophenone-3.
 */
function plausibleTypo(a: string, b: string): boolean {
  return a.slice(0, 3) === b.slice(0, 3) && digitsOf(a) === digitsOf(b);
}

/** Find the ingredient slug for one label entry, or null. */
export function matchIngredient(raw: string, index: IngredientIndex): string | null {
  const cands = candidates(raw);

  for (const c of cands) {
    const hit = index.get(c);
    if (hit) return hit;
  }

  // Fuzzy: closest known spelling within the allowed number of typos.
  let best: { slug: string; dist: number } | null = null;
  for (const c of cands) {
    const max = allowedDistance(c.length);
    if (max === 0) continue;
    for (const [key, slug] of index) {
      if (allowedDistance(key.length) === 0 || !plausibleTypo(c, key)) continue;
      const d = levenshtein(c, key, max);
      if (d <= max && (!best || d < best.dist)) best = { slug, dist: d };
    }
  }
  return best?.slug ?? null;
}

export function parseIngredientList(text: string, index: IngredientIndex): ParsedIngredient[] {
  return splitIngredients(text).map((raw) => ({ raw, slug: matchIngredient(raw, index) }));
}
