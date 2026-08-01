import { createClient } from "@/lib/supabase/client";
import type { Category, Product, ProductFilterOptions, ProductStatus } from "@/types/catalog";
import { PRODUCTS, getProductById as getLocalProductById } from "@/lib/products";

// Fallback seed categories
const FALLBACK_CATEGORIES: Category[] = [
  { id: "c1000000-0000-0000-0000-000000000001", name: "High-Tech & Audio", slug: "electronics", description: "Montres connectées, écouteurs, casques audio et accessoires électroniques.", icon: "Smartphone", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000002", name: "Mode & Chaussures", slug: "fashion", description: "Sneakers, vestes, t-shirts, bijoux et vêtements de travail usine.", icon: "Shirt", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000003", name: "Beauté & Soins", slug: "beauty", description: "Sérums visage, soins cosmétiques et matériel esthétique.", icon: "Sparkles", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000004", name: "Outillage & PME", slug: "machinery", description: "Gants de protection, équipements de travail et machines industrielles.", icon: "Wrench", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000005", name: "Agro-alimentaire & Vrac", slug: "agro", description: "Emballages alimentaires, conditionnements et produits bruts.", icon: "ShoppingBag", is_active: true },
  { id: "c1000000-0000-0000-0000-000000000006", name: "Vrac & Grossistes", slug: "wholesale", description: "Lots d'articles en gros import direct usines Chine.", icon: "Package", is_active: true }
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
        country_of_origin: "Chine",
        weight: parseFloat(p.weight || "0.5"),
        available_shipping_modes: ["air", "sea"],
        estimated_delivery_time: (p as any).estDelivery || "7-10 jours",
        status: "active" as ProductStatus,
        is_demo: true,
        is_featured: (p as any).isPopular || false,
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
          country_of_origin: "Chine",
          weight: parseFloat(local.weight || "0.5"),
          length: parseFloat(local.volume || "0.01"),
          available_shipping_modes: ["air", "sea"],
          estimated_delivery_time: (local as any).estDelivery || "7-10 jours",
          status: "active",
          is_demo: true,
          is_featured: (local as any).isPopular || false,
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
