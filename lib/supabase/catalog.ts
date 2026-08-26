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
  { id: "c1000000-0000-0000-0000-000000000009", name: "Sport & Fitness", slug: "sport", description: "Équipements fitness, vêtements sportifs, musculation et articles de plein air.", icon: "Activity", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000010", name: "Vrac & Grossistes", slug: "wholesale", description: "Lots d'articles en vrac et approvisionnement direct usines.", icon: "Package", is_active: true }
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
  const matchedCat =
    FALLBACK_CATEGORIES.find((c) => c.slug === p.category || c.id === p.category) ||
    FALLBACK_CATEGORIES.find((c) => (p.category || "").toLowerCase().includes(c.slug.toLowerCase())) ||
    null;

  return {
    id: p.id,
    name: p.title,
    slug: `product-${p.id}`,
    short_description: p.subtitle || p.description,
    description: p.description,
    category_id: matchedCat?.id || null,
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
    category: matchedCat,
  } as Product;
}

let inMemoryCustomProducts: Product[] = [];
let inMemoryDeletedIds: string[] = [];

export function getStoredCustomProducts(): Product[] {
  if (typeof window === "undefined") return inMemoryCustomProducts;
  try {
    const data = localStorage.getItem("fenou_custom_products");
    const parsed = data ? JSON.parse(data) : [];
    if (parsed && parsed.length > 0) {
      inMemoryCustomProducts = parsed;
      return parsed;
    }
    return inMemoryCustomProducts;
  } catch {
    return inMemoryCustomProducts;
  }
}

export function saveStoredCustomProducts(products: Product[]) {
  inMemoryCustomProducts = products;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("fenou_custom_products", JSON.stringify(products));
  } catch (err) {
    console.warn("LocalStorage error, preserved in memory:", err);
  }
}

export function getStoredDeletedProductIds(): string[] {
  if (typeof window === "undefined") return inMemoryDeletedIds;
  try {
    const data = localStorage.getItem("fenou_deleted_product_ids");
    const parsed = data ? JSON.parse(data) : [];
    if (parsed && parsed.length > 0) {
      inMemoryDeletedIds = parsed;
      return parsed;
    }
    return inMemoryDeletedIds;
  } catch {
    return inMemoryDeletedIds;
  }
}

export function saveStoredDeletedProductIds(ids: string[]) {
  inMemoryDeletedIds = ids;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("fenou_deleted_product_ids", JSON.stringify(ids));
  } catch (err) {
    console.warn("LocalStorage error, preserved in memory:", err);
  }
}

/**
 * Synchronously get products from lib/products.ts merged with localStorage custom/modified products.
 */
export function getPublicProductsSync(options: ProductFilterOptions = {}): Product[] {
  try {
    const deletedIds = new Set(getStoredDeletedProductIds());
    const custom = getStoredCustomProducts();
    const productMap = new Map<string, Product>();

    // 1. Add custom and newly added products FIRST so they appear at the very TOP
    for (const p of custom) {
      if (!deletedIds.has(p.id) && !deletedIds.has(p.slug)) {
        productMap.set(p.id, p);
      }
    }

    // 2. Add base products from lib/products.ts if not already present
    for (const raw of PRODUCTS) {
      const p = mapLocalProductToCatalogProduct(raw);
      if (!productMap.has(p.id) && !deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
        productMap.set(p.id, p);
      }
    }

    let list = Array.from(productMap.values());

    if (options.categorySlug && options.categorySlug !== "all") {
      const target = options.categorySlug.toLowerCase();
      list = list.filter((p) => {
        const catId = (p.category_id || "").toLowerCase();
        const catSlug = (p.category?.slug || "").toLowerCase();
        const catName = (p.category?.name || "").toLowerCase();
        return (
          catId === target ||
          catSlug === target ||
          catName === target ||
          (target === "beauty" && (catSlug === "beauty" || catName.includes("beauté") || catName.includes("soin")))
        );
      });
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
 * Fetch active products for the public catalog (live Supabase query + fallback).
 */
export async function getPublicProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    const deletedIds = new Set(getStoredDeletedProductIds());
    const localProducts = getPublicProductsSync(options);
    const productMap = new Map<string, Product>();

    // 1. Local products & custom products
    for (const p of localProducts) {
      if (!deletedIds.has(p.id) && !deletedIds.has(p.slug)) {
        productMap.set(p.id, p);
      }
    }

    // 2. Fetch from Server API route /api/products
    try {
      if (typeof window !== "undefined") {
        const res = await fetch(`/api/products?cat=${options.categorySlug || "all"}&q=${options.search || ""}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.products && json.products.length > 0) {
            for (const p of json.products) {
              if (!deletedIds.has(p.id) && !deletedIds.has(p.slug)) {
                productMap.set(p.id, p as Product);
              }
            }
          }
        }
      }
    } catch {}

    // 3. Query Supabase
    try {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (options.categorySlug && options.categorySlug !== "all") {
        query = query.eq("category_id", options.categorySlug);
      }

      const { data: dbProducts, error } = await query;
      if (!error && dbProducts && dbProducts.length > 0) {
        for (const p of dbProducts) {
          if (!deletedIds.has(p.id) && !deletedIds.has(p.slug)) {
            productMap.set(p.id, p as Product);
          }
        }
      }
    } catch {}

    let list = Array.from(productMap.values());

    if (options.categorySlug && options.categorySlug !== "all") {
      list = list.filter((p) => p.category?.slug === options.categorySlug || p.category_id === options.categorySlug);
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
    return getPublicProductsSync(options);
  }
}

/**
 * Fetch a single product by ID or slug (from live Supabase DB or local catalogue).
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  try {
    const deletedIds = new Set(getStoredDeletedProductIds());
    if (deletedIds.has(idOrSlug)) return null;

    try {
      const supabase = createClient();
      const { data: dbProd } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle();

      if (dbProd && !deletedIds.has(dbProd.id) && !deletedIds.has(dbProd.slug)) {
        return dbProd as Product;
      }
    } catch {}

    const custom = getStoredCustomProducts();
    const foundCustom = custom.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (foundCustom && !deletedIds.has(foundCustom.id) && !deletedIds.has(foundCustom.slug)) {
      return foundCustom;
    }

    const cleanId = idOrSlug.replace(/^product-/, "");
    const local = getLocalProductById(cleanId) || getLocalProductById(idOrSlug) || PRODUCTS.find((p) => `product-${p.id}` === idOrSlug || p.id === idOrSlug);
    if (local && !deletedIds.has(local.id) && !deletedIds.has(`product-${local.id}`)) {
      return mapLocalProductToCatalogProduct(local);
    }
    return null;
  } catch (err) {
    return null;
  }
}
