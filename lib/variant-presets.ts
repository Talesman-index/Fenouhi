import type { ProductAttributeDefinition, ProductVariant } from "@/types/catalog";

export interface CategoryVariantTemplate {
  key: string;
  label: string;
  matchKeywords: string[];
  attributes: ProductAttributeDefinition[];
}

export const CATEGORY_VARIANT_TEMPLATES: CategoryVariantTemplate[] = [
  // 1. TÉLÉPHONES & SMARTPHONES
  {
    key: "phones",
    label: "Téléphone",
    matchKeywords: ["phone", "iphone", "téléphone", "telephone", "smartphone", "samsung", "redmi", "xiaomi", "pixel", "huawei", "infinix", "tecno"],
    attributes: [
      {
        name: "Modèle",
        values: ["Simple", "Plus", "Pro", "Pro Max"],
      },
      {
        name: "Capacité",
        values: ["128 Go", "256 Go", "512 Go", "1 To", "64 Go"],
      },
      {
        name: "État",
        values: ["Neuf", "Reconditionné", "Occasion"],
      },
      {
        name: "Couleur",
        values: ["Noir", "Titane Naturel", "Blanc", "Bleu", "Or"],
      },
      {
        name: "SIM",
        values: ["SIM physique + eSIM", "eSIM uniquement", "Dual SIM physique"],
      },
    ],
  },

  // 2. IPAD & TABLETTES
  {
    key: "tablets",
    label: "Tablette / iPad",
    matchKeywords: ["ipad", "tablette", "tablet", "galaxy tab", "surface"],
    attributes: [
      {
        name: "Capacité",
        values: ["64 Go", "128 Go", "256 Go", "512 Go", "1 To"],
      },
      {
        name: "Taille",
        values: ["11 pouces", "12.9 pouces", "13 pouces", "10.9 pouces", "8.3 pouces"],
      },
      {
        name: "Connectivité",
        values: ["Wi-Fi", "Wi-Fi + 5G"],
      },
      {
        name: "État",
        values: ["Neuf", "Reconditionné", "Occasion"],
      },
      {
        name: "Couleur",
        values: ["Gris Sidéral", "Argent", "Lumière Stellaire", "Noir"],
      },
    ],
  },

  // 3. MACBOOK & PC PORTABLES
  {
    key: "laptops",
    label: "MacBook / PC",
    matchKeywords: ["macbook", "laptop", "ordinateur", "pc", "dell", "hp", "lenovo", "thinkpad", "asus"],
    attributes: [
      {
        name: "Puce / Processeur",
        values: ["Apple M1", "Apple M2", "Apple M3", "Apple M4", "Intel Core i7", "Intel Core i9"],
      },
      {
        name: "Mémoire RAM",
        values: ["8 Go", "16 Go", "24 Go", "36 Go", "48 Go", "64 Go"],
      },
      {
        name: "Stockage SSD",
        values: ["256 Go", "512 Go", "1 To", "2 To"],
      },
      {
        name: "Taille Écran",
        values: ["13 pouces", "14 pouces", "15 pouces", "16 pouces"],
      },
      {
        name: "État",
        values: ["Neuf", "Reconditionné", "Occasion"],
      },
      {
        name: "Couleur",
        values: ["Gris Sidéral", "Minuit", "Argent", "Noir"],
      },
    ],
  },

  // 4. VÊTEMENTS & MODE
  {
    key: "clothing",
    label: "Vêtement",
    matchKeywords: ["vêtement", "vetement", "mode", "shirt", "robe", "pantalon", "jean", "veste", "t-shirt", "chemise", "gaine", "costume", "sweat", "hoodie"],
    attributes: [
      {
        name: "Profil",
        values: ["Adulte", "Enfant", "Unisexe"],
      },
      {
        name: "Taille",
        values: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
      },
      {
        name: "Couleur",
        values: ["Noir", "Blanc", "Bleu Marine", "Gris", "Rouge", "Beige", "Kaki"],
      },
    ],
  },

  // 5. CHAUSSURES & SNEAKERS
  {
    key: "shoes",
    label: "Chaussure",
    matchKeywords: ["shoes", "shoe", "chaussures", "chaussure", "sneakers", "sneaker", "basket", "baskets", "soulier", "souliers", "sandale", "sandales", "talon", "talons", "mocassin", "mocassins", "botte", "bottes", "claquette", "claquettes", "pointure", "pointures"],
    attributes: [
      {
        name: "Profil",
        values: ["Adulte", "Enfant", "Bébé"],
      },
      {
        name: "Pointure",
        values: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"],
      },
      {
        name: "Couleur",
        values: ["Noir", "Blanc", "Gris", "Rouge", "Bleu", "Beige", "Multicolore"],
      },
    ],
  },

  // 6. AUTRE PRODUIT
  {
    key: "other",
    label: "Autre Produit",
    matchKeywords: ["other", "autre", "maison", "cuisine", "beauté", "gadget", "divers"],
    attributes: [
      {
        name: "Format / Taille",
        values: ["Standard", "Grande Taille (XL)", "Compact"],
      },
      {
        name: "Couleur / Finition",
        values: ["Noir", "Blanc", "Inox", "Gris"],
      },
    ],
  },
];

/**
 * Returns suggested preset attribute definitions based on category slug/ID or product name keywords.
 */
export function getPresetAttributesForCategory(
  categorySlugOrKey: string = "",
  productName: string = ""
): ProductAttributeDefinition[] {
  const normalizedKey = categorySlugOrKey.toLowerCase().trim();

  // 1. Direct template key match (e.g. "shoes", "phones", "tablets", "laptops", "clothing", "other")
  const directMatch = CATEGORY_VARIANT_TEMPLATES.find(
    (t) => t.key.toLowerCase() === normalizedKey
  );
  if (directMatch) {
    return JSON.parse(JSON.stringify(directMatch.attributes));
  }

  // 2. Keyword query match against category or product name
  const query = `${normalizedKey} ${productName}`.toLowerCase();
  for (const template of CATEGORY_VARIANT_TEMPLATES) {
    if (template.matchKeywords.some((kw) => query.includes(kw))) {
      return JSON.parse(JSON.stringify(template.attributes));
    }
  }

  // Fallback generic attributes
  return [
    {
      name: "Taille / Format",
      values: ["Standard", "Large", "XL"],
    },
    {
      name: "Couleur",
      values: ["Noir", "Blanc", "Gris", "Bleu"],
    },
  ];
}

/**
 * Generates Cartesian Product (all combinations) of selected attributes.
 */
export function generateCartesianVariants(
  attributes: ProductAttributeDefinition[],
  basePrice: number = 0,
  baseWholesalePrice: number | null = null,
  baseStock: number = 20,
  productSlug: string = "prod"
): ProductVariant[] {
  const activeAttributes = attributes.filter(
    (attr) => attr.name.trim() !== "" && attr.values && attr.values.length > 0
  );

  if (activeAttributes.length === 0) {
    return [];
  }

  // Cartesian product algorithm
  const cartesian = (arrays: string[][]): string[][] => {
    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]]
    );
  };

  const attributeNames = activeAttributes.map((a) => a.name);
  const attributeValues = activeAttributes.map((a) => a.values);
  const combinations = cartesian(attributeValues);

  return combinations.map((combo, index) => {
    const attrRecord: Record<string, string> = {};
    const titleParts: string[] = [];
    const skuParts: string[] = [productSlug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()];

    attributeNames.forEach((name, i) => {
      const val = combo[i];
      attrRecord[name] = val;
      titleParts.push(val);
      skuParts.push(val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase());
    });

    const sku = `${skuParts.join("-")}-${index + 1}`;
    const id = `var_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id,
      sku,
      title: titleParts.join(" • "),
      attributes: attrRecord,
      price: basePrice,
      wholesale_price_5_units: baseWholesalePrice,
      stock_quantity: baseStock,
      is_active: true,
      image_url: null,
    };
  });
}

/**
 * Finds exact matching variant given an attribute-value map.
 */
export function findMatchingVariant(
  variants: ProductVariant[] | undefined | null,
  selectedOptions: Record<string, string>
): ProductVariant | null {
  if (!variants || variants.length === 0) return null;

  return (
    variants.find((v) => {
      if (!v.is_active) return false;
      return Object.entries(selectedOptions).every(
        ([key, val]) => v.attributes[key] === val
      );
    }) || null
  );
}

/**
 * Computes availability status for options of a specific attribute,
 * given the user's current partial selection for other attributes.
 */
export function getAvailableOptionsForAttribute(
  variants: ProductVariant[] | undefined | null,
  currentSelection: Record<string, string>,
  targetAttribute: string
): { value: string; isAvailable: boolean; isInStock: boolean; variantPrice?: number }[] {
  if (!variants || variants.length === 0) return [];

  // Get all unique values for this target attribute across all variants
  const allValues = Array.from(
    new Set(
      variants
        .map((v) => v.attributes[targetAttribute])
        .filter(Boolean)
    )
  );

  return allValues.map((value) => {
    // Check if a valid variant exists with current other selections + this value
    const hypotheticalSelection = {
      ...currentSelection,
      [targetAttribute]: value,
    };

    const matching = variants.find((v) => {
      if (!v.is_active) return false;
      return Object.entries(hypotheticalSelection).every(
        ([k, val]) => !v.attributes[k] || v.attributes[k] === val
      );
    });

    const isAvailable = Boolean(matching);
    const isInStock = Boolean(matching && matching.stock_quantity > 0);

    return {
      value,
      isAvailable,
      isInStock,
      variantPrice: matching ? matching.price : undefined,
    };
  });
}
