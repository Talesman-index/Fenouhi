import type { ProductAttributeDefinition, ProductVariant } from "@/types/catalog";

export interface CategoryVariantTemplate {
  key: string;
  label: string;
  matchKeywords: string[];
  attributes: ProductAttributeDefinition[];
}

export const CATEGORY_VARIANT_TEMPLATES: CategoryVariantTemplate[] = [
  // 1. TÉLÉPHONES & SMARTPHONES (Apple iPhone, Samsung Galaxy, Xiaomi, etc.)
  {
    key: "phones",
    label: "Smartphones & Téléphones",
    matchKeywords: ["phone", "iphone", "téléphone", "smartphone", "samsung", "redmi", "xiaomi", "pixel", "huawei", "infinix", "tecno"],
    attributes: [
      {
        name: "Capacité",
        values: ["64 Go", "128 Go", "256 Go", "512 Go", "1 To"],
      },
      {
        name: "Grade & État",
        values: ["Scellé (Neuf)", "Grade A (Comme neuf)", "Grade B (Très bon état)", "Grade C (Bon état)"],
      },
      {
        name: "Couleur",
        values: ["Titane Naturel", "Titane Noir", "Titane Blanc", "Bleu Titane", "Noir Sidéral", "Argent", "Or", "Bleu Nuit", "Vert Alpin", "Rose", "Rouge"],
      },
      {
        name: "Format SIM",
        values: ["SIM physique + eSIM", "eSIM uniquement (US)", "Dual SIM physique (HK/Chine)"],
      },
    ],
  },

  // 2. IPAD & TABLETTES (iPad Pro, iPad Air, iPad Mini, Galaxy Tab)
  {
    key: "tablets",
    label: "iPad & Tablettes",
    matchKeywords: ["ipad", "tablette", "tablet", "galaxy tab", "surface"],
    attributes: [
      {
        name: "Capacité",
        values: ["64 Go", "128 Go", "256 Go", "512 Go", "1 To", "2 To"],
      },
      {
        name: "Taille Écran",
        values: ["8.3 pouces (Mini)", "10.2 pouces", "10.9 pouces (Air)", "11 pouces (Pro)", "12.9 pouces (Pro)", "13 pouces (Pro/Air)"],
      },
      {
        name: "Puce / Processeur",
        values: ["Puce A14 Bionic", "Puce A15 Bionic", "Puce M1", "Puce M2", "Puce M4"],
      },
      {
        name: "Connectivité",
        values: ["Wi-Fi", "Wi-Fi + 5G Cellular"],
      },
      {
        name: "Grade & État",
        values: ["Scellé (Neuf)", "Grade A (Comme neuf)", "Grade B (Très bon état)"],
      },
      {
        name: "Couleur",
        values: ["Gris Sidéral", "Argent", "Noir Spatial", "Lumière Stellaire", "Bleu", "Mauve"],
      },
    ],
  },

  // 3. MACBOOK & ORDINATEURS PORTABLES
  {
    key: "laptops",
    label: "MacBook & Ordinateurs",
    matchKeywords: ["macbook", "laptop", "ordinateur", "pc", "dell", "hp", "lenovo", "thinkpad", "asus"],
    attributes: [
      {
        name: "Taille Écran",
        values: ["13.3 pouces", "13.6 pouces", "14.2 pouces", "15.3 pouces", "16.2 pouces"],
      },
      {
        name: "Puce / Processeur",
        values: ["Apple M1", "Apple M2", "Apple M3", "Apple M4", "Intel Core i5", "Intel Core i7", "Intel Core i9"],
      },
      {
        name: "Configuration Puce",
        values: ["Standard", "Pro", "Max", "Ultra"],
      },
      {
        name: "Mémoire RAM",
        values: ["8 Go", "16 Go", "18 Go", "24 Go", "36 Go", "48 Go", "64 Go", "96 Go", "128 Go"],
      },
      {
        name: "Stockage SSD",
        values: ["256 Go", "512 Go", "1 To", "2 To", "4 To", "8 To"],
      },
      {
        name: "Grade & État",
        values: ["Scellé (Neuf)", "Grade A (Comme neuf)", "Grade B (Très bon état)"],
      },
      {
        name: "Couleur",
        values: ["Gris Sidéral", "Minuit", "Noir Sidéral", "Lumière Stellaire", "Argent"],
      },
    ],
  },

  // 4. VÊTEMENTS & MODE
  {
    key: "clothing",
    label: "Vêtements & Mode",
    matchKeywords: ["vêtement", "vetement", "mode", "shirt", "robe", "pantalon", "jean", "veste", "t-shirt", "chemise", "gaine", "costume", "sweat", "hoodie"],
    attributes: [
      {
        name: "Profil",
        values: ["Adulte Homme", "Adulte Femme", "Enfant", "Unisexe"],
      },
      {
        name: "Taille",
        values: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
      },
      {
        name: "Couleur",
        values: ["Noir", "Blanc", "Bleu Marine", "Gris", "Beige", "Rouge", "Vert", "Kaki", "Marron"],
      },
    ],
  },

  // 5. CHAUSSURES & SNEAKERS
  {
    key: "shoes",
    label: "Chaussures & Sneakers",
    matchKeywords: ["chaussure", "sneaker", "basket", "soulier", "sandale", "talon", "mocassin", "botte", "claquette"],
    attributes: [
      {
        name: "Profil",
        values: ["Adulte", "Junior / Enfant", "Bébé"],
      },
      {
        name: "Pointure",
        values: [
          "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
        ],
      },
      {
        name: "Couleur",
        values: ["Noir / Blanc", "Blanc Pur", "Triple Black", "Gris / Bleu", "Rouge / Noir", "Beige / Crème", "Multicolore"],
      },
    ],
  },

  // 6. BEAUTÉ & COSMÉTIQUES
  {
    key: "beauty",
    label: "Beauté, Soins & Parfums",
    matchKeywords: ["beauté", "beaute", "soin", "parfum", "crème", "sérum", "lotion", "cosmétique"],
    attributes: [
      {
        name: "Contenance / Format",
        values: ["30 ml", "50 ml", "100 ml", "150 ml", "200 ml", "Coffret Cadeau"],
      },
      {
        name: "Variante / Teinte",
        values: ["Standard", "Peau Sensible", "Formule Éclaircissante", "Anti-Âge Pro"],
      },
    ],
  },

  // 7. MAISON, CUISINE & ÉLECTROMÉNAGER
  {
    key: "home",
    label: "Maison, Cuisine & Électroménager",
    matchKeywords: ["maison", "cuisine", "électroménager", "electromenager", "robot", "bouilloire", "lampe", "défroisseur"],
    attributes: [
      {
        name: "Capacité / Taille",
        values: ["Standard", "Grande Capacité (XXL)", "Format Compact"],
      },
      {
        name: "Couleur / Finition",
        values: ["Inox Brossé", "Noir Mat", "Blanc Pur", "Gris Métallisé"],
      },
    ],
  },
];

/**
 * Returns suggested preset attribute definitions based on category slug/ID or product name keywords.
 */
export function getPresetAttributesForCategory(
  categorySlugOrId: string = "",
  productName: string = ""
): ProductAttributeDefinition[] {
  const query = `${categorySlugOrId} ${productName}`.toLowerCase();

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
