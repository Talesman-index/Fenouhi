import type { UserRole } from "./supabase";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  original_image_path?: string | null;
  watermarked_image_path?: string | null;
  public_image_url: string;
  alt_text?: string | null;
  position: number;
  is_primary: boolean;
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
  mime_type?: string | null;
  created_at?: string;
}

export type ProductStatus = "draft" | "active" | "out_of_stock" | "inactive" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  category_id?: string | null;
  subcategory?: string | null;
  price: number;
  currency: string;
  stock_quantity: number;
  minimum_order_quantity: number;
  supplier_id?: string | null;
  country_of_origin?: string | null;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  available_shipping_modes: string[];
  estimated_delivery_time?: string | null;
  status: ProductStatus;
  is_demo: boolean;
  is_featured: boolean;
  cargolink_margin_percent?: number | null;
  air_freight_rate_per_kg?: number | null;
  sea_freight_rate_per_cbm?: number | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined relation fields
  category?: Category | null;
  images?: ProductImage[];
}

export interface ProductFilterOptions {
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  status?: ProductStatus | "all";
  isDemo?: boolean | "all";
  isFeatured?: boolean;
  limit?: number;
  page?: number;
}
