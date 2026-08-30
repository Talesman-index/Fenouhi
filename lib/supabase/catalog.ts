import { createClient } from "@/lib/supabase/client";
import type { Category, Product, ProductFilterOptions, ProductStatus } from "@/types/catalog";
import { PRODUCTS, getProductById as getLocalProductById } from "@/lib/products";

// Fallback seed categories (All 9 major wholesale categories)
export const FALLBACK_CATEGORIES: Category[] = [
  { id: "c1000000-0000-0000-0000-000000000001", name: "High-Tech & Electronics", slug: "electronics", description: "Smartphones, montres connectées, écouteurs, casques audio et high-tech.", icon: "Smartphone", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000002", name: "Mode & Chaussures", slug: "fashion", description: "Sneakers, vêtements streetwear, sacs maroquinerie, bijoux et textiles.", icon: "Shirt", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000003", name: "Beauté & Soins", slug: "beauty", description: "Sérums visage, soin de la peau, cosmétiques et équipements esthétiques.", icon: "Sparkles", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000004", name: "Machinerie & Outillage", slug: "machinery", description: "Équipements de travail, gants protection EPI et outillage industriel.", icon: "Wrench", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000005", name: "Maison & Électroménager", slug: "home", description: "Décoration, petit électroménager et articles d'équipement de maison.", icon: "Home", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000006", name: "Pièces Auto & Moto", slug: "automotive", description: "Pièces détachées, éclairage LED et accessoires véhicules.", icon: "Car", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000007", name: "Quincaillerie & Matériaux", slug: "hardware", description: "Matériaux de construction, robinetterie, quincaillerie et outillage.", icon: "Hammer", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000008", name: "Jouets & Puériculture", slug: "toys", description: "Jeux éducatifs, jouets enfants et articles de puériculture.", icon: "Smile", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000009", name: "Sport & Fitness", slug: "sport", description: "Équipements fitness, vêtements sportifs, musculation et articles de plein air.", icon: "Activity", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000010", name: "Vrac & Grossistes", slug: "wholesale", description: "Lots d'articles en vrac et approvisionnement direct usines.", icon: "Package", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000011", name: "Mode Pagne Africain", slug: "mode-pagne-africain", description: "Pagnes traditionnels, wax hollandais, imprimés africains, tenues sur-mesure et accessoires en pagne.", icon: "Sparkles", is_active: true }
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
      setTimeout(() => resolve({ data: null, error: true }), 1500)
    );

    const result: any = await Promise.race([fetchPromise, timeoutPromise]);
    const { data, error } = result || {};

    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    const dbList = data as Category[];
    const dbSlugs = new Set(dbList.map((c) => (c.slug || "").toLowerCase()));
    const dbIds = new Set(dbList.map((c) => (c.id || "").toLowerCase()));
    const missing = FALLBACK_CATEGORIES.filter(
      (fc) => !dbSlugs.has(fc.slug.toLowerCase()) && !dbIds.has(fc.id.toLowerCase())
    );
    return [...dbList, ...missing];
  } catch (err) {
    return FALLBACK_CATEGORIES;
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
 * Normalizes a product so its `images` property is guaranteed to be an array of ProductImage objects with valid `public_image_url`.
 */
export function normalizeProduct(p: any): Product {
  if (!p) return p;

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

  return {
    ...p,
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

let inMemoryCustomProducts: Product[] = [];
let inMemoryDeletedIds: string[] = [];

export function getStoredCustomProducts(): Product[] {
  if (typeof window === "undefined") return inMemoryCustomProducts.map(normalizeProduct);
  try {
    const data = localStorage.getItem("fenou_custom_products");
    const parsed = data ? JSON.parse(data) : [];
    if (parsed && parsed.length > 0) {
      inMemoryCustomProducts = parsed.map(normalizeProduct);
      return inMemoryCustomProducts;
    }
    return inMemoryCustomProducts.map(normalizeProduct);
  } catch {
    return inMemoryCustomProducts.map(normalizeProduct);
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

    // Sort to ensure custom products appear at the top
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
          (target === "electronics" && (catSlug === "electronics" || catName.includes("high-tech") || catName.includes("phone") || catName.includes("téléphone") || catName.includes("coque"))) ||
          (target === "beauty" && (catSlug === "beauty" || catName.includes("beauté") || catName.includes("soin"))) ||
          (target === "sport" && (catSlug === "sport" || catName.includes("sport") || catName.includes("fitness")))
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
 * Fetch active products for the public catalog (live Supabase query + fallback).
 */
export async function getPublicProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    const deletedIds = new Set(getStoredDeletedProductIds());
    const localProducts = getPublicProductsSync(options);
    const productMap = new Map<string, Product>();

    // 1. Local products & custom products
    for (const p of localProducts) {
      if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
        productMap.set(p.id, p);
      }
    }

    // 2. Fetch from Server API route /api/products
    try {
      if (typeof window !== "undefined") {
        const res = await fetch(`/api/products?cat=${options.categorySlug || "all"}&q=${options.search || ""}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.deletedIds && Array.isArray(json.deletedIds)) {
            const existingDel = getStoredDeletedProductIds();
            const mergedDel = Array.from(new Set([...existingDel, ...json.deletedIds]));
            saveStoredDeletedProductIds(mergedDel);
            mergedDel.forEach(id => deletedIds.add(id));

            const currentCustom = getStoredCustomProducts();
            const cleanedCustom = currentCustom.filter(p => !deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`));
            saveStoredCustomProducts(cleanedCustom);
          }

          if (json.products && json.products.length > 0) {
            const customList: Product[] = [];
            for (const rawP of json.products) {
              const p = normalizeProduct(rawP);
              if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
                productMap.set(p.id, p);
                if (p.id?.startsWith("custom_") || p.id?.startsWith("prod_") || !PRODUCTS.some(raw => raw.id === p.id)) {
                  customList.push(p);
                }
              }
            }
            if (customList.length > 0) {
              saveStoredCustomProducts(customList);
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

      const isUUID = options.categorySlug && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(options.categorySlug);
      if (isUUID && options.categorySlug !== "all") {
        query = query.eq("category_id", options.categorySlug);
      }

      const { data: dbProducts, error } = await query;
      if (!error && dbProducts && dbProducts.length > 0) {
        for (const rawP of dbProducts) {
          const p = normalizeProduct(rawP);
          if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
            productMap.set(p.id, p);
          }
        }
      }
    } catch {}

    let list = Array.from(productMap.values());

    // Only active products on the public store
    list = list.filter((p) => !p.status || p.status === "active");

    // Sort to ensure custom products appear at the top
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
          (target === "electronics" && (catSlug === "electronics" || catName.includes("high-tech") || catName.includes("phone") || catName.includes("téléphone") || catName.includes("coque"))) ||
          (target === "beauty" && (catSlug === "beauty" || catName.includes("beauté") || catName.includes("soin"))) ||
          (target === "sport" && (catSlug === "sport" || catName.includes("sport") || catName.includes("fitness")))
        );
      });
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
    if (deletedIds.has(idOrSlug) || deletedIds.has(`product-${idOrSlug}`)) return null;

    // 1. Check local custom products (reflects real-time admin changes)
    const custom = getStoredCustomProducts();
    const foundCustom = custom.find((p) => p.id === idOrSlug || p.slug === idOrSlug || `product-${p.id}` === idOrSlug);
    if (foundCustom && !deletedIds.has(foundCustom.id) && !deletedIds.has(foundCustom.slug)) {
      if (!allowInactive && foundCustom.status && foundCustom.status !== "active") {
        return null;
      }
      return foundCustom;
    }

    // 2. Try fetching from server API (synchronizes custom-products.json)
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/products?id=${encodeURIComponent(idOrSlug)}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.product && !deletedIds.has(json.product.id) && !deletedIds.has(json.product.slug)) {
            const p = json.product as Product;
            if (!allowInactive && p.status && p.status !== "active") {
              return null;
            }
            return p;
          }
        }
      } catch {}
    }

    // 3. Try live Supabase DB
    try {
      const supabase = createClient();
      const { data: dbProd } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle();

      if (dbProd && !deletedIds.has(dbProd.id) && !deletedIds.has(dbProd.slug)) {
        const p = normalizeProduct(dbProd);
        if (!allowInactive && p.status && p.status !== "active") {
          return null;
        }
        return p;
      }
    } catch {}

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
