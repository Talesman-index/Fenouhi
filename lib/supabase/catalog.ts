import { createClient } from "@/lib/supabase/client";
import type { Category, Product, ProductFilterOptions, ProductStatus } from "@/types/catalog";
import { PRODUCTS, getProductById as getLocalProductById } from "@/lib/products";
import rawCustomProducts from "@/data/custom-products.json";
import rawDeletedIds from "@/data/deleted-products.json";

// Fallback seed categories (Aligned with Supabase categories table)
export const FALLBACK_CATEGORIES: Category[] = [
  { id: "c1000000-0000-0000-0000-000000000001", name: "High-Tech & Electronics", slug: "electronics", description: "Smartphones, montres connectées, écouteurs, casques audio et high-tech.", icon: "Smartphone", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000002", name: "Mode & Chaussures", slug: "fashion", description: "Sneakers, vêtements streetwear, sacs maroquinerie, bijoux et textiles.", icon: "Shirt", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000003", name: "Beauté & Soins", slug: "beauty", description: "Sérums visage, soin de la peau, cosmétiques et équipements esthétiques.", icon: "Sparkles", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000004", name: "Machinerie & Outillage", slug: "machinery", description: "Équipements de travail, gants protection EPI et outillage industriel.", icon: "Wrench", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000005", name: "Maison & Électroménager", slug: "home", description: "Décoration, petit électroménager et articles d'équipement de maison.", icon: "Home", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000006", name: "Pièces Auto & Moto", slug: "automotive", description: "Pièces détachées, éclairage LED et accessoires véhicules.", icon: "Car", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000007", name: "Quincaillerie & Matériaux", slug: "hardware", description: "Matériaux de construction, robinetterie, quincaillerie et outillage.", icon: "Hammer", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000008", name: "Jouets & Puériculture", slug: "toys", description: "Jeux éducatifs, jouets enfants et articles de puériculture.", icon: "Smile", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000009", name: "Vrac & Grossistes", slug: "wholesale", description: "Lots d'articles en vrac et approvisionnement direct usines.", icon: "Package", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000011", name: "Mode Pagne Africain", slug: "mode-pagne-africain", description: "Pagnes traditionnels, wax hollandais, imprimés africains, tenues sur-mesure et accessoires en pagne.", icon: "Sparkles", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000012", name: "Sport & Fitness", slug: "sport", description: "Équipements fitness, vêtements sportifs, musculation et articles de plein air.", icon: "Activity", is_active: true }
];

export const VALID_SUPABASE_PRODUCT_COLUMNS = new Set([
  "id", "name", "slug", "short_description", "description", "category_id",
  "subcategory", "price", "cargolink_margin_percent", "air_freight_rate_per_kg",
  "sea_freight_rate_per_cbm", "currency", "stock_quantity", "minimum_order_quantity",
  "country_of_origin", "weight", "length", "width", "height",
  "available_shipping_modes", "estimated_delivery_time", "status", "is_demo",
  "is_featured", "created_by", "created_at", "updated_at"
]);

export function packProductMetadata(description: string, metadata: Record<string, any>): string {
  const cleanDesc = (description || "").replace(/<!--CARGOLINK_META:[\s\S]*?-->/g, "").trim();
  const validMetaEntries = Object.entries(metadata).filter(([, v]) => v !== undefined && v !== null);
  if (validMetaEntries.length === 0) return cleanDesc;
  const jsonMeta = JSON.stringify(Object.fromEntries(validMetaEntries));
  return `${cleanDesc}\n\n<!--CARGOLINK_META:${jsonMeta}-->`;
}

export function unpackProductMetadata(rawDescription: string | null | undefined): { description: string; meta: Record<string, any> } {
  if (!rawDescription) return { description: "", meta: {} };
  const match = rawDescription.match(/<!--CARGOLINK_META:([\s\S]*?)-->/);
  if (!match) return { description: rawDescription, meta: {} };
  try {
    const meta = JSON.parse(match[1]);
    const cleanDesc = rawDescription.replace(/<!--CARGOLINK_META:[\s\S]*?-->/g, "").trim();
    return { description: cleanDesc, meta };
  } catch {
    return { description: rawDescription, meta: {} };
  }
}

export function sanitizeProductForSupabase(data: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (VALID_SUPABASE_PRODUCT_COLUMNS.has(k) && v !== undefined) {
      clean[k] = v;
    }
  }
  return clean;
}

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && !url.includes("placeholder") && key && !key.includes("placeholder"));
};

export function mergeCategoriesWithFallback(dbCategories: Category[]): Category[] {
  const map = new Map<string, Category>();

  // 1. Seed with all fallback categories first (guaranteeing sport, high-tech, mode, etc. exist)
  for (const fc of FALLBACK_CATEGORIES) {
    if (fc.slug) {
      map.set(fc.slug.toLowerCase(), fc);
    }
  }

  // 2. Overlay db categories by slug or id
  if (Array.isArray(dbCategories)) {
    for (const dbc of dbCategories) {
      const slug = (dbc.slug || "").toLowerCase();
      if (slug && map.has(slug)) {
        map.set(slug, {
          ...map.get(slug),
          ...dbc,
          name: dbc.name || map.get(slug)!.name,
        });
      } else if (slug) {
        map.set(slug, dbc);
      } else if (dbc.id) {
        map.set(dbc.id, dbc);
      }
    }
  }

  // 3. Guarantee every standard category slug is strictly present
  for (const fc of FALLBACK_CATEGORIES) {
    const slug = fc.slug.toLowerCase();
    if (!map.has(slug)) {
      map.set(slug, fc);
    }
  }

  // 4. Return list sorted alphabetically by name
  return Array.from(map.values()).sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", "fr", { sensitivity: "base" })
  );
}

/**
 * Fetch all active categories from Supabase (with instant fallback if DB table or URL not configured).
 */
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return mergeCategoriesWithFallback([]);
  }

  try {
    const supabase = createClient();
    const fetchPromise = supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    const timeoutPromise = new Promise<{ data: null; error: boolean }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: true }), 1500)
    );

    const result: any = await Promise.race([fetchPromise, timeoutPromise]);
    const { data, error } = result || {};

    if (error || !data || data.length === 0) {
      return mergeCategoriesWithFallback([]);
    }
    return mergeCategoriesWithFallback(data as Category[]);
  } catch (err) {
    return mergeCategoriesWithFallback([]);
  }
}

/**
 * Safely extracts the best public image URL from any product representation.
 */
export function getProductImageUrl(p: any): string {
  if (!p) return "/images/assets/hero_iphone16.png";

  if (typeof p === "string" && p.trim()) return p.trim();

  // 1. Array of images (supports both objects with public_image_url and raw string URLs)
  if (Array.isArray(p.images) && p.images.length > 0) {
    const primary = p.images.find((img: any) => img && (img.is_primary === true || img.isPrimary === true));
    const target = primary || p.images[0];
    if (typeof target === "string" && target.trim()) {
      return target.trim();
    }
    if (target && typeof target === "object") {
      const url = target.public_image_url || target.url || target.src || target.image_url;
      if (typeof url === "string" && url.trim()) {
        return url.trim();
      }
    }
  }

  // 2. Direct string image properties
  const direct = p.image || p.image_url || p.imageUrl || p.primary_image || p.img;
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  return "/images/assets/hero_iphone16.png";
}

/**
 * Normalizes a product so its `images` property is guaranteed to be an array of ProductImage objects with valid `public_image_url`,
 * and extracts any embedded JSON metadata (variants, attributes, conditions).
 */
export function normalizeProduct(p: any): Product {
  if (!p) return p;

  const { description: cleanDesc, meta } = unpackProductMetadata(p.description);

  const rawList: string[] = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    for (const item of p.images) {
      if (typeof item === "string" && item.trim()) {
        rawList.push(item.trim());
      } else if (item && typeof item === "object") {
        const url = item.public_image_url || item.url || item.src || item.image_url;
        if (typeof url === "string" && url.trim()) {
          rawList.push(url.trim());
        }
      }
    }
  }

  const direct = p.image || p.image_url || p.imageUrl;
  if (typeof direct === "string" && direct.trim() && !rawList.includes(direct.trim())) {
    rawList.unshift(direct.trim());
  }

  if (rawList.length === 0) {
    rawList.push("/images/assets/hero_iphone16.png");
  }

  const normalizedImages = rawList.map((url, i) => ({
    id: `img-${p.id || "prod"}-${i}`,
    product_id: p.id || "",
    public_image_url: url,
    position: i,
    is_primary: i === 0,
  }));

  const hasVariants = (p as any).has_variants ?? (p as any).hasVariants ?? meta.has_variants ?? Boolean(p.variants && p.variants.length > 0);
  const variants = p.variants || meta.variants || null;
  const attributesDef = p.attributes_definition || p.attributesDefinition || meta.attributes_definition || null;
  const wholesalePrice = p.wholesale_price_5_units || p.wholesalePrice5 || meta.wholesale_price_5_units || null;
  const conditionState = p.condition_state || p.conditionState || meta.condition_state || null;
  const grade = p.grade || meta.grade || null;
  const simType = p.sim_type || meta.sim_type || null;
  const regionVersion = p.region_version || meta.region_version || null;
  const storageOptions = p.storage_options || meta.storage_options || null;
  const batteryHealth = p.battery_health || meta.battery_health || null;

  return {
    ...p,
    description: cleanDesc || p.description,
    has_variants: hasVariants,
    variants: variants,
    attributes_definition: attributesDef,
    wholesale_price_5_units: wholesalePrice,
    condition_state: conditionState,
    grade: grade,
    sim_type: simType,
    region_version: regionVersion,
    storage_options: storageOptions,
    battery_health: batteryHealth,
    images: normalizedImages,
  } as Product;
}

/**
 * Helper to map a local Product item from lib/products.ts to the full Product model.
 */
function mapLocalProductToCatalogProduct(p: any): Product {
  const matchedCat =
    FALLBACK_CATEGORIES.find((c) => c.slug === p.category || c.id === p.category) ||
    FALLBACK_CATEGORIES.find((c) => (p.category || "").toLowerCase().includes(c.slug.toLowerCase())) ||
    FALLBACK_CATEGORIES.find((c) => ((p.category || "").toLowerCase().includes("sport") || (p.category || "").toLowerCase().includes("fitness")) && c.slug === "sport") ||
    null;

  const rawImages = (p.images || (p.image ? [p.image] : [])).filter(Boolean);
  if (rawImages.length === 0) {
    rawImages.push("/images/assets/hero_iphone16.png");
  }

  return {
    id: p.id,
    name: p.title,
    slug: `product-${p.id}`,
    short_description: p.subtitle || p.description,
    description: p.description,
    category_id: matchedCat?.id || null,
    subcategory: null,
    price: p.price,
    wholesale_price_5_units: p.wholesale_price_5_units || p.wholesalePrice5 || null,
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
    has_variants: (p as any).has_variants ?? (p as any).hasVariants ?? Boolean((p as any).variants && (p as any).variants.length > 0),
    attributes_definition: (p as any).attributes_definition ?? (p as any).attributesDefinition ?? null,
    variants: (p as any).variants ?? null,
    images: rawImages.map((url: string, i: number) => ({
      id: `img-${p.id}-${i}`,
      product_id: p.id,
      public_image_url: url,
      position: i,
      is_primary: i === 0,
    })),
    category: matchedCat,
  } as Product;
}

let inMemoryCustomProducts: Product[] = (rawCustomProducts as any[]).map(normalizeProduct);
let inMemoryDeletedIds: string[] = (rawDeletedIds as string[]) || [];

export function getStoredCustomProducts(): Product[] {
  const fileCustom = (rawCustomProducts as any[]).map(normalizeProduct);
  if (typeof window === "undefined") {
    const map = new Map<string, Product>();
    fileCustom.forEach(p => map.set(p.id, p));
    inMemoryCustomProducts.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }
  try {
    const data = localStorage.getItem("fenou_custom_products");
    const parsed = data ? JSON.parse(data).map(normalizeProduct) : [];
    const map = new Map<string, Product>();
    fileCustom.forEach(p => map.set(p.id, p));
    inMemoryCustomProducts.forEach(p => map.set(p.id, p));
    parsed.forEach((p: Product) => {
      map.set(p.id, p);
    });
    return Array.from(map.values());
  } catch {
    return fileCustom;
  }
}

export function saveStoredCustomProducts(products: Product[]) {
  inMemoryCustomProducts = products;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("fenou_custom_products", JSON.stringify(products));
  } catch (err) {
    console.warn("LocalStorage save notice, preserved in memory:", err);
  }
}

export function getStoredDeletedProductIds(): string[] {
  const fileDeleted = (rawDeletedIds as string[]) || [];
  if (typeof window === "undefined") {
    return Array.from(new Set([...inMemoryDeletedIds, ...fileDeleted]));
  }
  try {
    const data = localStorage.getItem("fenou_deleted_product_ids");
    const parsed = data ? JSON.parse(data) : [];
    const merged = Array.from(new Set([...fileDeleted, ...inMemoryDeletedIds, ...parsed]));
    return merged;
  } catch {
    return Array.from(new Set([...inMemoryDeletedIds, ...fileDeleted]));
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
      if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
        productMap.set(p.id, p);
      }
    }

    // 2. Add base products from lib/products.ts if not already present or modified
    for (const raw of PRODUCTS) {
      const p = mapLocalProductToCatalogProduct(raw);
      if (!productMap.has(p.id) && !deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
        productMap.set(p.id, p);
      }
    }

    let list = Array.from(productMap.values());

    // Filter out inactive/draft products for public catalog by default
    list = list.filter((p) => !p.status || p.status === "active");

    // Sort to ensure custom & newest products always appear at the very top
    list.sort((a, b) => {
      const aIsCustom = a.id?.startsWith("custom_") || a.id?.startsWith("prod_") || !PRODUCTS.some(raw => raw.id === a.id);
      const bIsCustom = b.id?.startsWith("custom_") || b.id?.startsWith("prod_") || !PRODUCTS.some(raw => raw.id === b.id);
      if (aIsCustom && !bIsCustom) return -1;
      if (!aIsCustom && bIsCustom) return 1;
      const aTime = (a as any).updated_at ? new Date((a as any).updated_at).getTime() : ((a as any).created_at ? new Date((a as any).created_at).getTime() : 0);
      const bTime = (b as any).updated_at ? new Date((b as any).updated_at).getTime() : ((b as any).created_at ? new Date((b as any).created_at).getTime() : 0);
      return bTime - aTime;
    });

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
          (target === "electronics" && (catSlug === "electronics" || catId.includes("c1000000-0000-0000-0000-000000000001") || catName.includes("high-tech") || catName.includes("phone") || catName.includes("téléphone") || catName.includes("coque") || catName.includes("chargeur") || catName.includes("câble"))) ||
          (target === "beauty" && (catSlug === "beauty" || catId.includes("c1000000-0000-0000-0000-000000000003") || catName.includes("beauté") || catName.includes("soin"))) ||
          (target === "sport" && (catSlug === "sport" || catId.includes("c1000000-0000-0000-0000-000000000009") || catName.includes("sport") || catName.includes("fitness")))
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

    return list.map(normalizeProduct);
  } catch (err) {
    return PRODUCTS.map(mapLocalProductToCatalogProduct);
  }
}

/**
 * Fetch active products for the public catalog (live Supabase query + API + fallback).
 */
export async function getPublicProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    const deletedIds = new Set(getStoredDeletedProductIds());
    const productMap = new Map<string, Product>();

    // 1. Query live Supabase database FIRST (absolute source of truth)
    try {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const isUUID = options.categorySlug && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(options.categorySlug);
      if (isUUID && options.categorySlug !== "all") {
        query = query.eq("category_id", options.categorySlug);
      }

      const { data: dbProducts, error } = await query;
      if (!error && dbProducts && dbProducts.length > 0) {
        for (const rawP of dbProducts) {
          const p = normalizeProduct(rawP);
          // Live Supabase products are always trusted
          productMap.set(p.id, p);
        }
      }
    } catch (dbErr) {
      console.warn("[getPublicProducts] Supabase direct query notice:", dbErr);
    }

    // 2. Fetch from Server API route /api/products
    if (typeof window !== "undefined") {
      try {
        let apiUrl = "/api/products";
        const params = new URLSearchParams();
        if (options.categorySlug && options.categorySlug !== "all") {
          params.append("cat", options.categorySlug);
        }
        if (options.search && options.search.trim()) {
          params.append("q", options.search.trim());
        }
        const qs = params.toString();
        if (qs) apiUrl += `?${qs}`;

        const res = await fetch(apiUrl, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.products && Array.isArray(json.products)) {
            for (const rawP of json.products) {
              const p = normalizeProduct(rawP);
              if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
                if (!p.status || p.status === "active") {
                  if (!productMap.has(p.id)) {
                    productMap.set(p.id, p);
                  }
                }
              }
            }
          }
        }
      } catch (apiErr) {
        console.warn("[getPublicProducts] API fetch notice:", apiErr);
      }
    }

    // 3. Add any custom products from local storage / memory
    const custom = getStoredCustomProducts();
    for (const p of custom) {
      if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
        if (!productMap.has(p.id)) {
          productMap.set(p.id, p);
        }
      }
    }

    // 4. Add base catalog products from lib/products.ts if not already present or modified
    for (const raw of PRODUCTS) {
      const p = mapLocalProductToCatalogProduct(raw);
      if (!productMap.has(p.id) && !deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
        productMap.set(p.id, p);
      }
    }

    let list = Array.from(productMap.values());

    // Only active products on the public store
    list = list.filter((p) => !p.status || p.status === "active");

    // Sort to ensure custom & newest products appear at the top
    list.sort((a, b) => {
      const aIsCustom = a.id?.startsWith("custom_") || a.id?.startsWith("prod_") || !PRODUCTS.some(raw => raw.id === a.id);
      const bIsCustom = b.id?.startsWith("custom_") || b.id?.startsWith("prod_") || !PRODUCTS.some(raw => raw.id === b.id);
      if (aIsCustom && !bIsCustom) return -1;
      if (!aIsCustom && bIsCustom) return 1;
      const aTime = (a as any).updated_at ? new Date((a as any).updated_at).getTime() : ((a as any).created_at ? new Date((a as any).created_at).getTime() : 0);
      const bTime = (b as any).updated_at ? new Date((b as any).updated_at).getTime() : ((b as any).created_at ? new Date((b as any).created_at).getTime() : 0);
      return bTime - aTime;
    });

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
          (target === "electronics" && (catSlug === "electronics" || catId.includes("c1000000-0000-0000-0000-000000000001") || catName.includes("high-tech") || catName.includes("phone") || catName.includes("téléphone") || catName.includes("coque") || catName.includes("chargeur") || catName.includes("câble"))) ||
          (target === "beauty" && (catSlug === "beauty" || catId.includes("c1000000-0000-0000-0000-000000000003") || catName.includes("beauté") || catName.includes("soin"))) ||
          (target === "sport" && (catSlug === "sport" || catId.includes("c1000000-0000-0000-0000-000000000012") || catId.includes("c1000000-0000-0000-0000-000000000009") || catName.includes("sport") || catName.includes("fitness"))) ||
          (target === "fashion" && (catSlug === "fashion" || catId.includes("c1000000-0000-0000-0000-000000000002") || catName.includes("mode") || catName.includes("chaussure"))) ||
          (target === "mode-pagne-africain" && (catSlug === "mode-pagne-africain" || catId.includes("c1000000-0000-0000-0000-000000000011") || catName.includes("pagne") || catName.includes("africain")))
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

    return list.map(normalizeProduct);
  } catch (err) {
    return getPublicProductsSync(options);
  }
}

/**
 * Fetch a single product by ID or slug (from live Supabase DB or local catalogue).
 */
export async function getProductByIdOrSlug(idOrSlug: string, allowInactive: boolean = false): Promise<Product | null> {
  try {
    const deletedIds = new Set(getStoredDeletedProductIds());

    // 1. Try live Supabase DB FIRST (source of truth)
    try {
      const supabase = createClient();
      const { data: dbProd, error } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle();

      if (!error && dbProd) {
        const p = normalizeProduct(dbProd);
        if (!allowInactive && p.status && p.status !== "active") {
          return null;
        }
        return p;
      }
    } catch {}

    if (deletedIds.has(idOrSlug) || deletedIds.has(`product-${idOrSlug}`)) return null;

    // 2. Try fetching from server API route
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/products?id=${encodeURIComponent(idOrSlug)}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.product && !deletedIds.has(json.product.id) && !deletedIds.has(json.product.slug)) {
            const p = normalizeProduct(json.product);
            if (!allowInactive && p.status && p.status !== "active") {
              return null;
            }
            return p;
          }
        }
      } catch {}
    }

    // 3. Fallback to local custom products ONLY if not marked as deleted
    const custom = getStoredCustomProducts();
    const foundCustom = custom.find((p) => p.id === idOrSlug || p.slug === idOrSlug || `product-${p.id}` === idOrSlug);
    if (foundCustom && !deletedIds.has(foundCustom.id) && !deletedIds.has(foundCustom.slug)) {
      if (!allowInactive && foundCustom.status && foundCustom.status !== "active") {
        return null;
      }
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
