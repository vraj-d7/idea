import type { MetadataRoute } from "next";
import { getIngredients, getProducts } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ingredients, products] = await Promise.all([getIngredients(), getProducts()]);

  const pages = ["/", "/ingredient", "/product", "/compare", "/about", "/disclaimer"].map((path) => ({
    url: siteUrl(path),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.5,
  }));

  return [
    ...pages,
    ...ingredients.map((i) => ({
      url: siteUrl(`/ingredient/${i.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Placeholder products are noindex, so leave them out.
    ...products
      .filter((p) => !p.placeholder)
      .map((p) => ({ url: siteUrl(`/product/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
