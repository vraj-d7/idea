import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_NAME} explains skincare ingredient lists in plain language, for India.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="space-y-6 leading-relaxed text-ink/90">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">About {SITE_NAME}</h1>
      <p className="text-lg">
        Skincare labels are written for chemists, not for us. {SITE_NAME} turns an ingredient list into plain words, so
        you can see what you&apos;re putting on your face before you spend money on it.
      </p>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-ink">What we do</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Explain what each ingredient is there for, from actives to preservatives.</li>
          <li>Flag ingredient pairs that tend to irritate when used together.</li>
          <li>Give a rough read on how a formula suits oily, dry, sensitive and acne-prone skin.</li>
          <li>Point you to cheaper products with similar key ingredients.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-ink">How the ratings work</h2>
        <p>
          Every ingredient gets one of three labels. <strong>Good for most</strong> means it&apos;s well tolerated by
          most people. <strong>Use with care</strong> means it can work well but is more likely to cause dryness or
          irritation, so go slowly. <strong>Potential irritant</strong> means it&apos;s a more common cause of reactions,
          even though many people use it without problems.
        </p>
        <p>
          Skin-type fit weighs ingredients by where they sit on the label: ingredients near the top are usually present
          in larger amounts. Labels don&apos;t show exact percentages, so treat the results as a guide, not a verdict.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-ink">What we&apos;re not</h2>
        <p>
          We&apos;re not doctors, and nothing here is medical advice. We don&apos;t diagnose or treat skin conditions.
          Read the{" "}
          <Link href="/disclaimer" className="font-semibold text-berry underline underline-offset-2">
            disclaimer
          </Link>{" "}
          for details, including how affiliate links work.
        </p>
      </section>
    </article>
  );
}
