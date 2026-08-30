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
      const list = JSON.parse(raw) as any[];
      return list.map((p) => {
        const rawList: string[] = [];
        if (Array.isArray(p.images) && p.images.length > 0) {
          for (const item of p.images) {
            if (typeof item === "string" && item.trim()) rawList.push(item.trim());
            else if (item && typeof item === "object") {
              const u = item.public_image_url || item.url || item.src || item.image_url;
              if (typeof u === "string" && u.trim()) rawList.push(u.trim());
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
        p.images = rawList.map((url, i) => ({
          id: `img-${p.id || "prod"}-${i}`,
          product_id: p.id || "",
          public_image_url: url,
          position: i,
          is_primary: i === 0,
        }));
        return p as Product;
      });
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
    const isAdmin = searchParams.get("admin") === "true" || searchParams.get("includeInactive") === "true";

    const deletedIds = readDeletedIdsFromFile();
    const deletedSet = new Set(deletedIds);
    const productMap = new Map<string, Product>();
    const seenSlugs = new Set<string>();

    // 1. Load persistent custom products from server disk (reflects real-time admin edits/status)
    const customFromFile = readCustomProductsFromFile();
    for (const p of customFromFile) {
      if (!deletedSet.has(p.id) && !deletedSet.has(p.slug) && !deletedSet.has(`product-${p.id}`)) {
        productMap.set(p.id, p);
        if (p.slug) seenSlugs.add(p.slug);
      }
    }

    // 2. Query Supabase database
    try {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        query = query.eq("status", "active");
      }

      const { data: dbProducts, error } = await query;

      if (!error && dbProducts && dbProducts.length > 0) {
        for (const p of dbProducts) {
          if (!deletedSet.has(p.id) && !deletedSet.has(p.slug) && !deletedSet.has(`product-${p.id}`)) {
            if (!productMap.has(p.id)) {
              productMap.set(p.id, p as Product);
            }
            if (p.slug) seenSlugs.add(p.slug);
          }
        }
      }
    } catch {}

    // 3. Add base static products
    for (const raw of PRODUCTS) {
      const slugKey = `product-${raw.id}`;
      if (!productMap.has(raw.id) && !seenSlugs.has(slugKey) && !seenSlugs.has(raw.id) && !deletedSet.has(raw.id) && !deletedSet.has(slugKey)) {
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
        if (!isAdmin && single.status && single.status !== "active") {
          return NextResponse.json({ success: false, error: "Produit inactif ou indisponible" }, { status: 404 });
        }
        return NextResponse.json({ success: true, product: single, deletedIds });
      }
    }

    // Filter inactive products for public requests
    if (!isAdmin) {
      list = list.filter((p) => !p.status || p.status === "active");
    }

    if (category && category !== "all") {
      const target = category.toLowerCase();
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

    return NextResponse.json({ success: true, products: list, count: list.length, deletedIds });
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

      // Also upsert batch to Supabase
      try {
        const supabase = createClient();
        for (const p of incomingProducts) {
          if (p && p.name) {
            await supabase.from("products").upsert({
              id: p.id.startsWith("custom_") || p.id.startsWith("prod_") ? undefined : p.id,
              name: p.name,
              slug: p.slug,
              short_description: p.short_description,
              description: p.description,
              category_id: p.category_id,
              subcategory: p.subcategory,
              price: p.price,
              cargolink_margin_percent: p.cargolink_margin_percent ?? 10,
              air_freight_rate_per_kg: p.air_freight_rate_per_kg ?? 2000,
              sea_freight_rate_per_cbm: p.sea_freight_rate_per_cbm ?? 2000,
              currency: p.currency || "FCFA",
              stock_quantity: p.stock_quantity ?? 100,
              minimum_order_quantity: p.minimum_order_quantity ?? 1,
              country_of_origin: p.country_of_origin || "Hub Asie & International",
              weight: p.weight ?? 0.5,
              length: p.length ?? 10,
              width: p.width ?? 8,
              height: p.height ?? 5,
              available_shipping_modes: p.available_shipping_modes || ["air", "sea"],
              estimated_delivery_time: p.estimated_delivery_time || "5 - 15 jours (Aérien)",
              status: p.status || "active",
              is_demo: p.is_demo ?? false,
              is_featured: p.is_featured ?? true,
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (dbErr) {
        console.warn("[API Products] Supabase batch upsert notice:", dbErr);
      }

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

    // Upsert into Supabase database
    try {
      const supabase = createClient();
      const payload: any = {
        name: product.name,
        slug: product.slug,
        short_description: product.short_description || `${product.name} - Produit certifié avec expédition rapide.`,
        description: product.description || `Découvrez ${product.name}, disponible au meilleur prix avec contrôle qualité.`,
        category_id: product.category_id || null,
        subcategory: product.subcategory || null,
        price: Number(product.price) || 0,
        cargolink_margin_percent: Number(product.cargolink_margin_percent ?? 10),
        air_freight_rate_per_kg: Number(product.air_freight_rate_per_kg ?? 2000),
        sea_freight_rate_per_cbm: Number(product.sea_freight_rate_per_cbm ?? 2000),
        currency: product.currency || "FCFA",
        stock_quantity: Number(product.stock_quantity ?? 100),
        minimum_order_quantity: Number(product.minimum_order_quantity ?? 1),
        country_of_origin: product.country_of_origin || "Hub Asie & International",
        weight: Number(product.weight ?? 0.5),
        length: Number(product.length ?? 10),
        width: Number(product.width ?? 8),
        height: Number(product.height ?? 5),
        available_shipping_modes: product.available_shipping_modes || ["air", "sea"],
        estimated_delivery_time: product.estimated_delivery_time || "5 - 15 jours (Aérien)",
        status: product.status || "active",
        is_demo: product.is_demo ?? false,
        is_featured: product.is_featured ?? true,
        updated_at: new Date().toISOString()
      };

      // If valid UUID, pass id for upsert
      const isUUID = product.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
      if (isUUID) {
        payload.id = product.id;
      }

      const { data: dbProd, error: dbErr } = await supabase.from("products").upsert(payload).select().single();
      if (!dbErr && dbProd?.id) {
        // Clear previous images to avoid duplicate image stacking
        await supabase.from("product_images").delete().eq("product_id", dbProd.id);

        const allRawImages: any[] = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
        const seenUrls = new Set<string>();
        const cleanImages: any[] = [];

        for (let i = 0; i < allRawImages.length; i++) {
          const raw = allRawImages[i];
          const url = typeof raw === "string" ? raw : (raw?.public_image_url || "");
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            cleanImages.push({
              product_id: dbProd.id,
              public_image_url: url,
              is_primary: cleanImages.length === 0,
              position: cleanImages.length
            });
          }
        }

        if (cleanImages.length === 0) {
          cleanImages.push({
            product_id: dbProd.id,
            public_image_url: "/images/assets/hero_iphone16.png",
            is_primary: true,
            position: 0
          });
        }

        await supabase.from("product_images").insert(cleanImages);
      }
    } catch (dbErr) {
      console.warn("[API Products] Supabase single upsert notice:", dbErr);
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, slug } = await request.json();
    let deletedIds = readDeletedIdsFromFile();

    if (id) {
      if (!deletedIds.includes(id)) deletedIds.push(id);
      if (!deletedIds.includes(`product-${id}`)) deletedIds.push(`product-${id}`);
    }
    if (slug) {
      if (!deletedIds.includes(slug)) deletedIds.push(slug);
      if (!deletedIds.includes(`product-${slug}`)) deletedIds.push(`product-${slug}`);
    }
    writeDeletedIdsToFile(deletedIds);

    const currentList = readCustomProductsFromFile();
    const updatedList = currentList.filter(
      (p) => p.id !== id && p.slug !== slug && p.id !== `product-${id}` && p.slug !== `product-${slug}`
    );
    writeCustomProductsToFile(updatedList);

    // Also delete from Supabase database
    try {
      const supabase = createClient();
      if (id) {
        await supabase.from("product_images").delete().eq("product_id", id);
        await supabase.from("products").delete().eq("id", id);
      }
      if (slug) {
        await supabase.from("products").delete().eq("slug", slug);
      }
    } catch (dbErr) {
      console.warn("Supabase delete notice:", dbErr);
    }

    return NextResponse.json({ success: true, deleted: { id, slug } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
