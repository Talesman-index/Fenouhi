import { createClient } from "@/lib/supabase/client";
import type { Category, Product, ProductFilterOptions, ProductStatus } from "@/types/catalog";
import { PRODUCTS, getProductById as getLocalProductById } from "@/lib/products";

// Fallback seed categories (All 9 major wholesale categories)
export const FALLBACK_CATEGORIES: Category[] = [
  { id: "c1000000-0000-0000-0000-000000000001", name: "High-Tech & Électronique", slug: "electronics", description: "Smartphones, montres connectées, écouteurs, casques audio et high-tech.", icon: "Smartphone", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000002", name: "Mode & Chaussures", slug: "fashion", description: "Sneakers, vêtements streetwear, sacs maroquinerie, bijoux et textiles.", icon: "Shirt", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000003", name: "Beauté & Soins", slug: "beauty", description: "Sérums visage, soin de la peau, cosmétiques et équipements esthétiques.", icon: "Sparkles", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000004", name: "Machinerie & Outillage", slug: "machinery", description: "Équipements de travail, gants protection EPI et outillage industriel.", icon: "Wrench", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000005", name: "Maison & Électroménager", slug: "home", description: "Décoration, petit électroménager et articles d'équipement de maison.", icon: "Home", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000006", name: "Pièces Auto & Moto", slug: "automotive", description: "Pièces détachées, éclairage LED et accessoires véhicules.", icon: "Car", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000007", name: "Quincaillerie & Matériaux", slug: "hardware", description: "Matériaux de construction, robinetterie, quincaillerie et outillage.", icon: "Hammer", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000008", name: "Jouets & Puériculture", slug: "toys", description: "Jeux éducatifs, jouets enfants et articles de puériculture.", icon: "Smile", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000009", name: "Vrac & Grossistes", slug: "wholesale", description: "Lots d'articles en vrac et approvisionnement direct usines.", icon: "Package", is_active: true }
];

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && !url.includes("placeholder") && key && !key.includes("placeholder"));
};

/**
 * Fetch all active categories from Supabase (with instant fallback if DB table or URL not configured).
 */
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_CATEGORIES;
  }

  try {
    const supabase = createClient();
    const fetchPromise = supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    const timeoutPromise = new Promise<{ data: null; error: boolean }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: true }), 1000)
    );

    const result: any = await Promise.race([fetchPromise, timeoutPromise]);
    const { data, error } = result || {};

    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    return data as Category[];
  } catch (err) {
    return FALLBACK_CATEGORIES;
  }
}

/**
 * Helper to map a local Product item from lib/products.ts to the full Product model.
 */
function mapLocalProductToCatalogProduct(p: any): Product {
  return {
    id: p.id,
    name: p.title,
    slug: `product-${p.id}`,
    short_description: p.subtitle || p.description,
    description: p.description,
    category_id: null,
    subcategory: null,
    price: p.price,
    currency: "FCFA",
    stock_quantity: 100,
    minimum_order_quantity: p.minQty || 1,
    country_of_origin: p.origin || "Hub International",
    weight: parseFloat(p.weight || "0.5"),
    length: parseFloat(p.volume || "0.01"),
    available_shipping_modes: ["air", "sea"],
    estimated_delivery_time: (p as any).estDelivery || "5-15 jours (Air)",
    status: "active" as ProductStatus,
    is_demo: false,
    is_featured: true,
    condition_state: p.conditionState || null,
    grade: (p.grade as any) || null,
    sim_type: (p.simType as any) || null,
    region_version: (p.regionVersion as any) || null,
    storage_options: p.storageOptions || null,
    battery_health: p.batteryHealth || null,
    driveFolderUrl: p.driveFolderUrl || null,
    images: (p.images || [p.image]).map((url: string, i: number) => ({
      id: `img-${p.id}-${i}`,
      product_id: p.id,
      public_image_url: url,
      position: i,
      is_primary: i === 0,
    })),
    category: FALLBACK_CATEGORIES.find((c) => c.slug === p.category) || null,
  } as Product;
}

/**
 * Synchronous local product catalog fetcher for instant rendering.
 */
export function getPublicProductsSync(options: ProductFilterOptions = {}): Product[] {
  try {
    // Reverse PRODUCTS array so newly added products come first
    const raw = [...PRODUCTS].reverse();
    let list = raw.map(mapLocalProductToCatalogProduct);

    if (options.categorySlug && options.categorySlug !== "all") {
      list = list.filter((p) => p.category?.slug === options.categorySlug);
    } else if (!options.search) {
      // Interleave products across categories for a rich varied homepage feed
      const byCategory: Record<string, Product[]> = {};
      for (const item of list) {
        const catKey = item.category?.slug || "general";
        if (!byCategory[catKey]) byCategory[catKey] = [];
        byCategory[catKey].push(item);
      }
      const categoryKeys = Object.keys(byCategory);
      const interleaved: Product[] = [];
      let maxLen = 0;
      for (const key of categoryKeys) {
        if (byCategory[key].length > maxLen) maxLen = byCategory[key].length;
      }
      for (let i = 0; i < maxLen; i++) {
        for (const key of categoryKeys) {
          if (byCategory[key][i]) {
            interleaved.push(byCategory[key][i]);
          }
        }
      }
      list = interleaved;
    }

    if (options.conditionState && options.conditionState !== "all") {
      list = list.filter((p) => p.condition_state === options.conditionState);
    }

    if (options.search && options.search.trim() !== "") {
      const q = options.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.short_description || "").toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q)
      );
    }

    if (options.isFeatured) {
      list = list.filter((p) => p.is_featured);
    }

    if (options.limit) {
      list = list.slice(0, options.limit);
    }

    return list;
  } catch (err) {
    return PRODUCTS.map(mapLocalProductToCatalogProduct);
  }
}

/**
 * Fetch active products for the public catalog.
 */
export async function getPublicProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  return getPublicProductsSync(options);
}

/**
 * Fetch a single product by ID or slug.
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  try {
    const cleanId = idOrSlug.replace(/^product-/, "");
    const local = getLocalProductById(cleanId) || getLocalProductById(idOrSlug) || PRODUCTS.find((p) => `product-${p.id}` === idOrSlug || p.id === idOrSlug);
    if (local) {
      return mapLocalProductToCatalogProduct(local);
    }
    return null;
  } catch (err) {
    return null;
  }
}
