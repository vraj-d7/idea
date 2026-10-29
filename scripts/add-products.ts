// One-off helper: turns raw label text into products.json entries using the
// app's own splitter, so stored labels split exactly like pasted ones.
//   npx tsx scripts/add-products.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { splitIngredients } from "../src/lib/parse";

type NewProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceInr: number;
  label: string;
  keyIngredients: string[];
  affiliateUrl: string;
};

// Labels copied from each brand's official product page, 29 Oct 2026.
const NEW: NewProduct[] = [
  {
    slug: "pilgrim-10-niacinamide-face-serum-zinc-pca",
    name: "10% Niacinamide Face Serum with 1% Zinc PCA (30ml)",
    brand: "Pilgrim",
    category: "serum",
    priceInr: 595,
    label:
      "Purified Water, Niacinamide, Butylene Glycol, Propanediol, Gluconolactone, Glucose, Salicylic Acid, Zinc PCA, Nelumbo Nucifera (White Lotus) Flower Extract, Torreya Nucifera (Yugdugu) Extract, Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin, Betaine, Allantoin, Sodium Benzoate, Potassium Sorbate, Panthenol, Xanthan Gum, Polysorbate-20, Tocopheryl Acetate",
    keyIngredients: ["niacinamide", "zinc-pca"],
    affiliateUrl: "https://discoverpilgrim.com/products/10-niacinamide-face-serum-with-1-zinc-pca",
  },
  {
    slug: "pilgrim-5-niacinamide-hydra-glow-gel-sunscreen-spf-50",
    name: "5% Niacinamide Hydra Glow Gel Sunscreen SPF 50+ (50ml)",
    brand: "Pilgrim",
    category: "sunscreen",
    priceInr: 495,
    label:
      "Aqua, Aqua (and) C12-15 Alkyl Benzoate (and) Diethylamino Hydroxybenzoyl Hexyl Benzoate (and) Ethylhexyl Triazone (and) Propanediol (and) Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine (and) Phospholipid (and) Ethylhexylglycerin (and) Hydroxyacetophenone, Niacinamide, Glycerine, Tapioca Starch (and) Polymethylsilsesquioxane, Isododecane, Caprylic/Capric Triglyceride, Propylene Glycol, Cyclopentasiloxane, Dicaprylyl Carbonate, C12-15 Alkyl Benzoate, Cetearyl Olivate (and) Sorbitan Olivate, Cetearyl Alcohol (and) Ceteareth-20, Ammonium Acryloyldimethyltaurate/VP Copolymer, Phenoxyethanol (and) Ethylhexylglycerin, Dimethicone, Glyceryl Stearate, Sodium Polyacrylate, Glycyrrhiza Glabra (Licorice) Root Extract, Allantoin, Sodium Gluconate, Saccharomyces/Rice Ferment Filtrate, Panthenol, Tocopheryl Acetate, Centella Asiatica (Cica) Extract, Camellia Sinensis (White Tea) Extract, Sodium Hyaluronate, Water (Aqua) (and) Glycerin (and) Alcohol (and) Achyrocline Satureiodes Flower Extract (and) Plantago Lanceolata Leaf Extract (and) Sodium PCA (and) Fabiana Imbricata Leaf/Stem Extract (and) Verbascum Thapsus Extract",
    keyIngredients: ["uvinul-a-plus", "ethylhexyl-triazone", "bemotrizinol", "niacinamide"],
    affiliateUrl: "https://discoverpilgrim.com/products/5-niacinamide-hydra-glow-gel-sunscreen-spf-50-pa",
  },
  {
    slug: "pilgrim-3-aha-bha-pha-detan-gel-face-wash",
    name: "3% AHA + BHA + PHA Detan Gel Face Wash (150ml)",
    brand: "Pilgrim",
    category: "cleanser",
    priceInr: 399,
    label:
      "Aqua, Sodium C14-16 Olefin Sulfonate, Cocamidopropyl Betaine, Glycerin, Lactic Acid, Decyl Glucoside, Gluconolactone, Sodium Lauryl Sarcosinate, Coco-Glucoside, Nelumbo Nucifera (Lotus) Flower Extract, Salicylic Acid, Sodium Hydroxide, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin, Polysorbate 20, Panthenol, Disodium EDTA, Perfume, CI 16185, CI 16035",
    keyIngredients: ["salicylic-acid", "lactic-acid", "gluconolactone"],
    affiliateUrl: "https://discoverpilgrim.com/products/3-aha-bha-pha-detan-gel-face-wash",
  },
  {
    slug: "foxtale-nourishing-ceramide-moisturizer",
    name: "Nourishing Ceramide Moisturizer (50ml)",
    brand: "Foxtale",
    category: "moisturiser",
    priceInr: 275,
    label:
      "Aqua, Propylene glycol, Caprylic capric triglyceride, C12-15 Alkyl benzoate, Cetearyl olivate, Sorbitan olivate, Cetyl alcohol, Niacinamide, Saccharide isomerate, Betaine, Glycerin, Glyceryl monostearate, Phenoxyethanol, Laminaria Digitata Extract, Cetyl-PG Hydroxyethyl Palmitamide, Ceramide EOP, Ceramide NG, Ceramide NP, Ceramide AS, Ceramide AP, Cholesterol, 1,2-Hexanediol, Lecithin hydrogenated, Garcinia indica seed butter, Sodium PCA, Panthenol, Sodium Hyaluronate, L-Proline, Hydroxyproline, Dimethicone, Tocopherol, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Ethylhexylglycerin, Octenidine HCl, Carbomer, Disodium EDTA, Citric acid, Sodium citrate, Triethanolamine, Allergen Free Fragrance",
    keyIngredients: ["ceramides", "niacinamide", "cholesterol"],
    affiliateUrl: "https://foxtale.in/products/nourishing-moisturizer-with-ceramides-v2",
  },
  {
    slug: "foxtale-aha-bha-exfoliating-serum",
    name: "AHA BHA Exfoliating Serum (30ml)",
    brand: "Foxtale",
    category: "serum",
    priceInr: 545,
    label:
      "Aqua, Propylene glycol, Propanediol, Dimethyl isosorbide, Salicylic acid, Glycolic acid, Betaine, Sodium citrate, PEG-12 Dimethicone, Niacinamide, Sodium hydroxide, Sodium hyaluronate, D-Panthenol, Phenoxyethanol, Hydroxyethylcellulose, Ethylhexylglycerin",
    keyIngredients: ["salicylic-acid", "glycolic-acid"],
    affiliateUrl: "https://foxtale.in/products/aha-bha-exfoliating-serum-glowbit",
  },
  {
    slug: "dot-key-strawberry-bright-10-niacinamide-serum",
    name: "Strawberry Bright 10% Niacinamide Face Serum (30ml)",
    brand: "Dot & Key",
    category: "serum",
    priceInr: 599,
    label:
      "Aqua, Niacinamide, Propanediol, Phenyl Trimethicone, Isohexadecane, Hamamelis Virginiana (Witch Hazel) Leaf Extract (and) Propylene Glycol (and) Sodium Benzoate (and) Phenoxyethanol (and) Ethylhexylglycerin (and) Sorbitol (and) Aqua, Dimethicone, Fragaria Ananassa (Strawberry) Fruit Extract, Cyanocobalamin, Sodium Hyaluronate, Xylitylglucoside (and) Anhydroxylitol (and) Xylitol, Trehalose, Tocopheryl Acetate, Aqua (and) Phragmites Communis Extract (and) Poria Cocos Extract, Betaine (and) Sodium PCA (and) Sodium Lactate (and) PCA (and) Serine (and) Alanine (and) Glycine (and) Glutamic Acid (and) Lysine HCl (and) Threonine (and) Arginine (and) Proline (and) Water, Allantoin, Cetearyl Olivate (and) Sorbitan Olivate, Polymethyl Methacrylate, Polyacrylate Crosspolymer-6, Polymethylsilsesquioxane, Xanthan Gum, Disodium EDTA, Phenoxyethanol (and) Ethylhexylglycerin.",
    keyIngredients: ["niacinamide"],
    affiliateUrl: "https://dotandkey.com/products/10-niacinamide-strawberry-brightening-face-serum",
  },
  {
    slug: "dot-key-pomegranate-0-2-retinol-complex-serum",
    name: "Pomegranate Youth 0.2% Retinol Complex Face Serum (30ml)",
    brand: "Dot & Key",
    category: "serum",
    priceInr: 599,
    label:
      "Aqua, Propanediol, Squalane, Cetyl Palmitate, Lauryl Glucoside (and) Myristyl Glucoside(and) Polyglyceryl-6 Laurate, Niacinamide, Retinol (and) Undecane (and) Tridecane (and) Tocopherol, Water (and) Poloxamer 235 (and) Retinol (and) Polysorbate20 (and) Sodium Ascorbate (and) Epigallocatechin Gallate (and) BHT (and)Disodium EDTA (and) Phenoxyethanol (and) BHA, Sodium hyaluronate, Punica Granatum (Pomegranate) Extract, Glycerin (and) Aqua (and) Butylene Glycol (and) Carbomer (and) Polysorbate 20 (and) Palmitoyl Tripeptide-1 (and) Palmitoyl Tetrapeptide-7, Aqua (and) Phragmites Communis Extract (and) Poria Cocos Extract, Coco-Caprylate/Caprate, Cetearyl Olivate (and) Sorbitan Olivate, Allantoin, Phenyl Trimethicone,Tocopheryl Acetate ,Sodium gluconate,Disodium EDTA,Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Glyceryl Stearate (and) PEG-75 Stearate, PEG-6 Stearate (and)Glycol Stearate (and) PEG-32 Stearate, Ethylhexyl Methoxycrylene , Xanthan gum,Sodium hydroxide, Phenoxyethanol (and)Ethylhexylglycerin.",
    keyIngredients: ["retinol", "niacinamide", "peptides"],
    affiliateUrl: "https://dotandkey.com/products/0-2-retinol-complex-face-serum",
  },
  {
    slug: "dot-key-barrier-repair-intense-moisturizer",
    name: "Barrier Repair Intense Moisturizer with Ceramides (100g)",
    brand: "Dot & Key",
    category: "moisturiser",
    priceInr: 399,
    label:
      "Aqua, Caprylic/Capric Triglyceride, Glycerin, Dimethicone, Cetearyl Alcohol, Propylene Glycol, Cyclopentasiloxane, Butyrospermum Parkii (Shea) Butter, Butylene Glycol, Cyclopentasiloxane (and) Dimethicone Crosspolymer, Cetyl Alcohol, Laminaria Digitata Extract (and) Hydrogenated Lecithin (and) Cetyl-PG Hydroxyethyl Palmitamide (and) Ceramide 1,2,3,4,6II (and) Cholesterol (and) 1,2-hexanediol, Sodium Hyaluronate, Squalane, Glycerin (and) Aqua (and) Vaccinium Angustifolium (Blueberry) Fruit Extract, Lactococcus Ferment Lysate, Aqua (and) Oryza Sativa (Rice) Extract (and) Saccharomyces ferment lysate filtrate (and) Citric acid (and) Sodium Benzoate (and) Potassium sorbate, Allantoin, Xylitylglucoside (and) Anhydroxylitol (and) Xylitol, Panthenol, Ceteareth 20, Tocopheryl Acetate, Stearic Acid, C14-22 Alcohols (and) C12-20 Alkyl Glucoside, Carbomer, Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7, Aluminium Starch Octenylsuccinate, Bis-Diglyceryl Polyacyladipate-2, Sodium Hydroxide, BHT, Disodium EDTA, Phenoxyethanol (and) Ethylhexylglycerin.",
    keyIngredients: ["ceramides", "shea-butter", "squalane"],
    affiliateUrl: "https://dotandkey.com/products/barrier-repair-intense-moisturizer",
  },
  {
    slug: "dot-key-dragon-fruit-bounce-gel-sunscreen-spf-50",
    name: "Dragon Fruit Bounce Gel Sunscreen SPF 50+ (50g)",
    brand: "Dot & Key",
    category: "sunscreen",
    priceInr: 445,
    label:
      "Aqua, C12-15 Alkyl Benzoate (and) Diethylamino Hydroxybenzoyl Hexyl Benzoate (and) Ethylhexyl Triazone (and) Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine (and) Propanediol (and) Lecithin (and) Phenoxyethanol (and) Hydroxyacetophenone, Terephthalylidene Dicamphor Sulfonic Acid, Phenylbenzimidazole Sulfonic Acid, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol (and) Aqua (and) Decyl Glucoside (and) Propylene Glycol (and) Xanthan Gum, Dimethicone, Triethanolamine, Butylene Glycol, Propylene Glycol, Isododecane, Hylocereus Undatus Fruit Extract(and) Propylene Glycol (and) Sodium Benzoate (and) Phenoxyethanol (and) Ethylhexylglycerin (and) Aqua, Propanediol, Ectoin, Silanetriol (and) Hyaluronic Acid (and) Methylpropanediol (and) Citric Acid (and) Water (Aqua), Sodium Hyaluronate Crosspolymer, Sodium Hyaluronate, Glycerin (and) Aqua (and) Butylene Glycol (and) Carbomer (and) Polysorbate 20 (and) Palmitoyl Tripeptide-1 (and) Palmitoyl Tetrapeptide-7, Laminaria Digitata Extract (and) Hydrogenated Lecithin (and) Cetyl-PG Hydroxyethyl Palmitamide (and) Ceramide 1,2,3,4,6II (and) Cholesterol (and) 1,2-Hexanediol, Niacinamide, Panthenol, Tocopheryl Acetate, Ammonium Acryloyldimethyltaurate/VP Copolymer, Polyacrylate Crosspolymer-6, Xanthan Gum, Sodium Stearoyl Glutamate, Dimethicone/Vinyl Dimethicone Crosspolymer (and) Silica, Allantoin, Disodium EDTA, Sodium Gluconate, Phenoxyethanol (and) Ethylhexylglycerin.",
    keyIngredients: ["uvinul-a-plus", "ethylhexyl-triazone", "bemotrizinol", "mexoryl-sx", "ensulizole", "bisoctrizole"],
    affiliateUrl: "https://dotandkey.com/products/dot-key-dragon-fruit-bounce-sunscreen-in-vivo-tested-spf-50-pa-50g",
  },
  {
    slug: "dot-key-strawberry-bright-niacinamide-gel-face-wash",
    name: "Strawberry Bright Niacinamide Gel Face Wash (100ml)",
    brand: "Dot & Key",
    category: "cleanser",
    priceInr: 249,
    label:
      "Aqua, Cocamidopropyl Betaine, Glycerin, Decyl Glucoside, Disodium Cocoyl Glutamate (and) Water, Sodium Cocoyl Glycinate, Niacinamide, Triethanolamine, Fragaria Ananassa (Strawberry) Fruit Extract, Aloe Barbadensis (Aloe vera) Leaf Juice, Sodium Hyaluronate, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Xanthan Gum, PEG-40 Hydrogenated Castor Oil, Laminaria Digitata Extract (and) Hydrogenated Lecithin (and) Cetyl-PG Hydroxyethyl Palmitamide (and) Ceramide 1,2,3,4,6II (and) Cholesterol (and) 1,2-Hexanediol, Panthenol, Disodium EDTA, Phenoxyethanol (and) Ethylhexylglycerin, Fragrance, CI 16255",
    keyIngredients: ["niacinamide"],
    affiliateUrl: "https://dotandkey.com/products/strawberry-bright-niacinamide-gel-face-wash",
  },
  {
    slug: "deconstruct-10-niacinamide-alpha-arbutin-serum",
    name: "Brightening Serum: 10% Niacinamide + 0.3% Alpha Arbutin (30ml)",
    brand: "Deconstruct",
    category: "serum",
    priceInr: 699,
    label:
      "Aqua, Niacinamide, Glycerin, Xylitylglucoside (and) anhydroxylitol (and) xylitol, Phenoxyethanol (and) Ethylhexylglycerin, Xanthan gum, Guar gum, Alpha Arbutin, EDTA, Brassica Campestris (Rapeseed) Seed Oil, Glycyrrhiza Glabra (Licorice)Root Extract, Polyglyceryl-3 Diisostearate, Althaea Officinalis Root Extract, Oryza Sativa (Rice) Bran Extract, Palmaria Palmata extract, Bellis Perennis (Daisy) Flower Extract",
    keyIngredients: ["niacinamide", "alpha-arbutin"],
    affiliateUrl: "https://thedeconstruct.in/products/niacinamide-and-alpha-arbutin-brightening-serum",
  },
  {
    slug: "deconstruct-retinol-peptide-serum",
    name: "Retinol & Peptide Serum: 0.2% Retinol + 1% Peptide (30ml)",
    brand: "Deconstruct",
    category: "serum",
    priceInr: 799,
    label:
      "Aqua, Pentylene Glycol (and) Lecithin (and) Alcohol (and) Retinol (and) Polysorbate 20 (and) Potassium Phosphate (and) Tocopherol, Pisum Sativum (Pea) Extract, Glycerin, Phenoxyethanol (and) Ethylhexylglycerin, Palmaria Palmata extract, Xanthan Gum, Magnesium Aspartate (and) Zinc Gluconate (and) Copper Gluconate, Sodium Gluconate, Sodium Hyaluronate, Betaine, Tocopherol, Tocotrienol.",
    keyIngredients: ["retinol"],
    affiliateUrl: "https://thedeconstruct.in/products/retinol-and-peptide-serum",
  },
  {
    slug: "deconstruct-2-hyaluronic-acid-1-niacinamide-serum",
    name: "Oil-Free Hydrating Serum: 2% Hyaluronic Acid + 1% Niacinamide (30ml)",
    brand: "Deconstruct",
    category: "serum",
    priceInr: 699,
    label:
      "Aqua, Xylitylglucoside (and) Anhydroxylitol (and) Xylitol, Sodium Hyaluronate, Piper nigrum (Black pepper) Seed Extract, Butylene Glycol, Niacinamide, Xanthan Gum, Phenoxyethanol (and) Ethylhexylglycerin, Magnesium Aspartate (and) Zinc Gluconate (and) Copper Gluconate, Sodium Gluconate.",
    keyIngredients: ["hyaluronic-acid", "niacinamide"],
    affiliateUrl: "https://thedeconstruct.in/products/oil-free-hydrating-face-serum",
  },
];

const file = join(__dirname, "..", "prisma", "data", "products.json");
const products = JSON.parse(readFileSync(file, "utf8")) as { slug: string }[];
const existing = new Set(products.map((p) => p.slug));
for (const p of NEW) {
  if (existing.has(p.slug)) continue;
  const { label, ...rest } = p;
  products.push({ ...rest, ingredients: splitIngredients(label), placeholder: false } as never);
}
writeFileSync(file, JSON.stringify(products, null, 2) + "\n");
console.log(`products.json now has ${products.length} products`);
