import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const links = [
  { href: "/ingredient", label: "All ingredients" },
  { href: "/product", label: "Products" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
  { href: "/disclaimer", label: "Disclaimer & affiliates" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-shell">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm text-muted sm:px-6">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="underline-offset-4 hover:text-ink hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>
          {SITE_NAME} shares general skincare information, not medical advice. Some links are affiliate links,
          which means we may earn a small commission at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}
