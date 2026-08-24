import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { PRODUCTS } from "@/lib/products";
import type { Product } from "@/types/catalog";

// Global server-side runtime store
let globalServerProducts: Product[] = [];
let globalDeletedProductIds: string[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("cat");
    const search = searchParams.get("q");

    // Try reading from Supabase if available
    try {
      const supabase = createClient();
      const { data: dbProducts, error } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .order("created_at", { ascending: false });

      if (!error && dbProducts && dbProducts.length > 0) {
        for (const p of dbProducts) {
          if (!globalDeletedProductIds.includes(p.id) && !globalDeletedProductIds.includes(p.slug)) {
            if (!globalServerProducts.some((existing) => existing.id === p.id)) {
              globalServerProducts.push(p as Product);
            }
          }
        }
      }
    } catch {}

    const deletedSet = new Set(globalDeletedProductIds);
    const productMap = new Map<string, Product>();

    // 1. Put custom & dynamically added products at the very TOP
    for (const p of globalServerProducts) {
      if (!deletedSet.has(p.id) && !deletedSet.has(p.slug)) {
        productMap.set(p.id, p);
      }
    }

    // 2. Add base products
    for (const raw of PRODUCTS) {
      if (!productMap.has(raw.id) && !deletedSet.has(raw.id) && !deletedSet.has(`product-${raw.id}`)) {
        productMap.set(raw.id, {
          id: raw.id,
          name: raw.title,
          slug: `product-${raw.id}`,
          short_description: raw.subtitle || raw.description,
          description: raw.description,
          category_id: null,
          subcategory: null,
          price: raw.price,
          currency: "FCFA",
          stock_quantity: 100,
          minimum_order_quantity: raw.minQty || 1,
          country_of_origin: raw.origin || "Hub International",
          weight: parseFloat(raw.weight || "0.5"),
          length: parseFloat(raw.volume || "0.01"),
          available_shipping_modes: ["air", "sea"],
          estimated_delivery_time: "5-15 jours (Air)",
          status: "active",
          is_demo: false,
          is_featured: true,
          images: (raw.images || [raw.image]).map((url: string, i: number) => ({
            id: `img-${raw.id}-${i}`,
            product_id: raw.id,
            public_image_url: url,
            position: i,
            is_primary: i === 0,
          })),
          category: { id: "cat_base", name: raw.category || "Catalogue", slug: raw.category || "general", is_active: true }
        } as Product);
      }
    }

    let list = Array.from(productMap.values());

    if (category && category !== "all") {
      const target = category.toLowerCase();
      list = list.filter((p) => {
        const catId = (p.category_id || "").toLowerCase();
        const catSlug = (p.category?.slug || "").toLowerCase();
        const catName = (p.category?.name || "").toLowerCase();
        return catId === target || catSlug === target || catName === target;
      });
    }

    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.short_description || "").toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, products: list, count: list.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const product: Product = await request.json();
    if (!product || !product.name) {
      return NextResponse.json({ success: false, error: "Nom de produit requis" }, { status: 400 });
    }

    // Un-delete if previously deleted
    globalDeletedProductIds = globalDeletedProductIds.filter(
      (id) => id !== product.id && id !== product.slug
    );

    // Add or update at index 0 (top of the list)
    globalServerProducts = globalServerProducts.filter(
      (p) => p.id !== product.id && p.slug !== product.slug
    );
    globalServerProducts.unshift(product);

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, slug } = await request.json();
    if (id && !globalDeletedProductIds.includes(id)) {
      globalDeletedProductIds.push(id);
    }
    if (slug && !globalDeletedProductIds.includes(slug)) {
      globalDeletedProductIds.push(slug);
    }
    globalServerProducts = globalServerProducts.filter(
      (p) => p.id !== id && p.slug !== slug
    );
    return NextResponse.json({ success: true, deleted: { id, slug } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
