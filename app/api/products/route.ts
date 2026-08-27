import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/client";
import { PRODUCTS } from "@/lib/products";
import type { Product } from "@/types/catalog";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "custom-products.json");
const DELETED_FILE = path.join(DATA_DIR, "deleted-products.json");

function ensureDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
    if (!fs.existsSync(DELETED_FILE)) {
      fs.writeFileSync(DELETED_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("[API Products] File system initialization notice:", e);
  }
}

function readCustomProductsFromFile(): Product[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      return JSON.parse(raw) as Product[];
    }
  } catch (e) {
    console.warn("[API Products] Could not read custom products file:", e);
  }
  return [];
}

function writeCustomProductsToFile(products: Product[]) {
  try {
    ensureDataFiles();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (e) {
    console.warn("[API Products] Could not save custom products to file:", e);
  }
}

function readDeletedIdsFromFile(): string[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(DELETED_FILE)) {
      const raw = fs.readFileSync(DELETED_FILE, "utf-8");
      return JSON.parse(raw) as string[];
    }
  } catch (e) {
    console.warn("[API Products] Could not read deleted products file:", e);
  }
  return [];
}

function writeDeletedIdsToFile(ids: string[]) {
  try {
    ensureDataFiles();
    fs.writeFileSync(DELETED_FILE, JSON.stringify(ids, null, 2), "utf-8");
  } catch (e) {
    console.warn("[API Products] Could not save deleted ids to file:", e);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("cat");
    const search = searchParams.get("q");
    const idParam = searchParams.get("id");

    const deletedIds = readDeletedIdsFromFile();
    const deletedSet = new Set(deletedIds);
    const productMap = new Map<string, Product>();

    // 1. Load persistent custom products from server disk
    const customFromFile = readCustomProductsFromFile();
    for (const p of customFromFile) {
      if (!deletedSet.has(p.id) && !deletedSet.has(p.slug)) {
        productMap.set(p.id, p);
      }
    }

    // 2. Try querying Supabase if available
    try {
      const supabase = createClient();
      const { data: dbProducts, error } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .order("created_at", { ascending: false });

      if (!error && dbProducts && dbProducts.length > 0) {
        for (const p of dbProducts) {
          if (!deletedSet.has(p.id) && !deletedSet.has(p.slug)) {
            productMap.set(p.id, p as Product);
          }
        }
      }
    } catch {}

    // 3. Add base static products
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

    // Single item query
    if (idParam) {
      const single = list.find((p) => p.id === idParam || p.slug === idParam || `product-${p.id}` === idParam);
      if (single) {
        return NextResponse.json({ success: true, product: single });
      }
    }

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
          (p.short_description || "").toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, products: list, count: list.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a batch sync request
    if (body && Array.isArray(body.products)) {
      const incomingProducts: Product[] = body.products;
      const currentList = readCustomProductsFromFile();
      let deletedIds = readDeletedIdsFromFile();

      const existingMap = new Map<string, Product>();
      for (const p of currentList) {
        existingMap.set(p.id, p);
      }

      for (const p of incomingProducts) {
        if (p && p.id && p.name) {
          existingMap.set(p.id, p);
          deletedIds = deletedIds.filter((id) => id !== p.id && id !== p.slug);
        }
      }

      const mergedList = Array.from(existingMap.values());
      writeCustomProductsToFile(mergedList);
      writeDeletedIdsToFile(deletedIds);

      return NextResponse.json({
        success: true,
        message: `${incomingProducts.length} produits synchronisés avec succès`,
        count: mergedList.length
      });
    }

    const product: Product = body;
    if (!product || !product.name) {
      return NextResponse.json({ success: false, error: "Nom de produit requis" }, { status: 400 });
    }

    // Un-delete if previously deleted
    let deletedIds = readDeletedIdsFromFile();
    deletedIds = deletedIds.filter(
      (id) => id !== product.id && id !== product.slug
    );
    writeDeletedIdsToFile(deletedIds);

    // Save to persistent file
    const currentList = readCustomProductsFromFile();
    const updatedList = currentList.filter(
      (p) => p.id !== product.id && p.slug !== product.slug
    );
    updatedList.unshift(product);
    writeCustomProductsToFile(updatedList);

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, slug } = await request.json();
    let deletedIds = readDeletedIdsFromFile();

    if (id && !deletedIds.includes(id)) {
      deletedIds.push(id);
    }
    if (slug && !deletedIds.includes(slug)) {
      deletedIds.push(slug);
    }
    writeDeletedIdsToFile(deletedIds);

    const currentList = readCustomProductsFromFile();
    const updatedList = currentList.filter(
      (p) => p.id !== id && p.slug !== slug
    );
    writeCustomProductsToFile(updatedList);

    return NextResponse.json({ success: true, deleted: { id, slug } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
