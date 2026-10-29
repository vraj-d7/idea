import { RATING_LABEL, type Rating } from "@/lib/types";

const styles: Record<Rating, string> = {
  good: "bg-good-bg text-good",
  care: "bg-care-bg text-care",
  irritant: "bg-bad-bg text-bad",
};

const icons: Record<Rating, string> = { good: "✓", care: "!", irritant: "✕" };

export function RatingBadge({ rating }: { rating: Rating }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[rating]}`}
    >
      <span aria-hidden>{icons[rating]}</span>
      {RATING_LABEL[rating]}
    </span>
  );
}
