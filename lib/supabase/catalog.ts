import { createClient } from "@/lib/supabase/client";
import type { Category, Product, ProductFilterOptions, ProductStatus } from "@/types/catalog";
import { PRODUCTS, getProductById as getLocalProductById } from "@/lib/products";

// Fallback seed categories (All 9 major wholesale categories)
const FALLBACK_CATEGORIES: Category[] = [
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

/**
 * Fetch all active categories from Supabase (with fallback if DB table not yet created).
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    return data as Category[];
  } catch (err) {
    return FALLBACK_CATEGORIES;
  }
}

/**
 * Fetch active products for the public catalog from Supabase.
 */
export async function getPublicProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (options.isFeatured) {
      query = query.eq("is_featured", true);
    }

    if (options.categorySlug && options.categorySlug !== "all") {
      // Find category ID by slug
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", options.categorySlug)
        .single();
      
      if (cat?.id) {
        query = query.eq("category_id", cat.id);
      }
    }

    if (options.search && options.search.trim() !== "") {
      query = query.ilike("name", `%${options.search.trim()}%`);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Map fallback PRODUCTS from lib/products.ts
      let list = PRODUCTS.map((p) => ({
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
        available_shipping_modes: ["air", "sea"],
        estimated_delivery_time: (p as any).estDelivery || "5-15 jours (Air)",
        status: "active" as ProductStatus,
        is_demo: !p.id.startsWith("iphone-"),
        is_featured: (p as any).isPopular || p.id.startsWith("iphone-"),
        condition_state: p.conditionState || null,
        grade: (p.grade as any) || null,
        sim_type: (p.simType as any) || null,
        region_version: (p.regionVersion as any) || null,
        storage_options: p.storageOptions || null,
        battery_health: p.batteryHealth || null,
        images: (p.images || [p.image]).map((url, i) => ({
          id: `img-${p.id}-${i}`,
          product_id: p.id,
          public_image_url: url,
          position: i,
          is_primary: i === 0
        })),
        category: FALLBACK_CATEGORIES.find(c => c.slug === p.category) || null
      }));

      if (options.categorySlug && options.categorySlug !== "all") {
        const catObj = FALLBACK_CATEGORIES.find(c => c.slug === options.categorySlug);
        if (catObj) {
          list = list.filter(p => p.category?.slug === options.categorySlug);
        }
      }

      if (options.conditionState && options.conditionState !== "all") {
        list = list.filter(p => p.condition_state === options.conditionState);
      }

      if (options.search && options.search.trim() !== "") {
        const q = options.search.trim().toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(q) ||
          (p.short_description || "").toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q)
        );
      }

      if (options.isFeatured) {
        list = list.filter(p => p.is_featured);
      }

      if (options.limit) {
        list = list.slice(0, options.limit);
      }

      return list as Product[];
    }

    return data as Product[];
  } catch (err) {
    return [];
  }
}

/**
 * Fetch a single product by ID or slug from Supabase.
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    
    const { data: dataById, error: errorById } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*)")
      .eq("id", idOrSlug)
      .single();

    let data = dataById;
    if (errorById || !data) {
      // Try by slug
      const res = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .eq("slug", idOrSlug)
        .single();
      data = res.data;
    }

    if (!data) {
      // Check local PRODUCTS fallback
      const local = getLocalProductById(idOrSlug);
      if (local) {
        return {
          id: local.id,
          name: local.title,
          slug: `product-${local.id}`,
          short_description: local.subtitle || local.description,
          description: local.description,
          category_id: null,
          subcategory: null,
          price: local.price,
          currency: "FCFA",
          stock_quantity: 100,
          minimum_order_quantity: local.minQty || 1,
          country_of_origin: local.origin || "Hub International",
          weight: parseFloat(local.weight || "0.5"),
          length: parseFloat(local.volume || "0.01"),
          available_shipping_modes: ["air", "sea"],
          estimated_delivery_time: (local as any).estDelivery || "5-15 jours (Air)",
          status: "active",
          is_demo: !local.id.startsWith("iphone-"),
          is_featured: (local as any).isPopular || false,
          condition_state: local.conditionState || null,
          grade: (local.grade as any) || null,
          sim_type: (local.simType as any) || null,
          region_version: (local.regionVersion as any) || null,
          storage_options: local.storageOptions || null,
          battery_health: local.batteryHealth || null,
          images: (local.images || [local.image]).map((url, i) => ({
            id: `img-${local.id}-${i}`,
            product_id: local.id,
            public_image_url: url,
            position: i,
            is_primary: i === 0
          })),
          category: FALLBACK_CATEGORIES.find(c => c.slug === local.category) || null
        } as Product;
      }
      return null;
    }

    return data as Product;
  } catch (err) {
    return null;
  }
}
