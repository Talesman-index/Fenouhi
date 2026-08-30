"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/admin/activity-logger";
import type { Product, Category, ProductStatus, ProductAttributeDefinition, ProductVariant } from "@/types/catalog";
import { getPresetAttributesForCategory, generateCartesianVariants } from "@/lib/variant-presets";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
  Box,
  MapPin,
  Sparkles,
  X,
  ShieldCheck,
  Archive,
  RefreshCw,
  DollarSign,
  Zap,
  Camera,
  Images,
  Info,
  Layers,
  Check,
  Copy,
  Wand2,
  CheckSquare,
  Square
} from "lucide-react";

import { PRODUCTS } from "@/lib/products";
import {
  FALLBACK_CATEGORIES,
  getPublicProductsSync,
  getStoredCustomProducts,
  saveStoredCustomProducts,
  getStoredDeletedProductIds,
  saveStoredDeletedProductIds,
  getProductImageUrl
} from "@/lib/supabase/catalog";
import { addRealNotification } from "@/lib/admin/notifications";

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [demoFilter, setDemoFilter] = useState<string>("all"); // 'all' | 'real' | 'demo'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Modal Active Tab State
  const [activeTab, setActiveTab] = useState<"info" | "variants" | "pricing" | "media" | "specs">("info");

  // Custom Delete Modal & Toast State
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: "success" | "error" | "info" }>({
    show: false,
    title: "",
    message: "",
    type: "success"
  });

  const showToast = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3800);
  };

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState<number>(5000);
  const [wholesalePrice5, setWholesalePrice5] = useState<number>(0);
  const [currency, setCurrency] = useState("FCFA");
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState<number>(1);
  const [countryOfOrigin, setCountryOfOrigin] = useState("Hub Asie & International");
  const [weight, setWeight] = useState<number>(0.5);
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(8);
  const [height, setHeight] = useState<number>(5);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("15j (Aérien Express) / 30j (Aérien Simple) / 50–95j (Maritime)");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  
  // Dynamic Product Variants & Attributes State
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [selectedProductType, setSelectedProductType] = useState<string>("phones");
  const [attributesDefinition, setAttributesDefinition] = useState<ProductAttributeDefinition[]>([]);
  const [checkedOptions, setCheckedOptions] = useState<Record<string, string[]>>({});
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newAttrInputName, setNewAttrInputName] = useState<string>("");
  const [newAttrValueInput, setNewAttrValueInput] = useState<Record<string, string>>({});
  const [batchPriceInput, setBatchPriceInput] = useState<string>("");
  const [batchWholesaleInput, setBatchWholesaleInput] = useState<string>("");
  const [batchStockInput, setBatchStockInput] = useState<string>("");

  // Custom CargoLink Margin & Freight Controls
  const [cargolinkMarginPercent, setCargolinkMarginPercent] = useState<number>(10);
  const [airFreightRatePerKg, setAirFreightRatePerKg] = useState<number>(2000);
  const [seaFreightRatePerCbm, setSeaFreightRatePerCbm] = useState<number>(2000);

  // Image Upload & Gallery State
  const [imageUrl, setImageUrl] = useState("/images/assets/item_1.jpg");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [categoryFilter, statusFilter, demoFilter]);

  async function fetchCategories() {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*").order("name", { ascending: true });
      if (data && data.length > 0) {
        const dbList = data as Category[];
        const dbSlugs = new Set(dbList.map((c) => (c.slug || "").toLowerCase()));
        const dbIds = new Set(dbList.map((c) => (c.id || "").toLowerCase()));
        const missing = FALLBACK_CATEGORIES.filter(
          (fc) => !dbSlugs.has(fc.slug.toLowerCase()) && !dbIds.has(fc.id.toLowerCase())
        );
        setCategories([...dbList, ...missing]);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }
    } catch {
      setCategories(FALLBACK_CATEGORIES);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const deletedIds = new Set(getStoredDeletedProductIds());
      const customProducts = getStoredCustomProducts();
      const productMap = new Map<string, Product>();

      // 1. Query Server API route /api/products?admin=true (persisted in data/custom-products.json)
      let serverCustomProducts: Product[] = [];
      try {
        const res = await fetch(`/api/products?admin=true`, { cache: "no-store" });
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
            for (const p of json.products) {
              if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
                productMap.set(p.id, p as Product);
                if (p.id?.startsWith("custom_") || p.id?.startsWith("prod_") || !PRODUCTS.some(raw => raw.id === p.id)) {
                  serverCustomProducts.push(p as Product);
                }
              }
            }
          }
        }
      } catch (e) {}

      // 2. Add local custom products from client localStorage (ensures instant sync)
      let hasNewLocalProductsToSync = false;
      const unSyncedProducts: Product[] = [];

      for (const p of customProducts) {
        if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
          if (!productMap.has(p.id)) {
            hasNewLocalProductsToSync = true;
            unSyncedProducts.push(p);
          }
          productMap.set(p.id, p);
        }
      }

      // Auto-sync un-synced local products to server disk & Supabase
      if (hasNewLocalProductsToSync && unSyncedProducts.length > 0) {
        try {
          fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: unSyncedProducts })
          }).catch(() => {});
        } catch {}
      }

      // Sync server custom products back to localStorage as backup
      if (serverCustomProducts.length > 0) {
        const existingLocal = getStoredCustomProducts();
        const mergedCustom = [...existingLocal];
        for (const sp of serverCustomProducts) {
          if (!mergedCustom.some(lp => lp.id === sp.id)) {
            mergedCustom.push(sp);
          }
        }
        saveStoredCustomProducts(mergedCustom);
      }

      // 3. Query Supabase for any additional/updated DB products
      try {
        const supabase = createClient();
        const { data: dbProducts } = await supabase
          .from("products")
          .select("*, category:categories(*), images:product_images(*)")
          .order("created_at", { ascending: false });

        if (dbProducts && dbProducts.length > 0) {
          for (const p of dbProducts) {
            if (!deletedIds.has(p.id) && !deletedIds.has(p.slug) && !deletedIds.has(`product-${p.id}`)) {
              if (!productMap.has(p.id)) {
                productMap.set(p.id, p as Product);
              }
            }
          }
        }
      } catch (e) {
        // Fallback to local catalog
      }

      // 4. Put remaining base catalog products if not already edited or deleted
      for (const raw of PRODUCTS) {
        if (!productMap.has(raw.id) && !deletedIds.has(raw.id) && !deletedIds.has(`product-${raw.id}`)) {
          const rawImages = (raw.images || (raw.image ? [raw.image] : [])).filter(Boolean);
          if (rawImages.length === 0) rawImages.push("/images/assets/hero_iphone16.png");
          const matchedCat = categories.find(c => c.slug === raw.category || c.id === raw.category) || { id: "cat_base", name: raw.category || "Catalogue", slug: raw.category || "general", is_active: true };

          productMap.set(raw.id, {
            id: raw.id,
            name: raw.title,
            slug: `product-${raw.id}`,
            short_description: raw.subtitle || raw.description,
            description: raw.description,
            category_id: matchedCat.id || null,
            subcategory: null,
            price: raw.price,
            cargolink_margin_percent: 10,
            air_freight_rate_per_kg: 0,
            sea_freight_rate_per_cbm: 0,
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
            images: rawImages.map((url: string, i: number) => ({
              id: `img-${raw.id}-${i}`,
              product_id: raw.id,
              public_image_url: url,
              position: i,
              is_primary: i === 0,
            })),
            category: matchedCat
          } as Product);
        }
      }

      let allProducts = Array.from(productMap.values());

      // 5. Filter by category
      if (categoryFilter !== "all") {
        const target = categoryFilter.toLowerCase();
        allProducts = allProducts.filter((p) => {
          const catId = (p.category_id || "").toLowerCase();
          const catSlug = (p.category?.slug || "").toLowerCase();
          const catName = (p.category?.name || "").toLowerCase();
          return (
            catId === target ||
            catSlug === target ||
            catName === target ||
            (target.includes("c1000000-0000-0000-0000-000000000003") && (catSlug === "beauty" || catName.includes("beauté") || catName.includes("soin"))) ||
            (target === "beauty" && (catSlug === "beauty" || catName.includes("beauté") || catName.includes("soin"))) ||
            (target === "sport" && (catSlug === "sport" || catName.includes("sport") || catName.includes("fitness")))
          );
        });
      }

      // 6. Filter by status
      if (statusFilter !== "all") {
        allProducts = allProducts.filter((p) => p.status === statusFilter);
      }

      // 7. Filter by demo mode
      if (demoFilter === "real") {
        allProducts = allProducts.filter((p) => !p.is_demo);
      } else if (demoFilter === "demo") {
        allProducts = allProducts.filter((p) => p.is_demo);
      }

      // Sort so custom & newly created products always appear at the top
      allProducts.sort((a, b) => {
        const aIsCustom = a.id?.startsWith("custom_") || a.id?.startsWith("prod_") || !PRODUCTS.some(raw => raw.id === a.id);
        const bIsCustom = b.id?.startsWith("custom_") || b.id?.startsWith("prod_") || !PRODUCTS.some(raw => raw.id === b.id);
        if (aIsCustom && !bIsCustom) return -1;
        if (!aIsCustom && bIsCustom) return 1;
        const aTime = a.updated_at ? new Date(a.updated_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
        const bTime = b.updated_at ? new Date(b.updated_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
        return bTime - aTime;
      });

      setProducts(allProducts);
    } catch (err) {
      console.error("Error loading products:", err);
      setProducts(getPublicProductsSync());
    } finally {
      setLoading(false);
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingProduct) {
      setSlug(generateSlug(val));
    }
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("/images/assets/item_1.jpg");
      reader.readAsDataURL(file);
    });
  };

  // Image Upload Handlers
  const handleMainImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 800, 0.75);
      setImageUrl(compressed);
    }
  };

  const handleGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file, 800, 0.75);
        if (compressed && !galleryUrls.includes(compressed) && !newUrls.includes(compressed)) {
          newUrls.push(compressed);
        }
      }
      if (newUrls.length > 0) {
        setGalleryUrls((prev) => [...prev, ...newUrls]);
      }
    }
    e.target.value = "";
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant Management Handlers (Simplified 3-Part Flow)
  const handleSelectProductType = (typeKey: string) => {
    setSelectedProductType(typeKey);
    const preset = getPresetAttributesForCategory(typeKey, name);
    setAttributesDefinition(preset);
    // Pre-check reasonable defaults per characteristic
    const initialChecked: Record<string, string[]> = {};
    preset.forEach((attr) => {
      if (attr.name === "Modèle") {
        initialChecked[attr.name] = ["Simple", "Pro", "Pro Max"].filter((p) => attr.values.includes(p));
      } else if (attr.name === "Pointure") {
        initialChecked[attr.name] = ["39", "40", "41", "42", "43"].filter((p) => attr.values.includes(p));
      } else if (attr.name === "Profil") {
        initialChecked[attr.name] = ["Adulte"].filter((p) => attr.values.includes(p));
      } else if (attr.name === "Taille") {
        initialChecked[attr.name] = ["M", "L", "XL"].filter((p) => attr.values.includes(p));
      } else {
        initialChecked[attr.name] = attr.values.slice(0, Math.min(attr.values.length, 3));
      }
    });
    setCheckedOptions(initialChecked);
    setHasVariants(true);
  };

  const handleToggleOptionValue = (attrName: string, value: string) => {
    setCheckedOptions((prev) => {
      const currentList = prev[attrName] || [];
      const exists = currentList.includes(value);
      const updatedList = exists
        ? currentList.filter((v) => v !== value)
        : [...currentList, value];
      return { ...prev, [attrName]: updatedList };
    });
    setHasVariants(true);
  };

  const handleAddCustomValue = (attrName: string) => {
    const val = (newAttrValueInput[attrName] || "").trim();
    if (!val) return;
    setAttributesDefinition((prev) =>
      prev.map((attr) => {
        if (attr.name === attrName && !attr.values.includes(val)) {
          return { ...attr, values: [...attr.values, val] };
        }
        return attr;
      })
    );
    setCheckedOptions((prev) => {
      const currentList = prev[attrName] || [];
      if (!currentList.includes(val)) {
        return { ...prev, [attrName]: [...currentList, val] };
      }
      return prev;
    });
    setNewAttrValueInput((prev) => ({ ...prev, [attrName]: "" }));
  };

  const handleAddAttribute = () => {
    if (!newAttrInputName.trim()) return;
    const trimmed = newAttrInputName.trim();
    if (attributesDefinition.some((a) => a.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast("Propriété existante", "Cette caractéristique est déjà présente.", "info");
      return;
    }
    setAttributesDefinition((prev) => [...prev, { name: trimmed, values: [] }]);
    setNewAttrInputName("");
    setHasVariants(true);
  };

  const handleRemoveAttribute = (attrIndex: number) => {
    setAttributesDefinition((prev) => prev.filter((_, i) => i !== attrIndex));
  };

  const handleCreateVariantsFromChecked = () => {
    const activeDefs: ProductAttributeDefinition[] = attributesDefinition
      .map((attr) => ({
        name: attr.name,
        values: (checkedOptions[attr.name] || []).filter((v) => v.trim() !== ""),
      }))
      .filter((attr) => attr.values.length > 0);

    if (activeDefs.length === 0) {
      showToast("Options requises", "Veuillez cocher au moins une option pour créer les variantes.", "error");
      return;
    }

    const generated = generateCartesianVariants(
      activeDefs,
      price,
      wholesalePrice5 > 0 ? wholesalePrice5 : null,
      stockQuantity > 0 ? Math.round(stockQuantity / Math.max(1, activeDefs.length)) : 10,
      slug || name
    );

    setVariants(generated);
    setHasVariants(true);
    showToast("Variantes créées", `${generated.length} versions créées. Vous pouvez maintenant renseigner leurs prix et stocks.`, "success");
  };

  const handleUpdateVariantField = (
    variantId: string,
    field: keyof ProductVariant,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (variantId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const openCreateModal = () => {
    try {
      setIsModalOpen(true);
      setEditingProduct(null);
      setActiveTab("info");
      setName("");
      setSlug("");
      setShortDescription("");
      setDescription("");
      const defaultCatId =
        categoryFilter !== "all"
          ? categoryFilter
          : categories && categories.length > 0
          ? categories[0].id
          : "c1000000-0000-0000-0000-000000000001";
      setCategoryId(defaultCatId);
      setSubcategory("Accessoires & Coques");
      setPrice(3500);
      setWholesalePrice5(2800);
      setCargolinkMarginPercent(10);
      setAirFreightRatePerKg(0);
      setSeaFreightRatePerCbm(0);
      setCurrency("FCFA");
      setStockQuantity(100);
      setMinimumOrderQuantity(1);
      setCountryOfOrigin("Hub Asie & International");
      setWeight(0.5);
      setLength(10);
      setWidth(8);
      setHeight(5);
      setAvailableShippingModes(["air", "sea"]);
      setEstimatedDeliveryTime("15j (Aérien Express) / 30j (Aérien Simple) / 50–95j (Maritime)");
      setStatus("active");
      setIsDemo(false);
      setIsFeatured(true);
      setHasVariants(false);
      setSelectedProductType("phones");
      const initialPreset = getPresetAttributesForCategory("phones", "");
      setAttributesDefinition(initialPreset);
      const initChecked: Record<string, string[]> = {};
      initialPreset.forEach((attr) => {
        initChecked[attr.name] = attr.values.slice(0, Math.min(attr.values.length, 3));
      });
      setCheckedOptions(initChecked);
      setVariants([]);
      setImageUrl("/images/assets/item_1.jpg");
      setGalleryUrls([]);
    } catch (err) {
      console.error("Error opening create modal:", err);
      setIsModalOpen(true);
    }
  };

  const openEditModal = (product: Product) => {
    try {
      setEditingProduct(product);
      setActiveTab("info");
      setName(product.name || "");
      setSlug(product.slug || "");
      setShortDescription(product.short_description || "");
      setDescription(product.description || "");
      setCategoryId(product.category_id || (product.category as any)?.id || categories[0]?.id || "");
      setSubcategory(product.subcategory || "");
      setPrice(Number(product.price) || 0);
      setWholesalePrice5(product.wholesale_price_5_units ? Number(product.wholesale_price_5_units) : 0);
      setCargolinkMarginPercent(product.cargolink_margin_percent !== undefined && product.cargolink_margin_percent !== null ? Number(product.cargolink_margin_percent) : 10);
      setAirFreightRatePerKg(product.air_freight_rate_per_kg !== undefined && product.air_freight_rate_per_kg !== null ? Number(product.air_freight_rate_per_kg) : 0);
      setSeaFreightRatePerCbm(product.sea_freight_rate_per_cbm !== undefined && product.sea_freight_rate_per_cbm !== null ? Number(product.sea_freight_rate_per_cbm) : 0);
      setCurrency(product.currency || "FCFA");
      setStockQuantity(product.stock_quantity ?? 100);
      setMinimumOrderQuantity(product.minimum_order_quantity ?? 1);
      setCountryOfOrigin(product.country_of_origin || "Hub Asie & International");
      setWeight(Number(product.weight) || 0.5);
      setLength(Number(product.length) || 10);
      setWidth(Number(product.width) || 8);
      setHeight(Number(product.height) || 5);
      setAvailableShippingModes(product.available_shipping_modes || ["air", "sea"]);
      setEstimatedDeliveryTime(product.estimated_delivery_time || "15j (Aérien Express) / 30j (Aérien Simple) / 50–95j (Maritime)");
      setStatus(product.status || "active");
      setIsDemo(Boolean(product.is_demo));
      setIsFeatured(Boolean(product.is_featured));

      const isVar = Boolean(product.has_variants || (product.variants && product.variants.length > 0));
      setHasVariants(isVar);

      // Infer product type
      const query = `${product.category?.slug || (product.category as any)?.name || ""} ${product.name || ""}`.toLowerCase();
      let detectedType = "other";
      if (query.includes("phone") || query.includes("iphone") || query.includes("samsung") || query.includes("téléphone")) detectedType = "phones";
      else if (query.includes("ipad") || query.includes("tab") || query.includes("tablette")) detectedType = "tablets";
      else if (query.includes("mac") || query.includes("laptop") || query.includes("pc") || query.includes("ordinateur")) detectedType = "laptops";
      else if (query.includes("robe") || query.includes("shirt") || query.includes("vetement") || query.includes("vêtement")) detectedType = "clothing";
      else if (query.includes("chaussure") || query.includes("sneaker") || query.includes("basket") || query.includes("shoe")) detectedType = "shoes";
      setSelectedProductType(detectedType);

      // Parse & normalize variants safely
      const parsedVariants: ProductVariant[] = Array.isArray(product.variants)
        ? product.variants.map((v: any, idx) => {
            let attrs = v.attributes || {};
            if (typeof attrs === "string") {
              try { attrs = JSON.parse(attrs); } catch {}
            }
            return {
              id: String(v.id || `var_${idx}_${Date.now()}`),
              sku: String(v.sku || `SKU-${idx + 1}`),
              title: String(v.title || Object.values(attrs || {}).join(" • ") || `Variante ${idx + 1}`),
              attributes: typeof attrs === "object" && attrs !== null ? attrs : {},
              price: Number(v.price) || Number(product.price) || 0,
              wholesale_price_5_units: v.wholesale_price_5_units ? Number(v.wholesale_price_5_units) : null,
              stock_quantity: Number(v.stock_quantity) || 0,
              is_active: v.is_active !== false,
              image_url: v.image_url || null,
            };
          })
        : [];

      // Parse attribute definitions safely
      let parsedDefs: ProductAttributeDefinition[] = [];
      if (Array.isArray(product.attributes_definition) && product.attributes_definition.length > 0) {
        parsedDefs = product.attributes_definition
          .map((a: any) => ({
            name: String(a.name || "").trim(),
            values: Array.isArray(a.values) ? a.values.map(String) : [],
          }))
          .filter((a) => a.name !== "");
      }

      if (parsedDefs.length === 0) {
        if (parsedVariants.length > 0) {
          const keys = Array.from(new Set(parsedVariants.flatMap((v) => Object.keys(v.attributes || {}))));
          parsedDefs = keys.map((k) => ({
            name: k,
            values: Array.from(new Set(parsedVariants.map((v) => v.attributes?.[k]).filter(Boolean))),
          }));
        } else {
          parsedDefs = getPresetAttributesForCategory(detectedType, product.name);
        }
      }

      setAttributesDefinition(parsedDefs);

      const initChecked: Record<string, string[]> = {};
      if (parsedVariants.length > 0) {
        parsedDefs.forEach((attr) => {
          const uniqueInVars = Array.from(
            new Set(parsedVariants.map((v) => v.attributes?.[attr.name]).filter(Boolean))
          );
          initChecked[attr.name] = uniqueInVars.length > 0 ? uniqueInVars : attr.values;
        });
      } else {
        parsedDefs.forEach((attr) => {
          initChecked[attr.name] = attr.values;
        });
      }
      setCheckedOptions(initChecked);
      setVariants(parsedVariants);

      const primaryImgUrl = getProductImageUrl(product);
      setImageUrl(primaryImgUrl);

      const rawGallery = (product.images || []).slice(1).map((img: any) =>
        typeof img === "string" ? img : (img?.public_image_url || img?.url || "")
      );
      const seen = new Set<string>([primaryImgUrl]);
      const uniqueGallery: string[] = [];
      for (const url of rawGallery) {
        if (url && typeof url === "string" && !seen.has(url)) {
          seen.add(url);
          uniqueGallery.push(url);
        }
      }
      setGalleryUrls(uniqueGallery);
    } catch (err) {
      console.error("Error in openEditModal:", err);
    } finally {
      setIsModalOpen(true);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation Onglet 1 : Infos Générales
    if (!name.trim()) {
      setActiveTab("info");
      showToast("Nom requis", "Veuillez renseigner le nom du produit.", "error");
      return;
    }
    if (!categoryId) {
      setActiveTab("info");
      showToast("Catégorie requise", "Veuillez choisir une catégorie pour le produit.", "error");
      return;
    }
    if (Number(stockQuantity) < 1 && (!hasVariants || variants.length === 0)) {
      setActiveTab("info");
      showToast("Stock requis", "Veuillez renseigner une quantité de stock valide (au moins 1).", "error");
      return;
    }
    if (Number(minimumOrderQuantity) < 1) {
      setActiveTab("info");
      showToast("Commande minimum requise", "Veuillez indiquer un MOQ d'au moins 1.", "error");
      return;
    }

    // 2. Validation Onglet 2 : Tarifs & Logistique
    if (!price || Number(price) <= 0) {
      setActiveTab("pricing");
      showToast("Prix requis", "Veuillez renseigner le prix de vente unitaire.", "error");
      return;
    }

    // Smart fallbacks for descriptions & images
    const effectiveImageUrl = imageUrl?.trim() || "/images/assets/item_1.jpg";
    const effectiveShortDescription = shortDescription?.trim() || `${name} - Produit certifié avec expédition rapide.`;
    const effectiveDescription = description?.trim() || `Découvrez ${name}, disponible au meilleur prix avec contrôle qualité rigoureux et garantie Fenouhi.`;
    const finalSlug = slug.trim() || generateSlug(name);

    // 1. Compute effective variants & attributes
    let finalVariants = variants;
    let finalAttributesDef = attributesDefinition;

    if (hasVariants && (!finalVariants || finalVariants.length === 0)) {
      const activeDefs = attributesDefinition
        .map((attr) => ({
          name: attr.name,
          values: (checkedOptions[attr.name] || []).filter((v) => v.trim() !== ""),
        }))
        .filter((attr) => attr.values.length > 0);

      if (activeDefs.length > 0) {
        finalVariants = generateCartesianVariants(
          activeDefs,
          Number(price),
          Number(wholesalePrice5) > 0 ? Number(wholesalePrice5) : null,
          Number(stockQuantity) > 0 ? Math.round(Number(stockQuantity) / Math.max(1, activeDefs.length)) : 10,
          finalSlug
        );
        finalAttributesDef = activeDefs;
      }
    }

    const hasEffectiveVariants = Boolean(hasVariants && finalVariants && finalVariants.length > 0);

    // Calculated Stock from active variants if enabled
    const calculatedStock = hasEffectiveVariants
      ? finalVariants.filter((v) => v.is_active).reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
      : Number(stockQuantity ?? 100);

    // Active base unit price from lowest active variant
    const effectiveBasePrice = hasEffectiveVariants
      ? Math.min(...finalVariants.filter((v) => v.is_active && Number(v.price) > 0).map((v) => Number(v.price)), Number(price))
      : Number(price);

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        name,
        slug: finalSlug,
        short_description: effectiveShortDescription,
        description: effectiveDescription,
        category_id: categoryId || null,
        subcategory: subcategory || "Accessoires & Coques",
        price: effectiveBasePrice,
        wholesale_price_5_units: Number(wholesalePrice5) > 0 ? Number(wholesalePrice5) : null,
        cargolink_margin_percent: Number(cargolinkMarginPercent ?? 10),
        air_freight_rate_per_kg: Number(airFreightRatePerKg ?? 0),
        sea_freight_rate_per_cbm: Number(seaFreightRatePerCbm ?? 0),
        currency: currency || "FCFA",
        stock_quantity: calculatedStock,
        minimum_order_quantity: Number(minimumOrderQuantity ?? 1),
        country_of_origin: countryOfOrigin || "Hub Asie & International",
        weight: Number(weight ?? 0.5),
        length: Number(length ?? 10),
        width: Number(width ?? 8),
        height: Number(height ?? 5),
        available_shipping_modes: availableShippingModes || ["air", "sea"],
        estimated_delivery_time: estimatedDeliveryTime || "5 - 15 jours (Aérien)",
        status: status || "active",
        is_demo: isDemo,
        is_featured: isFeatured,
        has_variants: hasEffectiveVariants,
        attributes_definition: hasEffectiveVariants ? finalAttributesDef : null,
        variants: hasEffectiveVariants ? finalVariants : null,
        updated_at: new Date().toISOString()
      };

      let newProdId = editingProduct?.id || `custom_prod_${Date.now()}`;
      let dbError: any = null;

      // Filter galleryUrls to make sure they are distinct and don't duplicate the primary image
      const distinctGallery = galleryUrls.filter(
        (url, idx, self) => url && url !== effectiveImageUrl && self.indexOf(url) === idx
      );

      // 1. Supabase database write
      try {
        const imagesToInsert = [
          { product_id: newProdId, public_image_url: effectiveImageUrl, is_primary: true, position: 0 },
          ...distinctGallery.map((url, i) => ({
            product_id: newProdId,
            public_image_url: url,
            is_primary: false,
            position: i + 1
          }))
        ];

        if (editingProduct) {
          const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
          if (error) {
            dbError = error;
          } else {
            // Delete old images to prevent duplicate stacking
            await supabase.from("product_images").delete().eq("product_id", editingProduct.id);
            // Insert primary and gallery images
            await supabase.from("product_images").insert(
              imagesToInsert.map(img => ({ ...img, product_id: editingProduct.id }))
            );
          }
        } else {
          const isExistingUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newProdId);
          const insertPayload = isExistingUUID
            ? { ...payload, id: newProdId, created_by: user?.id || null }
            : { ...payload, created_by: user?.id || null };

          const { data: newProd, error } = await supabase
            .from("products")
            .insert(insertPayload)
            .select()
            .single();

          if (error) {
            dbError = error;
          } else if (newProd?.id) {
            newProdId = newProd.id;
            await supabase.from("product_images").insert(
              imagesToInsert.map(img => ({ ...img, product_id: newProd.id }))
            );
          }
        }

        if (!dbError) {
          await logAdminAction({
            action: editingProduct ? "UPDATE_PRODUCT" : "CREATE_PRODUCT",
            entityType: "products",
            entityId: newProdId,
            details: { name, price, isDemo, status }
          });
        }
      } catch (dbErr: any) {
        dbError = dbErr;
      }

      // Build product object for local catalog persistence
      const fullImages = [
        { id: `img_${newProdId}_0`, product_id: newProdId, public_image_url: effectiveImageUrl, position: 0, is_primary: true },
        ...distinctGallery.map((url, i) => ({ id: `img_${newProdId}_${i + 1}`, product_id: newProdId, public_image_url: url, position: i + 1, is_primary: false }))
      ];

      const matchedCategory =
        categories.find((c) => c.id === categoryId || c.slug === categoryId) ||
        FALLBACK_CATEGORIES.find((c) => c.id === categoryId || c.slug === categoryId) ||
        { id: categoryId, name: "High-Tech & Electronics", slug: "electronics", is_active: true } as any;

      const productObject: Product = {
        id: newProdId,
        ...payload,
        category_id: matchedCategory.id,
        category: matchedCategory,
        images: fullImages,
      };

      // 2. Server API sync
      try {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productObject)
        });
      } catch (apiErr: any) {
        console.warn("Server API sync warning:", apiErr);
      }

      // SUCCESS: Update local cache and state
      const existingCustom = getStoredCustomProducts();
      const updatedCustom = existingCustom.filter(p => p.id !== newProdId && (editingProduct ? p.id !== editingProduct.id : true));
      updatedCustom.unshift(productObject);
      saveStoredCustomProducts(updatedCustom);

      const deletedIds = getStoredDeletedProductIds();
      if (deletedIds.includes(newProdId)) {
        saveStoredDeletedProductIds(deletedIds.filter(id => id !== newProdId));
      }

      addRealNotification({
        title: editingProduct ? "Produit Modifié" : "Nouveau Produit Ajouté",
        desc: `"${name}" (${Number(price).toLocaleString()} FCFA) a été enregistré dans le catalogue.`,
        type: "product"
      });

      // Update UI state immediately in memory at index 0
      setProducts((prev) => {
        const filtered = prev.filter((p) => p.id !== newProdId && (editingProduct ? p.id !== editingProduct.id : true));
        return [productObject, ...filtered];
      });

      setIsModalOpen(false);
      await fetchProducts();
      showToast(
        editingProduct ? "Produit Modifié avec Succès !" : "Nouveau Produit Ajouté !",
        `L'article "${name}" est désormais enregistré et visible en boutique.`,
        "success"
      );
    } catch (err: any) {
      console.error("Erreur ajout produit:", err);
      showToast(
        "Échec de l'enregistrement !",
        err.message || "Une erreur inattendue est survenue.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus: ProductStatus = product.status === "active" ? "inactive" : "active";
    const updatedProduct: Product = {
      ...product,
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // 1. Update in custom products store
    const custom = getStoredCustomProducts();
    const existingIndex = custom.findIndex((p) => p.id === product.id || p.slug === product.slug || (p.id && product.id && `product-${p.id}` === product.id));
    if (existingIndex >= 0) {
      custom[existingIndex] = updatedProduct;
    } else {
      custom.unshift(updatedProduct);
    }
    saveStoredCustomProducts(custom);

    // 2. Update UI state immediately
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id || p.slug === product.slug ? updatedProduct : p))
    );

    // Sync status with Server API route /api/products
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct)
      });
    } catch {}

    addRealNotification({
      title: newStatus === "active" ? "Produit Publié en Boutique" : "Produit Dépublié (Inactif)",
      desc: `L'article "${product.name}" est passé au statut ${newStatus.toUpperCase()}.`,
      type: "product"
    });

    showToast(
      newStatus === "active" ? "Produit Publié en Boutique" : "Produit Dépublié (Inactif)",
      newStatus === "active" ? `"${product.name}" est maintenant visible sur la boutique.` : `"${product.name}" est désormais masqué de la boutique.`,
      newStatus === "active" ? "success" : "info"
    );

    try {
      const supabase = createClient();
      await supabase.from("products").update({ status: newStatus, updated_at: new Date().toISOString() }).or(`id.eq.${product.id},slug.eq.${product.slug}`);
      
      await logAdminAction({
        action: newStatus === "active" ? "PUBLISH_PRODUCT" : "UNPUBLISH_PRODUCT",
        entityType: "products",
        entityId: product.id,
        details: { name: product.name, oldStatus: product.status, newStatus }
      });
    } catch (err: any) {
      console.warn("Status toggle synced locally");
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteModalProduct) return;
    const product = deleteModalProduct;
    setIsDeleting(true);

    try {
      // 1. Add ID & Slug to deleted list so it never reappears
      const deletedIds = getStoredDeletedProductIds();
      if (product.id && !deletedIds.includes(product.id)) deletedIds.push(product.id);
      if (product.id && !deletedIds.includes(`product-${product.id}`)) deletedIds.push(`product-${product.id}`);
      if (product.slug && !deletedIds.includes(product.slug)) deletedIds.push(product.slug);
      if (product.slug && !deletedIds.includes(`product-${product.slug}`)) deletedIds.push(`product-${product.slug}`);
      saveStoredDeletedProductIds(deletedIds);

      // 2. Remove from custom products
      const custom = getStoredCustomProducts();
      const updatedCustom = custom.filter((p) => p.id !== product.id && p.slug !== product.slug && p.id !== `product-${product.id}` && p.slug !== `product-${product.slug}`);
      saveStoredCustomProducts(updatedCustom);

      // 3. Update React state immediately
      setProducts((prev) => prev.filter((p) => p.id !== product.id && p.slug !== product.slug && p.id !== `product-${product.id}`));

      // Sync deletion with Server API route /api/products
      try {
        await fetch("/api/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: product.id, slug: product.slug })
        });
      } catch {}

      addRealNotification({
        title: "Produit Supprimé",
        desc: `"${product.name}" a été définitivement retiré du catalogue.`,
        type: "product"
      });

      setDeleteModalProduct(null);
      showToast(
        "Produit Supprimé Définitivement",
        `L'article "${product.name}" a été retiré de la boutique et du catalogue.`,
        "error"
      );

      try {
        const supabase = createClient();
        await supabase.from("product_images").delete().eq("product_id", product.id);
        await supabase.from("products").delete().or(`id.eq.${product.id},slug.eq.${product.slug}`);

        await logAdminAction({
          action: "DELETE_PRODUCT",
          entityType: "products",
          entityId: product.id,
          details: { name: product.name }
        });
      } catch {}
    } catch (err: any) {
      console.warn("Product deletion synced locally");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return p.name.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query);
  });

  // Summary counts for top KPI cards
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === "active").length;
  const realCount = products.filter((p) => !p.is_demo).length;
  const demoCount = products.filter((p) => p.is_demo).length;

  return (
    <div style={{ padding: "20px 0 60px", maxWidth: 1280, margin: "0 auto" }}>
      {/* 1. TOP HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(22, 84, 145, 0.08)", color: "#165491", padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <Package style={{ width: 14, height: 14 }} /> CATALOGUE SUPABASE & BOUTIQUE FENOUHI
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Gestion des Articles & Produits
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Pilotez le catalogue, les prix d'achat usine, les marges CargoLink et la visibilité en boutique.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={fetchProducts}
            className="btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", borderRadius: 12, fontWeight: 600, fontSize: 13, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
            title="Actualiser la liste"
          >
            <RefreshCw style={{ width: 15 }} /> Actualiser
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", fontWeight: 700, fontSize: 13.5, borderRadius: 12, background: "linear-gradient(135deg, #165491 0%, #0F3B5F 100%)", boxShadow: "0 6px 18px rgba(22,84,145,0.3)" }}
          >
            <Plus style={{ width: 17 }} /> Ajouter un Nouveau Produit
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRIC STAT PILLS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Total Catalogue</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{totalCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>En Vente (Actifs)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", marginTop: 2 }}>{activeCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Vrais Articles Réels</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{realCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FFF7ED", color: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Simulation / Démo</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#D97706", marginTop: 2 }}>{demoCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Info style={{ width: 18 }} />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS TOOLBAR */}
      <div
        style={{
          background: "#FFFFFF",
          padding: "16px 20px",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Search Input */}
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 420 }}>
          <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#94A3B8" }} />
          <input
            type="text"
            placeholder="Rechercher par nom, slug ou mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 10,
              border: "1.5px solid #E2E8F0",
              outline: "none",
              fontSize: 13,
              fontWeight: 500,
              background: "#F8FAFC",
              color: "#0F172A",
              transition: "border-color 0.2s ease"
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: 4 }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Category Filter */}
          <div style={{ position: "relative" }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "9px 32px 9px 12px",
                borderRadius: 10,
                border: "1.5px solid #E2E8F0",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#334155",
                background: "#FFFFFF",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ position: "relative" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "9px 32px 9px 12px",
                borderRadius: 10,
                border: "1.5px solid #E2E8F0",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#334155",
                background: "#FFFFFF",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs (En Vente)</option>
              <option value="draft">Brouillons</option>
              <option value="inactive">Inactifs</option>
              <option value="archived">Archivés</option>
            </select>
          </div>

          {/* Demo Filter */}
          <div style={{ position: "relative" }}>
            <select
              value={demoFilter}
              onChange={(e) => setDemoFilter(e.target.value)}
              style={{
                padding: "9px 32px 9px 12px",
                borderRadius: 10,
                border: "1.5px solid #E2E8F0",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#334155",
                background: "#FFFFFF",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="all">Tous types</option>
              <option value="real">Articles Réels</option>
              <option value="demo">Démo / Simu</option>
            </select>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", background: "#F1F5F9", padding: "6px 12px", borderRadius: 999 }}>
            {filteredProducts.length} résultat{filteredProducts.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* 4. BALANCED MODERN PRODUCTS TABLE */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
                <th style={{ padding: "14px 18px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", width: "35%" }}>
                  Article & Détails
                </th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", width: "18%" }}>
                  Catégorie
                </th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", width: "15%" }}>
                  Prix & Fret
                </th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", width: "12%" }}>
                  Stock
                </th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", width: "10%" }}>
                  Statut
                </th>
                <th style={{ padding: "14px 18px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right", width: "10%" }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
                    <RefreshCw style={{ width: 28, height: 28, animation: "spin 1.5s linear infinite", margin: "0 auto 12px", color: "#165491" }} />
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Chargement du catalogue Supabase...</div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
                    <Package style={{ width: 42, height: 42, margin: "0 auto 12px", color: "#CBD5E1" }} />
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 4 }}>Aucun article trouvé</div>
                    <div style={{ fontSize: 13 }}>Modifiez vos critères de recherche ou ajoutez un nouveau produit.</div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const img = getProductImageUrl(p);
                  const isActive = p.status === "active";
                  const stockNum = p.stock_quantity ?? 100;
                  const isStockOk = stockNum > 10;

                  return (
                    <tr
                      key={p.id || idx}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        transition: "background-color 0.15s ease",
                        background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA"; }}
                    >
                      {/* 1. PRODUIT */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", border: "1.5px solid #E2E8F0", background: "#FFFFFF", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                            <img
                              src={img}
                              alt={p.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/assets/item_1.jpg";
                              }}
                            />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 13.5, lineHeight: 1.3, marginBottom: 2 }}>
                              {p.name}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>
                                {p.slug}
                              </span>
                              {p.is_demo ? (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "#FEF3C7", color: "#B45309" }}>
                                  Démo
                                </span>
                              ) : (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "#DCFCE7", color: "#166534" }}>
                                  Certifié Réel
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. CATÉGORIE */}
                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: "#EFF6FF",
                            color: "#1D4ED8",
                            border: "1px solid #DBEAFE"
                          }}
                        >
                          {p.category?.name || "Catalogue Général"}
                        </span>
                        {p.subcategory && (
                          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                            {p.subcategory}
                          </div>
                        )}
                      </td>

                      {/* 3. PRIX & FRET */}
                      <td style={{ padding: "14px 14px" }}>
                        {p.has_variants && p.variants && p.variants.length > 0 ? (
                          <>
                            <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 13.5 }}>
                              {(() => {
                                const activeVars = p.variants.filter((v) => v.is_active);
                                const prices = (activeVars.length > 0 ? activeVars : p.variants).map((v) => Number(v.price));
                                const minP = Math.min(...prices);
                                const maxP = Math.max(...prices);
                                return minP === maxP
                                  ? `${minP.toLocaleString()} ${p.currency || "FCFA"}`
                                  : `${minP.toLocaleString()} - ${maxP.toLocaleString()} ${p.currency || "FCFA"}`;
                              })()}
                            </div>
                            <div style={{ marginTop: 3 }}>
                              <span style={{ fontSize: 10, background: "#EFF6FF", color: "#2563EB", padding: "2px 6px", borderRadius: 4, fontWeight: 700, border: "1px solid #BFDBFE", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                <Layers style={{ width: 10, height: 10 }} />
                                {p.variants.length} variantes
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14 }}>
                              {Number(p.price).toLocaleString()} {p.currency || "FCFA"}
                              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#64748B", marginLeft: 4 }}>(1 art)</span>
                            </div>
                            {p.wholesale_price_5_units && Number(p.wholesale_price_5_units) > 0 && (
                              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#16A34A", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                                <span>{Number(p.wholesale_price_5_units).toLocaleString()} {p.currency || "FCFA"}</span>
                                <span style={{ fontSize: 9.5, background: "#DCFCE7", color: "#15803D", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                                  ≥ 5 art.
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          Marge : +{p.cargolink_margin_percent ?? 10}%
                        </div>
                      </td>

                      {/* 4. STOCK */}
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: isStockOk ? "#16A34A" : "#EA580C" }} />
                          <span style={{ fontWeight: 700, color: isStockOk ? "#0F172A" : "#EA580C", fontSize: 13 }}>
                            {stockNum} en stock
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          Min : {p.minimum_order_quantity ?? 1} unité
                        </div>
                      </td>

                      {/* 5. STATUT */}
                      <td style={{ padding: "14px 14px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 10px",
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            background: isActive ? "#DCFCE7" : "#F1F5F9",
                            color: isActive ? "#15803D" : "#64748B"
                          }}
                          title={isActive ? "Cliquer pour dépublier (masquer de la boutique)" : "Cliquer pour publier sur la boutique"}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#16A34A" : "#94A3B8" }} />
                          {isActive ? "En Vente" : "Inactif"}
                        </button>
                      </td>

                      {/* 6. ACTIONS */}
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                          {/* PREVIEW LINK */}
                          <a
                            href={`/product/${p.slug || p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              color: "#475569",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none",
                              transition: "all 0.15s ease"
                            }}
                            title="Voir la fiche produit en boutique"
                          >
                            <ExternalLink style={{ width: 14, height: 14 }} />
                          </a>

                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "#EFF6FF",
                              border: "1px solid #DBEAFE",
                              color: "#1D4ED8",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.15s ease"
                            }}
                            title="Modifier ce produit"
                          >
                            <Edit style={{ width: 14, height: 14 }} />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalProduct(p)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "#FEF2F2",
                              border: "1px solid #FEE2E2",
                              color: "#DC2626",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.15s ease"
                            }}
                            title="Supprimer définitivement"
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL (PREMIUM TABBED DESIGN) */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ maxWidth: 840, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: 0, borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            
            {/* MODAL HEADER BAR */}
            <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", padding: "20px 24px", borderRadius: "20px 20px 0 0", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="badge" style={{ background: "rgba(249, 115, 22, 0.2)", color: "#F97316", border: "1px solid rgba(249, 115, 22, 0.4)", marginBottom: 4, fontSize: 10 }}>
                  {editingProduct ? "ÉDITION PRODUIT" : "NOUVEL ARTICLE COMMERCIAL"}
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                  <Package style={{ width: 22, color: "#F97316" }} />
                  {editingProduct ? `Modifier "${editingProduct.name}"` : "Créer un Produit Commercial Usine"}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X style={{ width: 18 }} />
              </button>
            </div>

            {/* TAB NAVIGATION BAR */}
            <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC", padding: "0 16px", overflowX: "auto" }}>
              {[
                { id: "info", label: "1. Infos Générales", icon: Box },
                { id: "variants", label: `2. Variantes ${variants.length > 0 ? `(${variants.length})` : ""}`, icon: Layers },
                { id: "pricing", label: "3. Prix & Marges", icon: DollarSign },
                { id: "media", label: "4. Photos & Médias", icon: Camera },
                { id: "specs", label: "5. Fiche & Specs", icon: SlidersHorizontal },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: isActive ? "#F97316" : "#64748B",
                      border: "none",
                      borderBottom: isActive ? "3px solid #F97316" : "3px solid transparent",
                      background: "transparent",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Icon style={{ width: 16 }} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* TAB 1: INFOS GÉNÉRALES */}
              {activeTab === "info" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  {/* IS DEMO SWITCH */}
                  <div style={{ background: isDemo ? "#FEF3C7" : "#F0FDF4", border: `1px solid ${isDemo ? "#FCD34D" : "#86EFAC"}`, padding: 14, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: isDemo ? "#92400E" : "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                        {isDemo ? (
                          <>
                            <Info style={{ width: 15, height: 15, color: "#D97706" }} />
                            Produit de Démonstration / Simulation
                          </>
                        ) : (
                          <>
                            <CheckCircle2 style={{ width: 15, height: 15, color: "#166534" }} />
                            Vrai Produit Commercial Certifié
                          </>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: isDemo ? "#78350F" : "#15803D" }}>
                        {isDemo
                          ? "Ce produit est une simulation et ne sera pas inclus dans les vraies commandes."
                          : "Produit usine réel certifié destiné aux commandes réelles de la boutique."}
                      </div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={isDemo}
                        onChange={(e) => setIsDemo(e.target.checked)}
                      />
                      Marquer Démo
                    </label>
                  </div>

                  {/* NAME */}
                  <div>
                    <label className="admin-label">Nom du Produit *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={handleNameChange}
                      className="admin-input"
                      placeholder="ex: Casque Bluetooth ANC Usine Pro"
                    />
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label className="admin-label">Catégorie *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="admin-input"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* STOCK, MOQ */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="admin-label">Stock Usine Disponible *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        placeholder="100"
                        value={stockQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStockQuantity(val === "" ? 0 : Number(val));
                        }}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Moq (Commande Min.) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder="1"
                        value={minimumOrderQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMinimumOrderQuantity(val === "" ? 0 : Number(val));
                        }}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  {/* STATUS & FEATURED */}
                  <div style={{ display: "flex", gap: 20, alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: 14 }}>
                    <div style={{ flex: 1 }}>
                      <label className="admin-label">Statut de Publication</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="admin-input">
                        <option value="active">Actif / En Vente Boutique</option>
                        <option value="draft">Brouillon</option>
                        <option value="inactive">Inactif</option>
                        <option value="archived">Archivé</option>
                      </select>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, marginTop: 18, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                      Mettre en Avant (Featured)
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: VARIANTES (FLOW EN 3 ÉTAPES ULTRA-SIMPLE) */}
              {activeTab === "variants" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "4px 0" }}>
                  
                  {/* ACTIVATION SIMPLE */}
                  <div
                    style={{
                      background: hasVariants ? "#F0FDF4" : "#F8FAFC",
                      border: `1.5px solid ${hasVariants ? "#86EFAC" : "#E2E8F0"}`,
                      padding: "16px 20px",
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: hasVariants ? "#15803D" : "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                        <Layers style={{ width: 18, height: 18, color: hasVariants ? "#16A34A" : "#64748B" }} />
                        Activer les versions & options pour cet article
                      </div>
                      <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 2 }}>
                        Cochez cette option si le prix ou le stock change selon la capacité, la taille, l'état ou la couleur.
                      </div>
                    </div>
                    <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={hasVariants}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setHasVariants(checked);
                          if (checked && (!attributesDefinition || attributesDefinition.length === 0)) {
                            handleSelectProductType("phones");
                          }
                        }}
                        style={{ width: 22, height: 22, cursor: "pointer", accentColor: "#16A34A" }}
                      />
                    </label>
                  </div>

                  {hasVariants && (
                    <>
                      {/* ÉTAPE 1 : TYPE DE PRODUIT (6 GROSSES CARTES) */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", color: "#FFF", fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>1</span>
                          Type de produit
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))", gap: 10 }}>
                          {[
                            { key: "phones", label: "Téléphone", icon: "📱" },
                            { key: "tablets", label: "Tablette", icon: "📟" },
                            { key: "laptops", label: "MacBook / PC", icon: "💻" },
                            { key: "clothing", label: "Vêtement", icon: "👕" },
                            { key: "shoes", label: "Chaussure", icon: "👟" },
                            { key: "other", label: "Autre", icon: "📦" },
                          ].map((t) => {
                            const isSelected = selectedProductType === t.key;
                            return (
                              <button
                                key={t.key}
                                type="button"
                                onClick={() => handleSelectProductType(t.key)}
                                style={{
                                  padding: "14px 10px",
                                  borderRadius: 14,
                                  border: isSelected ? "2px solid #0F172A" : "1.5px solid #E2E8F0",
                                  background: isSelected ? "#0F172A" : "#FFFFFF",
                                  color: isSelected ? "#FFFFFF" : "#334155",
                                  cursor: "pointer",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 6,
                                  boxShadow: isSelected ? "0 4px 14px rgba(15, 23, 42, 0.18)" : "none",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <span style={{ fontSize: 24 }}>{t.icon}</span>
                                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ÉTAPE 2 : CARACTÉRISTIQUES DISPONIBLES (CHIPS COCHABLES SIMPLES) */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", color: "#FFF", fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>2</span>
                          Caractéristiques disponibles
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {attributesDefinition.map((attr, attrIdx) => {
                            const checkedList = checkedOptions[attr.name] || [];
                            return (
                              <div key={attr.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
                                    {attr.name} :
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttribute(attrIdx)}
                                    style={{ background: "transparent", border: "none", color: "#94A3B8", fontSize: 11, cursor: "pointer" }}
                                    title="Masquer cette propriété"
                                  >
                                    Retirer
                                  </button>
                                </div>

                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                  {attr.values.map((val) => {
                                    const isChecked = checkedList.includes(val);
                                    return (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleToggleOptionValue(attr.name, val)}
                                        style={{
                                          padding: "7px 14px",
                                          borderRadius: 10,
                                          fontSize: 12.5,
                                          fontWeight: 600,
                                          cursor: "pointer",
                                          background: isChecked ? "#0F172A" : "#FFFFFF",
                                          color: isChecked ? "#FFFFFF" : "#475569",
                                          border: isChecked ? "2px solid #0F172A" : "1px solid #CBD5E1",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 6,
                                          transition: "all 0.15s ease",
                                        }}
                                      >
                                        <span style={{ width: 14, height: 14, borderRadius: 4, background: isChecked ? "#16A34A" : "#E2E8F0", color: "#FFF", fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                                          {isChecked ? "✓" : ""}
                                        </span>
                                        {val}
                                      </button>
                                    );
                                  })}

                                  {/* INLINE CUSTOM VALUE INPUT */}
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <input
                                      type="text"
                                      placeholder="+ Autre..."
                                      value={newAttrValueInput[attr.name] || ""}
                                      onChange={(e) => setNewAttrValueInput({ ...newAttrValueInput, [attr.name]: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleAddCustomValue(attr.name);
                                        }
                                      }}
                                      style={{
                                        border: "1px solid #CBD5E1",
                                        borderRadius: 8,
                                        padding: "6px 10px",
                                        fontSize: 12,
                                        width: 100,
                                        background: "#FFFFFF",
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddCustomValue(attr.name)}
                                      style={{
                                        background: "#F1F5F9",
                                        border: "1px solid #CBD5E1",
                                        borderRadius: 8,
                                        padding: "6px 10px",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        color: "#334155",
                                      }}
                                    >
                                      Ajouter
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* ADD ANOTHER PROPERTY BUTTON */}
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <input
                              type="text"
                              placeholder="Ajouter une autre caractéristique (ex: Format, Voltage...)"
                              value={newAttrInputName}
                              onChange={(e) => setNewAttrInputName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddAttribute();
                                }
                              }}
                              className="admin-input"
                              style={{ flex: 1, fontSize: 12.5 }}
                            />
                            <button
                              type="button"
                              onClick={handleAddAttribute}
                              style={{
                                background: "#F1F5F9",
                                border: "1px solid #CBD5E1",
                                color: "#0F172A",
                                padding: "0 14px",
                                borderRadius: 10,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              + Ajouter
                            </button>
                          </div>
                        </div>

                        {/* SINGLE PROMINENT MAIN CTA */}
                        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={handleCreateVariantsFromChecked}
                            style={{
                              background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                              color: "#FFFFFF",
                              border: "none",
                              padding: "14px 32px",
                              borderRadius: 14,
                              fontSize: 15,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 10,
                              boxShadow: "0 6px 20px rgba(249, 115, 22, 0.28)",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Zap style={{ width: 18, height: 18 }} />
                            Créer les variantes
                          </button>
                        </div>
                      </div>

                      {/* ÉTAPE 3 : PRIX & STOCK DES VARIANTES (LISTE ULTRA-LISIBLE) */}
                      {variants.length > 0 && (
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", color: "#FFF", fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>3</span>
                              Prix & stock des variantes ({variants.length})
                            </div>
                            <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>
                              ✓ {variants.filter((v) => v.is_active).length} actives • Stock total : {variants.filter((v) => v.is_active).reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)} unités
                            </span>
                          </div>

                          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                              <thead style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                                <tr>
                                  <th style={{ padding: "12px 16px", fontWeight: 700, color: "#475569" }}>Variante</th>
                                  <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569", width: 160 }}>Prix (FCFA)</th>
                                  <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569", width: 120 }}>Stock</th>
                                  <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569", width: 110, textAlign: "center" }}>Disponible</th>
                                  <th style={{ padding: "12px 10px", width: 40 }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {variants.map((v, vIdx) => (
                                  <tr
                                    key={v.id || vIdx}
                                    style={{
                                      borderBottom: "1px solid #F1F5F9",
                                      background: v.is_active ? "#FFFFFF" : "#F8FAFC",
                                      opacity: v.is_active ? 1 : 0.6,
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    {/* TITLE */}
                                    <td style={{ padding: "12px 16px" }}>
                                      <div style={{ fontWeight: 700, color: "#0F172A" }}>
                                        {v.title || Object.values(v.attributes).join(" · ")}
                                      </div>
                                    </td>

                                    {/* PRICE */}
                                    <td style={{ padding: "10px 14px" }}>
                                      <input
                                        type="number"
                                        min={0}
                                        value={v.price}
                                        onChange={(e) => handleUpdateVariantField(v.id, "price", Number(e.target.value))}
                                        style={{
                                          width: "100%",
                                          padding: "8px 10px",
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color: "#0F172A",
                                          border: "1px solid #CBD5E1",
                                          borderRadius: 8,
                                        }}
                                      />
                                    </td>

                                    {/* STOCK */}
                                    <td style={{ padding: "10px 14px" }}>
                                      <input
                                        type="number"
                                        min={0}
                                        value={v.stock_quantity}
                                        onChange={(e) => handleUpdateVariantField(v.id, "stock_quantity", Number(e.target.value))}
                                        style={{
                                          width: "100%",
                                          padding: "8px 10px",
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color: "#0F172A",
                                          border: "1px solid #CBD5E1",
                                          borderRadius: 8,
                                        }}
                                      />
                                    </td>

                                    {/* DISPONIBLE TOGGLE */}
                                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                      <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                                        <input
                                          type="checkbox"
                                          checked={v.is_active}
                                          onChange={(e) => handleUpdateVariantField(v.id, "is_active", e.target.checked)}
                                          style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#16A34A" }}
                                        />
                                      </label>
                                    </td>

                                    {/* DELETE */}
                                    <td style={{ padding: "10px 10px", textAlign: "center" }}>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(v.id)}
                                        style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: 4 }}
                                        title="Supprimer cette variante"
                                      >
                                        <Trash2 style={{ width: 15, height: 15 }} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: PRICE, CARGOLINK MARGIN % & FREIGHT (NEW FEATURE) */}
              {activeTab === "pricing" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: 14, borderRadius: 12 }}>
                    <span className="badge" style={{ background: "#2563EB", color: "#FFF", fontSize: 10, marginBottom: 4 }}>
                      PARAMÉTRAGE DE LA RENTABILITÉ CARGOLINK
                    </span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1E3A8A", margin: "4px 0 0" }}>
                      Définition du Prix Usine, de la Commission & du Fret
                    </h3>
                  </div>

                  {/* DUAL PRICING: PRIX UNITAIRE (1 ART) & PRIX GROS (≥ 5 ART) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* PRIX UNITAIRE (1 PIÈCE) */}
                    <div>
                      <label className="admin-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Prix Unitaire (1 article) *</span>
                        <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Tarif de base</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          required
                          min={0}
                          placeholder="Ex: 5000"
                          value={price}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPrice(val === "" ? 0 : Number(val));
                          }}
                          className="admin-input"
                          style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", paddingRight: 60 }}
                        />
                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#64748B" }}>
                          FCFA
                        </span>
                      </div>
                    </div>

                    {/* PRIX DE GROS (≥ 5 ARTICLES) */}
                    <div>
                      <label className="admin-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Prix Gros (dès 5 articles)</span>
                        {wholesalePrice5 > 0 && price > 0 && wholesalePrice5 < price && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>
                            -{Math.round(((price - wholesalePrice5) / price) * 100)}% d'économie
                          </span>
                        )}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          min={0}
                          placeholder={`Ex: ${price > 0 ? Math.round(price * 0.8) : 4000}`}
                          value={wholesalePrice5 === 0 ? "" : wholesalePrice5}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWholesalePrice5(val === "" ? 0 : Number(val));
                          }}
                          className="admin-input"
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: wholesalePrice5 > 0 ? "#15803D" : "#0F172A",
                            borderColor: wholesalePrice5 > 0 ? "#86EFAC" : undefined,
                            background: wholesalePrice5 > 0 ? "#F0FDF4" : undefined,
                            paddingRight: 70
                          }}
                        />
                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11.5, fontWeight: 700, color: wholesalePrice5 > 0 ? "#15803D" : "#64748B" }}>
                          FCFA/u
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                        Tarif dégressif automatique dès que le client sélectionne 5 pièces ou plus.
                      </div>
                    </div>
                  </div>

                  {/* % CARGOLINK MARGIN */}
                  <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <label className="admin-label" style={{ margin: 0 }}>
                        <span>Marge / Commission CargoLink (%) *</span>
                      </label>
                      <strong style={{ color: "#F97316", fontSize: 14 }}>{cargolinkMarginPercent}%</strong>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="10"
                        value={cargolinkMarginPercent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCargolinkMarginPercent(val === "" ? 0 : Number(val));
                        }}
                        className="admin-input"
                        style={{ width: 90, fontWeight: 600 }}
                      />
                      <div style={{ display: "flex", gap: 4, flex: 1 }}>
                        {[5, 10, 15, 20].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setCargolinkMarginPercent(pct)}
                            className="btn"
                            style={{
                              flex: 1,
                              padding: "6px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              background: cargolinkMarginPercent === pct ? "#F97316" : "#FFFFFF",
                              color: cargolinkMarginPercent === pct ? "#FFF" : "#334155",
                              border: "1px solid #CBD5E1"
                            }}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FREIGHT RATES PER PRODUCT */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label className="admin-label" style={{ margin: 0 }}>Fret Aérien (FCFA / kg) *</label>
                        <button
                          type="button"
                          onClick={() => setAirFreightRatePerKg(0)}
                          style={{
                            border: "1px solid #CBD5E1",
                            background: airFreightRatePerKg === 0 ? "#DCFCE7" : "#F1F5F9",
                            color: airFreightRatePerKg === 0 ? "#166534" : "#475569",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            cursor: "pointer"
                          }}
                        >
                          0 FCFA (Inclus)
                        </button>
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        placeholder="0"
                        value={airFreightRatePerKg}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAirFreightRatePerKg(val === "" ? 0 : Number(val));
                        }}
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label className="admin-label" style={{ margin: 0 }}>Fret Maritime (FCFA / CBM) *</label>
                        <button
                          type="button"
                          onClick={() => setSeaFreightRatePerCbm(0)}
                          style={{
                            border: "1px solid #CBD5E1",
                            background: seaFreightRatePerCbm === 0 ? "#DCFCE7" : "#F1F5F9",
                            color: seaFreightRatePerCbm === 0 ? "#166534" : "#475569",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            cursor: "pointer"
                          }}
                        >
                          0 FCFA (Inclus)
                        </button>
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        placeholder="0"
                        value={seaFreightRatePerCbm}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeaFreightRatePerCbm(val === "" ? 0 : Number(val));
                        }}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  {/* SIMULATEUR PRIX FINAL CLIENT */}
                  <div style={{ background: "#F8FAFC", border: "2px dashed #F97316", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#EA580C", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Zap style={{ width: 15 }} /> Simulateur de Prix de Vente Client Boutique
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, fontSize: 12 }}>
                      <div>
                        <span style={{ color: "#64748B" }}>Prix Usine :</span>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>{price.toLocaleString()} FCFA</div>
                      </div>
                      <div>
                        <span style={{ color: "#64748B" }}>Marge ({cargolinkMarginPercent}%) :</span>
                        <div style={{ fontWeight: 600, color: "#059669" }}>+{(price * (cargolinkMarginPercent / 100)).toLocaleString()} FCFA</div>
                      </div>
                      <div>
                        <span style={{ color: "#64748B" }}>Fret Aérien (ex: 0.5kg) :</span>
                        <div style={{ fontWeight: 600, color: "#2563EB" }}>+{(weight * airFreightRatePerKg).toLocaleString()} FCFA</div>
                      </div>
                      <div style={{ background: "#FFF", padding: "8px 12px", borderRadius: 8, border: "1px solid #FED7AA" }}>
                        <span style={{ color: "#C2410C", fontWeight: 600 }}>PRIX CONSEILLÉ CLIENT :</span>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#9A3412" }}>
                          {(price + (price * (cargolinkMarginPercent / 100)) + (weight * airFreightRatePerKg)).toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & PHOTO UPLOAD */}
              {activeTab === "media" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  
                  {/* MAIN IMAGE UPLOAD */}
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 18 }}>
                    <label className="admin-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Camera style={{ width: 16, height: 16, color: "#F97316" }} /> Image Principale du Produit *
                      </span>
                      <span style={{ fontSize: 11, color: "#64748B" }}>JPG, PNG, WEBP acceptés</span>
                    </label>

                    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                      {/* PREVIEW THUMBNAIL (CLEAN IMAGE DISPLAY) */}
                      <div style={{ width: 90, height: 90, borderRadius: 12, overflow: "hidden", border: "2px solid #F97316", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="Aperçu Produit"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              // Fallback cleanly on load error
                              (e.target as HTMLImageElement).src = "/images/assets/item_1.jpg";
                            }}
                          />
                        ) : (
                          <Package style={{ width: 32, color: "#CBD5E1" }} />
                        )}
                      </div>

                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageFileUpload}
                            className="admin-input"
                            style={{ padding: "8px 12px", fontSize: 12.5 }}
                          />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>OU URL Directe :</span>
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="admin-input"
                            placeholder="/images/assets/item_1.jpg"
                            style={{ fontSize: 12, padding: "5px 10px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GALLERY IMAGES MULTI UPLOAD */}
                  <div style={{ background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: 14, padding: 18 }}>
                    <label className="admin-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Images style={{ width: 16, height: 16, color: "#2563EB" }} /> Galerie Photos Usine (Angles, Détails & Emballages)
                      </span>
                      <span style={{ fontSize: 11, color: "#64748B" }}>Sélection multiple</span>
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesUpload}
                      className="admin-input"
                      style={{ padding: "8px 12px", fontSize: 12.5, marginBottom: 12 }}
                    />

                    {galleryUrls.length > 0 ? (
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {galleryUrls.map((url, idx) => (
                          <div key={idx} style={{ position: "relative", width: 70, height: 70, borderRadius: 10, overflow: "hidden", border: "1px solid #CBD5E1", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <img src={url} alt={`Vue ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              style={{ position: "absolute", top: 3, right: 3, background: "rgba(220, 38, 38, 0.9)", color: "#FFF", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <X style={{ width: 12, height: 12 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic", textAlign: "center", padding: 10 }}>
                        Aucune photo secondaire ajoutée pour le moment.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SPECS & DESCRIPTIONS */}
              {activeTab === "specs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="admin-label">Délai Estimé de Livraison</label>
                    <select
                      value={estimatedDeliveryTime}
                      onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                      className="admin-input"
                    >
                      <option value="15j (Aérien Express) / 30j (Aérien Simple) / 50–95j (Maritime)">15j (Aérien Express) / 30j (Aérien Simple) / 50–95j (Maritime)</option>
                      <option value="15 jours (Fret Aérien Express)">15 jours (Fret Aérien Express)</option>
                      <option value="30 jours (Fret Aérien Simple)">30 jours (Fret Aérien Simple / Standard)</option>
                      <option value="50 à 95 jours (Fret Maritime Groupé)">50 à 95 jours (Fret Maritime Groupé)</option>
                      <option value="Livraison Directe Cotonou (24-48h)">Livraison Directe Cotonou (24–48h)</option>
                    </select>
                  </div>

                  <div>
                    <label className="admin-label">Description Courte (Accroche Boutique)</label>
                    <input
                      type="text"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Description Complète & Fiche Technique</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="admin-input"
                      style={{ height: "auto" }}
                    />
                  </div>
                </div>
              )}

              {/* FOOTER ACTIONS BAR */}
              <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: 16, marginTop: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ background: "#F1F5F9", color: "#64748B" }}>
                    Annuler
                  </button>
                  {activeTab !== "info" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "pricing") setActiveTab("info");
                        if (activeTab === "media") setActiveTab("pricing");
                        if (activeTab === "specs") setActiveTab("media");
                      }}
                      className="btn"
                      style={{ background: "#E2E8F0", color: "#0F172A", fontWeight: 600 }}
                    >
                      ← Étape Précédente
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {activeTab !== "specs" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "info") {
                          if (!name.trim() || !categoryId) {
                            showToast("Infos requises", "Veuillez renseigner le Nom et la Catégorie avant de continuer.", "error");
                            return;
                          }
                          setActiveTab("pricing");
                        } else if (activeTab === "pricing") {
                          if (!price || Number(price) <= 0) {
                            showToast("Prix requis", "Veuillez renseigner un Prix de vente valide.", "error");
                            return;
                          }
                          setActiveTab("media");
                        } else if (activeTab === "media") {
                          if (!imageUrl || !imageUrl.trim()) {
                            showToast("Photo requise", "Veuillez charger au moins une image principale.", "error");
                            return;
                          }
                          setActiveTab("specs");
                        }
                      }}
                      className="btn"
                      style={{ background: "#0F172A", color: "#FFFFFF", fontWeight: 600, padding: "10px 18px" }}
                    >
                      Étape Suivante ➔
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                    style={{
                      padding: "10px 24px",
                      fontWeight: 700,
                      background: activeTab === "specs" ? "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)" : "var(--blue-primary)",
                      boxShadow: activeTab === "specs" ? "0 4px 12px rgba(234, 88, 12, 0.35)" : "none"
                    }}
                  >
                    {saving ? "Enregistrement..." : editingProduct ? "Mettre à jour le Produit" : "Valider & Créer le Produit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP DESIGN: CONFIRMATION DE SUPPRESSION */}
      {deleteModalProduct && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#FFFFFF", maxWidth: 440, width: "100%", borderRadius: 20, padding: 24, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)", border: "1px solid #FEE2E2", textAlign: "center" }}>
            
            {/* ICON RED GLOW */}
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)" }}>
              <Trash2 style={{ width: 28, height: 28 }} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
              Confirmer la Suppression
            </h3>

            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px", lineHeight: 1.5 }}>
              Êtes-vous certain de vouloir retirer définitivement cet article du catalogue et de la boutique en ligne ?
            </p>

            {/* PRODUCT MINI CARD PREVIEW */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginBottom: 20 }}>
              <img
                src={getProductImageUrl(deleteModalProduct)}
                alt={deleteModalProduct.name}
                style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid #CBD5E1" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {deleteModalProduct.name}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#EA580C" }}>
                  {deleteModalProduct.price?.toLocaleString()} FCFA
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setDeleteModalProduct(null)}
                disabled={isDeleting}
                className="btn"
                style={{ flex: 1, padding: "11px 16px", background: "#F1F5F9", color: "#334155", fontWeight: 600, borderRadius: 10 }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="btn"
                style={{ flex: 1, padding: "11px 16px", background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)", color: "#FFFFFF", fontWeight: 600, borderRadius: 10, boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)" }}
              >
                {isDeleting ? "Suppression..." : "Oui, Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP DESIGN: FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{ position: "fixed", bottom: 30, right: 30, zIndex: 9999999, background: "#0F172A", color: "#FFFFFF", padding: "16px 20px", borderRadius: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 20px 40px rgba(0,0,0,0.3)", border: `1px solid ${toast.type === "error" ? "#EF4444" : toast.type === "info" ? "#3B82F6" : "#22C55E"}`, maxWidth: 380, animation: "slideIn 0.3s ease" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: toast.type === "error" ? "rgba(239, 68, 68, 0.2)" : toast.type === "info" ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 197, 94, 0.2)", color: toast.type === "error" ? "#EF4444" : toast.type === "info" ? "#3B82F6" : "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {toast.type === "error" ? <Trash2 style={{ width: 18, height: 18 }} /> : toast.type === "info" ? <Info style={{ width: 18, height: 18 }} /> : <CheckCircle2 style={{ width: 18, height: 18 }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>{toast.title}</div>
            <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.4 }}>{toast.message}</div>
          </div>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer", padding: 4 }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}
    </div>
  );
}
