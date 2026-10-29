"use server";

import { redirect } from "next/navigation";
import { getIngredients } from "@/lib/data";
import { prisma } from "@/lib/db";
import { buildIndex, parseIngredientList } from "@/lib/parse";
import { MAX_INPUT_LENGTH } from "@/lib/site";

export type AnalyzeState = { error?: string };

export async function analyzeIngredients(_prev: AnalyzeState, formData: FormData): Promise<AnalyzeState> {
  const text = String(formData.get("ingredients") ?? "").trim();

  if (!text) return { error: "Paste an ingredient list first." };
  if (text.length > MAX_INPUT_LENGTH) {
    return { error: `That's a bit long. Please keep it under ${MAX_INPUT_LENGTH.toLocaleString("en-IN")} characters.` };
  }

  const parsed = parseIngredientList(text, buildIndex(await getIngredients()));
  if (!parsed.length) return { error: "We couldn't find any ingredients in that. Try separating them with commas." };

  const result = await prisma.analysisResult.create({ data: { inputText: text, parsed } });
  redirect(`/result/${result.id}`);
}
