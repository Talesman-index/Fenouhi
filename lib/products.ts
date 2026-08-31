// Single Source of Truth: Catalogue unifié CargoLink Africa & Fenouhi
// Tous les produits sont alimentés directement depuis data/custom-products.json et Supabase.

import rawCustomProducts from "@/data/custom-products.json";
import rawDeletedIds from "@/data/deleted-products.json";

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number; // prix unitaire FCFA
  wholesale_price_5_units?: number; // prix gros dès 5 unités
  oldPrice?: number;
  minQty: number;
  maxQty?: number;
  image: string;
  images: string[];
  category: string;
  badge?: string;
  origin: string;
  weight: string; // ex: "0.35 kg"
  volume: string; // ex: "0.002 CBM"
  rating: number;
  reviewsCount: number;
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
  reviews: { author: string; rating: number; comment: string; date: string }[];
  related: string[]; // IDs of related products
  conditionState?: "Scellé" | "Reconditionné" | "Occasion";
  grade?: string;
  simType?: string;
  regionVersion?: string;
  storageOptions?: string[];
  batteryHealth?: string;
  driveFolderUrl?: string;
  has_variants?: boolean;
  attributes_definition?: any;
  variants?: any;
}

const deletedSet = new Set(rawDeletedIds as string[]);

export const PRODUCTS: Product[] = (rawCustomProducts as any[])
  .filter((p) => !deletedSet.has(p.id) && !deletedSet.has(p.slug) && (!p.status || p.status === "active"))
  .map((p) => {
    const images: string[] = (p.images || [])
      .map((img: any) => (typeof img === "string" ? img : img?.public_image_url))
      .filter(Boolean);
    if (images.length === 0) images.push(p.image || "/images/assets/hero_iphone16.png");

    return {
      id: p.id,
      title: p.name || p.title || "Produit",
      subtitle: p.short_description || p.subtitle || "",
      price: Number(p.price) || 0,
      wholesale_price_5_units: p.wholesale_price_5_units ? Number(p.wholesale_price_5_units) : undefined,
      oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
      minQty: Number(p.minimum_order_quantity || p.minQty) || 1,
      image: images[0],
      images: images,
      category: p.category?.slug || p.category_id || p.category || "electronics",
      badge: p.badge || (p.is_featured ? "CERTIFIÉ" : undefined),
      origin: p.country_of_origin || p.origin || "Hub International",
      weight: typeof p.weight === "number" ? `${p.weight} kg` : (p.weight || "0.5 kg"),
      volume: typeof p.length === "number" ? `${((p.length * (p.width || 8) * (p.height || 5)) / 1000000).toFixed(4)} CBM` : (p.volume || "0.002 CBM"),
      rating: Number(p.rating) || 4.9,
      reviewsCount: Number(p.reviewsCount) || 120,
      description: p.description || "",
      features: Array.isArray(p.features) && p.features.length > 0 ? p.features : ["Produit d'origine certifiée", "Contrôle qualité strict à l'usine"],
      specifications: Array.isArray(p.specifications) ? p.specifications : [],
      reviews: Array.isArray(p.reviews) ? p.reviews : [],
      related: Array.isArray(p.related) ? p.related : [],
      has_variants: Boolean(p.has_variants),
      attributes_definition: p.attributes_definition || null,
      variants: p.variants || null,
    };
  });

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id || `product-${p.id}` === id || (p as any).slug === id);
}
