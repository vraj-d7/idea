"use client";

import { useActionState, useRef, useState } from "react";
import { analyzeIngredients, type AnalyzeState } from "@/app/actions";
import { MAX_INPUT_LENGTH } from "@/lib/site";

export type Example = { label: string; brand: string; ingredients: string };

export function AnalyzeForm({ examples }: { examples: Example[] }) {
  const [state, formAction, pending] = useActionState<AnalyzeState, FormData>(analyzeIngredients, {});
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-3xl border border-line bg-shell p-2 shadow-[0_8px_30px_-12px_rgba(168,50,90,0.25)] transition-shadow has-[textarea:focus]:border-berry has-[textarea:focus]:ring-4 has-[textarea:focus]:ring-berry/15">
        <label htmlFor="ingredients" className="block px-3 pt-2 text-sm font-semibold text-ink">
          Paste the ingredient list here
        </label>
        <textarea
          ref={textareaRef}
          id="ingredients"
          name="ingredients"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          maxLength={MAX_INPUT_LENGTH}
          placeholder="Aqua, Niacinamide, Glycerin, Zinc PCA, Sodium Hyaluronate, Phenoxyethanol…"
          aria-describedby="ingredients-help ingredients-error"
          className="block w-full resize-y rounded-2xl bg-transparent px-3 py-2 text-base leading-relaxed text-ink placeholder:text-muted/70 focus:outline-none focus-visible:outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1">
          <p id="ingredients-help" className="text-xs text-muted">
            Copy it from the back of the pack or the product page.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-berry px-6 text-base font-semibold text-white transition-colors hover:bg-berry-dark disabled:opacity-70 sm:w-auto"
          >
            {pending ? "Checking…" : "Check ingredients"}
          </button>
        </div>
      </div>

      <p id="ingredients-error" role="alert" aria-live="polite" className="min-h-5 text-sm font-medium text-bad">
        {state.error}
      </p>

      {examples.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Or try an example:</p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {examples.map((ex) => (
              <li key={ex.label}>
                <button
                  type="button"
                  onClick={() => {
                    setText(ex.ingredients);
                    textareaRef.current?.focus();
                  }}
                  className="h-full w-full rounded-2xl border border-line bg-shell px-4 py-3 text-left transition-colors hover:border-berry hover:bg-blush"
                >
                  <span className="block text-xs text-muted">{ex.brand}</span>
                  <span className="block text-sm font-semibold text-ink">{ex.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
