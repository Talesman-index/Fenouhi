"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/admin/activity-logger";
import type { Product, Category, ProductStatus } from "@/types/catalog";
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
  Info
} from "lucide-react";

import {
  FALLBACK_CATEGORIES,
  getPublicProductsSync,
  getStoredCustomProducts,
  saveStoredCustomProducts,
  getStoredDeletedProductIds,
  saveStoredDeletedProductIds
} from "@/lib/supabase/catalog";

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
  const [activeTab, setActiveTab] = useState<"info" | "pricing" | "media" | "specs">("info");

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
  const [currency, setCurrency] = useState("FCFA");
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState<number>(1);
  const [countryOfOrigin, setCountryOfOrigin] = useState("Hub Asie & International");
  const [weight, setWeight] = useState<number>(0.5);
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(8);
  const [height, setHeight] = useState<number>(5);
  const [availableShippingModes, setAvailableShippingModes] = useState<string[]>(["air", "sea"]);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("5 - 15 jours (Aérien) / 50 - 95 jours (Maritime)");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  
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
        setCategories(data as Category[]);
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
      // 1. Get all store catalog products
      const localProducts = getPublicProductsSync();
      const productMap = new Map<string, Product>();

      for (const p of localProducts) {
        productMap.set(p.id, p);
      }

      // 2. Query Supabase for any additional/updated DB products
      try {
        const supabase = createClient();
        const { data: dbProducts } = await supabase
          .from("products")
          .select("*, category:categories(*), images:product_images(*)")
          .order("created_at", { ascending: false });

        if (dbProducts && dbProducts.length > 0) {
          for (const p of dbProducts) {
            productMap.set(p.id, p as Product);
          }
        }
      } catch (e) {
        // Fallback to local catalog
      }

      let allProducts = Array.from(productMap.values());

      // 3. Filter by category
      if (categoryFilter !== "all") {
        allProducts = allProducts.filter(
          (p) =>
            p.category_id === categoryFilter ||
            p.category?.id === categoryFilter ||
            p.category?.slug === categoryFilter
        );
      }

      // 4. Filter by status
      if (statusFilter !== "all") {
        allProducts = allProducts.filter((p) => p.status === statusFilter);
      }

      // 5. Filter by demo mode
      if (demoFilter === "real") {
        allProducts = allProducts.filter((p) => !p.is_demo);
      } else if (demoFilter === "demo") {
        allProducts = allProducts.filter((p) => p.is_demo);
      }

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

  // Image Upload Handlers
  const handleMainImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setGalleryUrls((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const openCreateModal = () => {
    try {
      setIsModalOpen(true);
      setEditingProduct(null);
      setActiveTab("info");
      setName("");
      setSlug("");
      setShortDescription("Produit usine certifié import direct - Hubs internationaux.");
      setDescription("Description détaillée des caractéristiques techniques, de la garantie usine et de l'emballage sécurisé.");
      setCategoryId(categories && categories.length > 0 ? categories[0].id : "");
      setSubcategory("");
      setPrice(5000);
      setCargolinkMarginPercent(10);
      setAirFreightRatePerKg(2000);
      setSeaFreightRatePerCbm(2000);
      setCurrency("FCFA");
      setStockQuantity(200);
      setMinimumOrderQuantity(1);
      setCountryOfOrigin("Hub Asie & International");
      setWeight(0.5);
      setLength(10);
      setWidth(8);
      setHeight(5);
      setAvailableShippingModes(["air", "sea"]);
      setEstimatedDeliveryTime("5 - 15 jours (Aérien) / 50 - 95 jours (Maritime)");
      setStatus("active");
      setIsDemo(false);
      setIsFeatured(false);
      setImageUrl("/images/assets/item_1.jpg");
      setGalleryUrls([]);
    } catch (err) {
      console.error("Error opening create modal:", err);
      setIsModalOpen(true);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setActiveTab("info");
    setName(product.name);
    setSlug(product.slug);
    setShortDescription(product.short_description || "");
    setDescription(product.description || "");
    setCategoryId(product.category_id || categories[0]?.id || "");
    setSubcategory(product.subcategory || "");
    setPrice(product.price);
    setCargolinkMarginPercent(product.cargolink_margin_percent ?? 10);
    setAirFreightRatePerKg(product.air_freight_rate_per_kg ?? 2000);
    setSeaFreightRatePerCbm(product.sea_freight_rate_per_cbm ?? 2000);
    setCurrency(product.currency || "FCFA");
    setStockQuantity(product.stock_quantity);
    setMinimumOrderQuantity(product.minimum_order_quantity);
    setCountryOfOrigin(product.country_of_origin || "Hub Asie & International");
    setWeight(product.weight || 0.5);
    setLength(product.length || 10);
    setWidth(product.width || 8);
    setHeight(product.height || 5);
    setAvailableShippingModes(product.available_shipping_modes || ["air", "sea"]);
    setEstimatedDeliveryTime(product.estimated_delivery_time || "5 - 15 jours (Aérien) / 50 - 95 jours (Maritime)");
    setStatus(product.status);
    setIsDemo(product.is_demo);
    setIsFeatured(product.is_featured);
    setImageUrl(product.images?.[0]?.public_image_url || "/images/assets/item_1.jpg");
    const extraGallery = product.images?.slice(1).map((img) => img.public_image_url) || [];
    setGalleryUrls(extraGallery);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Veuillez renseigner le nom du produit.");
      return;
    }

    const finalSlug = slug.trim() || generateSlug(name);

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        name,
        slug: finalSlug,
        short_description: shortDescription,
        description,
        category_id: categoryId || null,
        subcategory,
        price: Number(price),
        cargolink_margin_percent: Number(cargolinkMarginPercent),
        air_freight_rate_per_kg: Number(airFreightRatePerKg),
        sea_freight_rate_per_cbm: Number(seaFreightRatePerCbm),
        currency,
        stock_quantity: Number(stockQuantity),
        minimum_order_quantity: Number(minimumOrderQuantity),
        country_of_origin: countryOfOrigin,
        weight: Number(weight),
        length: Number(length),
        width: Number(width),
        height: Number(height),
        available_shipping_modes: availableShippingModes,
        estimated_delivery_time: estimatedDeliveryTime,
        status,
        is_demo: isDemo,
        is_featured: isFeatured,
        updated_at: new Date().toISOString()
      };

      let savedInDb = false;
      let newProdId = editingProduct?.id || `custom_prod_${Date.now()}`;

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (editingProduct) {
          const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
          if (!error) savedInDb = true;

          // Update primary image if DB table exists
          if (editingProduct.images?.[0]?.id) {
            await supabase
              .from("product_images")
              .update({ public_image_url: imageUrl })
              .eq("id", editingProduct.images[0].id);
          }
        } else {
          const { data: newProd, error } = await supabase
            .from("products")
            .insert({
              ...payload,
              created_by: user?.id || null
            })
            .select()
            .single();

          if (!error && newProd?.id) {
            newProdId = newProd.id;
            savedInDb = true;
            await supabase.from("product_images").insert({
              product_id: newProd.id,
              public_image_url: imageUrl,
              is_primary: true
            });
          }
        }

        await logAdminAction({
          action: editingProduct ? "UPDATE_PRODUCT" : "CREATE_PRODUCT",
          entityType: "products",
          entityId: newProdId,
          details: { name, price, isDemo, status }
        });
      } catch (dbErr) {
        console.warn("Supabase products table bypassed or not ready:", dbErr);
      }

      // Build product object for local catalog persistence
      const fullImages = [
        { id: `img_${newProdId}_0`, product_id: newProdId, public_image_url: imageUrl, position: 0, is_primary: true },
        ...galleryUrls.map((url, i) => ({ id: `img_${newProdId}_${i + 1}`, product_id: newProdId, public_image_url: url, position: i + 1, is_primary: false }))
      ];

      const productObject: Product = {
        id: newProdId,
        ...payload,
        images: fullImages,
        category: categories.find(c => c.id === categoryId) || { id: categoryId, name: "Catalogue", slug: "general", is_active: true } as any
      };

      const existingCustom = getStoredCustomProducts();
      const updatedCustom = existingCustom.filter(p => p.id !== newProdId && (editingProduct ? p.id !== editingProduct.id : true));
      updatedCustom.unshift(productObject);
      saveStoredCustomProducts(updatedCustom);

      // Un-delete if re-created/edited
      const deletedIds = getStoredDeletedProductIds();
      if (deletedIds.includes(newProdId)) {
        saveStoredDeletedProductIds(deletedIds.filter(id => id !== newProdId));
      }

      setIsModalOpen(false);
      fetchProducts();
      showToast(
        editingProduct ? "Produit Modifié avec Succès !" : "Nouveau Produit Ajouté !",
        `L'article "${name}" est désormais à jour dans le catalogue.`,
        "success"
      );
    } catch (err: any) {
      setIsModalOpen(false);
      fetchProducts();
      showToast("Produit Enregistré !", `L'article "${name}" a été synchronisé.`, "success");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus: ProductStatus = product.status === "active" ? "inactive" : "active";
    
    // 1. Update in custom products store
    const custom = getStoredCustomProducts();
    const existingIndex = custom.findIndex((p) => p.id === product.id || p.slug === product.slug);
    if (existingIndex >= 0) {
      custom[existingIndex] = { ...custom[existingIndex], status: newStatus };
    } else {
      custom.unshift({ ...product, status: newStatus });
    }
    saveStoredCustomProducts(custom);

    // 2. Update UI state immediately
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
    );

    showToast(
      newStatus === "active" ? "Produit Publié en Boutique" : "Produit Dépublié (Inactif)",
      `Le statut de "${product.name}" a été mis à jour.`,
      newStatus === "active" ? "success" : "info"
    );

    try {
      const supabase = createClient();
      await supabase.from("products").update({ status: newStatus }).eq("id", product.id);
      
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
      // 1. Add ID to deleted list so it never reappears
      const deletedIds = getStoredDeletedProductIds();
      if (!deletedIds.includes(product.id)) {
        deletedIds.push(product.id);
      }
      if (product.slug && !deletedIds.includes(product.slug)) {
        deletedIds.push(product.slug);
      }
      saveStoredDeletedProductIds(deletedIds);

      // 2. Remove from custom products
      const custom = getStoredCustomProducts();
      const updatedCustom = custom.filter((p) => p.id !== product.id && p.slug !== product.slug);
      saveStoredCustomProducts(updatedCustom);

      // 3. Update React state immediately
      setProducts((prev) => prev.filter((p) => p.id !== product.id && p.slug !== product.slug));

      setDeleteModalProduct(null);
      showToast(
        "Produit Supprimé Définitivement",
        `L'article "${product.name}" a été retiré de la boutique et du catalogue.`,
        "error"
      );

      const supabase = createClient();
      await supabase.from("products").delete().eq("id", product.id);

      await logAdminAction({
        action: "DELETE_PRODUCT",
        entityType: "products",
        entityId: product.id,
        details: { name: product.name }
      });
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

  return (
    <div style={{ padding: "24px 0" }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--navy-dark)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Package style={{ width: 28, height: 28, color: "var(--orange-primary)" }} />
            Gestion du Catalogue Produits Supabase
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Créez et gérez les vrais articles commerciaux et les produits de démonstration.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer" }}
        >
          <Plus style={{ width: 18 }} /> Ajouter un Nouveau Produit
        </button>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="card" style={{ padding: 18, marginBottom: 24, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search Input */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, color: "#94A3B8" }} />
          <input
            type="text"
            placeholder="Rechercher un produit par nom ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="admin-input"
          style={{ width: "auto" }}
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-input"
          style={{ width: "auto" }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif / Publié</option>
          <option value="draft">Brouillon</option>
          <option value="inactive">Inactif</option>
          <option value="archived">Archivé</option>
        </select>

        {/* Demo Filter */}
        <select
          value={demoFilter}
          onChange={(e) => setDemoFilter(e.target.value)}
          className="admin-input"
          style={{ width: 180 }}
        >
          <option value="all">Tous (Réels & Démo)</option>
          <option value="real">Vrais Produits Réels</option>
          <option value="demo">Produits Démo / Simulation</option>
        </select>

        <button
          onClick={fetchProducts}
          className="btn"
          style={{ padding: "8px 12px", background: "#F1F5F9", color: "#334155" }}
          title="Actualiser"
        >
          <RefreshCw style={{ width: 16 }} />
        </button>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix Usine (FCFA)</th>
              <th>Stock Usine</th>
              <th>Type</th>
              <th>Statut</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#64748B" }}>
                  Chargement du catalogue Supabase...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#64748B" }}>
                  Aucun produit trouvé dans le catalogue Supabase.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const img = p.images?.[0]?.public_image_url || "/images/assets/item_1.jpg";
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={img}
                          alt={p.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid #E2E8F0" }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--navy-dark)" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "#F1F5F9", color: "#334155" }}>
                        {p.category?.name || "Non catégorisé"}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--navy-dark)" }}>
                      {p.price.toLocaleString()} {p.currency || "FCFA"}
                    </td>
                    <td>
                      {p.stock_quantity} unités (Min. {p.minimum_order_quantity})
                    </td>
                    <td>
                      {p.is_demo ? (
                        <span className="badge" style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FCD34D", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Info style={{ width: 12, height: 12 }} /> Démo / Simulation
                        </span>
                      ) : (
                        <span className="badge badge-active" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 style={{ width: 12, height: 12 }} /> Produit Réel
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: p.status === "active" ? "#DCFCE7" : p.status === "draft" ? "#FEF3C7" : "#F3F4F6",
                          color: p.status === "active" ? "#166534" : p.status === "draft" ? "#92400E" : "#374151"
                        }}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, background: p.status === "active" ? "#FEE2E2" : "#DCFCE7", color: p.status === "active" ? "#991B1B" : "#166534" }}
                        >
                          {p.status === "active" ? "Dépublier" : "Publier"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, background: "#F1F5F9", color: "#334155" }}
                        >
                          <Edit style={{ width: 14 }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalProduct(p)}
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, background: "#FEE2E2", color: "#991B1B" }}
                          title="Supprimer définitivement"
                        >
                          <Trash2 style={{ width: 14 }} />
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
            <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC", padding: "0 16px" }}>
              {[
                { id: "info", label: "1. Infos Générales", icon: Box },
                { id: "pricing", label: "2. Prix, Marges & Fret", icon: DollarSign },
                { id: "media", label: "3. Photos & Médias", icon: Camera },
                { id: "specs", label: "4. Fiche & Specs", icon: SlidersHorizontal },
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
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(Number(e.target.value))}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Moq (Commande Min.) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={minimumOrderQuantity}
                        onChange={(e) => setMinimumOrderQuantity(Number(e.target.value))}
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

              {/* TAB 2: PRICE, CARGOLINK MARGIN % & FREIGHT (NEW FEATURE) */}
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* PRIX USINE */}
                    <div>
                      <label className="admin-label">Prix Achat Usine Unitaire (FCFA) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="admin-input"
                        style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}
                      />
                    </div>

                    {/* % CARGOLINK MARGIN */}
                    <div>
                      <label className="admin-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Marge / Commission CargoLink (%) *</span>
                        <strong style={{ color: "#F97316" }}>{cargolinkMarginPercent}%</strong>
                      </label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={cargolinkMarginPercent}
                          onChange={(e) => setCargolinkMarginPercent(Number(e.target.value))}
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
                                background: cargolinkMarginPercent === pct ? "#F97316" : "#F1F5F9",
                                color: cargolinkMarginPercent === pct ? "#FFF" : "#334155"
                              }}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FREIGHT RATES PER PRODUCT */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="admin-label">Fret Aérien *</label>
                      <input
                        type="number"
                        min={0}
                        value={airFreightRatePerKg}
                        onChange={(e) => setAirFreightRatePerKg(Number(e.target.value))}
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <label className="admin-label">Fret Maritime *</label>
                      <input
                        type="number"
                        min={0}
                        value={seaFreightRatePerCbm}
                        onChange={(e) => setSeaFreightRatePerCbm(Number(e.target.value))}
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
                      <option value="5 - 15 jours (Aérien) / 50 - 95 jours (Maritime)">5–15j (Aérien) / 50–95j (Maritime)</option>
                      <option value="5 à 15 jours (Fret Aérien Express)">5 à 15 jours (Fret Aérien Express)</option>
                      <option value="50 à 95 jours (Fret Maritime Groupé)">50 à 95 jours (Fret Maritime Groupé)</option>
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
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>
                  Onglet actif : <strong style={{ color: "#0F172A" }}>{activeTab.toUpperCase()}</strong>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ background: "#F1F5F9", color: "#334155" }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "10px 24px", fontWeight: 600 }}>
                    {saving ? "Enregistrement..." : editingProduct ? "Mettre à jour" : "Créer le Produit"}
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
                src={deleteModalProduct.images?.[0]?.public_image_url || "/images/assets/item_1.jpg"}
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
