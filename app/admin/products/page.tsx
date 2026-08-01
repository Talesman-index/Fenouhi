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
  RefreshCw
} from "lucide-react";

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [demoFilter, setDemoFilter] = useState<string>("all"); // 'all' | 'real' | 'demo'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState<number>(10);
  const [countryOfOrigin, setCountryOfOrigin] = useState("Chine");
  const [weight, setWeight] = useState<number>(0.5);
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(8);
  const [height, setHeight] = useState<number>(5);
  const [availableShippingModes, setAvailableShippingModes] = useState<string[]>(["air", "sea"]);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("7-10 jours");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [isDemo, setIsDemo] = useState<boolean>(false); // DEFAULT FALSE for admin products
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState("/images/assets/item_1.jpg");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [categoryFilter, statusFilter, demoFilter]);

  async function fetchCategories() {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*").order("name", { ascending: true });
      if (data) setCategories(data as Category[]);
    } catch {}
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*)")
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") query = query.eq("category_id", categoryFilter);
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (demoFilter === "real") query = query.eq("is_demo", false);
      if (demoFilter === "demo") query = query.eq("is_demo", true);

      const { data, error } = await query;
      if (!error && data) {
        setProducts(data as Product[]);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
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

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setSlug("");
    setShortDescription("Produit usine certifié import direct Chine.");
    setDescription("Description détaillée des caractéristiques techniques et d'emballage usine.");
    setCategoryId(categories[0]?.id || "");
    setSubcategory("");
    setPrice(5000);
    setCurrency("FCFA");
    setStockQuantity(200);
    setMinimumOrderQuantity(10);
    setCountryOfOrigin("Chine");
    setWeight(0.5);
    setLength(10);
    setWidth(8);
    setHeight(5);
    setAvailableShippingModes(["air", "sea"]);
    setEstimatedDeliveryTime("7 - 10 jours");
    setStatus("active");
    setIsDemo(false); // Default REAL product
    setIsFeatured(false);
    setImageUrl("/images/assets/item_1.jpg");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSlug(product.slug);
    setShortDescription(product.short_description || "");
    setDescription(product.description || "");
    setCategoryId(product.category_id || categories[0]?.id || "");
    setSubcategory(product.subcategory || "");
    setPrice(product.price);
    setCurrency(product.currency || "FCFA");
    setStockQuantity(product.stock_quantity);
    setMinimumOrderQuantity(product.minimum_order_quantity);
    setCountryOfOrigin(product.country_of_origin || "Chine");
    setWeight(product.weight || 0.5);
    setLength(product.length || 10);
    setWidth(product.width || 8);
    setHeight(product.height || 5);
    setAvailableShippingModes(product.available_shipping_modes || ["air", "sea"]);
    setEstimatedDeliveryTime(product.estimated_delivery_time || "7-10 jours");
    setStatus(product.status);
    setIsDemo(product.is_demo);
    setIsFeatured(product.is_featured);
    setImageUrl(product.images?.[0]?.public_image_url || "/images/assets/item_1.jpg");
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert("Veuillez renseigner le nom et le slug du produit.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        name,
        slug: slug.trim(),
        short_description: shortDescription,
        description,
        category_id: categoryId || null,
        subcategory,
        price: Number(price),
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

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw new Error(error.message);

        // Update image
        if (editingProduct.images?.[0]?.id) {
          await supabase
            .from("product_images")
            .update({ public_image_url: imageUrl })
            .eq("id", editingProduct.images[0].id);
        } else {
          await supabase.from("product_images").insert({
            product_id: editingProduct.id,
            public_image_url: imageUrl,
            is_primary: true
          });
        }

        await logAdminAction({
          action: "UPDATE_PRODUCT",
          entityType: "products",
          entityId: editingProduct.id,
          details: { name, price, isDemo, status }
        });
      } else {
        const { data: newProd, error } = await supabase
          .from("products")
          .insert({
            ...payload,
            created_by: user?.id || null
          })
          .select()
          .single();

        if (error) throw new Error(error.message);

        if (newProd?.id) {
          await supabase.from("product_images").insert({
            product_id: newProd.id,
            public_image_url: imageUrl,
            is_primary: true
          });
        }

        await logAdminAction({
          action: "CREATE_PRODUCT",
          entityType: "products",
          entityId: newProd?.id || "new",
          details: { name, price, isDemo, status }
        });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(`Erreur lors de l'enregistrement : ${err.message || "Erreur Supabase"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus: ProductStatus = product.status === "active" ? "inactive" : "active";
    try {
      const supabase = createClient();
      await supabase.from("products").update({ status: newStatus }).eq("id", product.id);
      
      await logAdminAction({
        action: newStatus === "active" ? "PUBLISH_PRODUCT" : "UNPUBLISH_PRODUCT",
        entityType: "products",
        entityId: product.id,
        details: { name: product.name, oldStatus: product.status, newStatus }
      });

      fetchProducts();
    } catch (err: any) {
      alert("Erreur lors de la modification du statut.");
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le produit "${product.name}" ?`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").delete().eq("id", product.id);

      if (error) throw new Error(error.message);

      await logAdminAction({
        action: "DELETE_PRODUCT",
        entityType: "products",
        entityId: product.id,
        details: { name: product.name }
      });

      fetchProducts();
    } catch (err: any) {
      alert(`Erreur lors de la suppression : ${err.message}`);
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
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Package style={{ width: 28, height: 28, color: "var(--orange-primary)" }} />
            Gestion du Catalogue Produits Supabase
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Créez et gérez les vrais articles commerciaux et les produits de démonstration.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", fontWeight: 800 }}
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

        {/* Real vs Demo Filter */}
        <select
          value={demoFilter}
          onChange={(e) => setDemoFilter(e.target.value)}
          className="admin-input"
          style={{ width: "auto" }}
        >
          <option value="all">Tous (Réels & Démo)</option>
          <option value="real">✓ Vrais Produits Réels</option>
          <option value="demo">💡 Produits Démo / Simulation</option>
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
              <th>Prix Unitaire</th>
              <th>Stock Usine</th>
              <th>Type Article</th>
              <th>Statut</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                  Chargement des produits depuis Supabase...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
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
                          style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #E2E8F0" }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Slug: {p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 700 }}>
                      {p.category?.name || "Non catégorisé"}
                    </td>
                    <td style={{ fontSize: 14, fontWeight: 900, color: "var(--orange-primary)" }}>
                      {p.price.toLocaleString()} {p.currency}
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 700 }}>
                      {p.stock_quantity} unités (Min. {p.minimum_order_quantity})
                    </td>
                    <td>
                      {p.is_demo ? (
                        <span className="badge" style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>
                          💡 Démo / Simulation
                        </span>
                      ) : (
                        <span className="badge" style={{ background: "#DCFCE7", color: "#166534" }}>
                          ✓ Produit Réel
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
                          onClick={() => handleToggleStatus(p)}
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, background: p.status === "active" ? "#FEE2E2" : "#DCFCE7", color: p.status === "active" ? "#991B1B" : "#166534" }}
                        >
                          {p.status === "active" ? "Dépublier" : "Publier"}
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, background: "#F1F5F9", color: "#334155" }}
                        >
                          <Edit style={{ width: 14 }} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, background: "#FEE2E2", color: "#991B1B" }}
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
                {editingProduct ? `Modifier "${editingProduct.name}"` : "Créer un Vrai Produit Commercial"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* IS DEMO SWITCH */}
              <div style={{ background: isDemo ? "#FEF3C7" : "#F0FDF4", border: `1px solid ${isDemo ? "#FCD34D" : "#86EFAC"}`, padding: 14, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: isDemo ? "#92400E" : "#166534" }}>
                    {isDemo ? "💡 Produit de Démonstration / Simulation" : "✓ Vrai Produit Commercial"}
                  </div>
                  <div style={{ fontSize: 11.5, color: isDemo ? "#78350F" : "#15803D" }}>
                    {isDemo
                      ? "Ce produit est une simulation et ne sera pas inclus dans les vraies commandes."
                      : "Par défaut, les nouveaux produits créés par l'admin sont de VRAIS produits certifiés pour commandes réelles."}
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
                  <input
                    type="checkbox"
                    checked={isDemo}
                    onChange={(e) => setIsDemo(e.target.checked)}
                  />
                  Marquer Démo
                </label>
              </div>

              {/* NAME & SLUG */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="admin-label">Nom du Produit *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    className="admin-input"
                    placeholder="ex: Montre Connectée Pro"
                  />
                </div>
                <div>
                  <label className="admin-label">Slug URL *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="admin-input"
                    placeholder="ex: montre-connectee-pro"
                  />
                </div>
              </div>

              {/* CATEGORY & SUBCATEGORY */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
                <div>
                  <label className="admin-label">Sous-Catégorie</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="admin-input"
                    placeholder="ex: Électronique grand public"
                  />
                </div>
              </div>

              {/* PRICE, STOCK, MIN QTY */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label className="admin-label">Prix Unitaire (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Quantité Stock Usine *</label>
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

              {/* ORIGIN, WEIGHT, DELIVERY */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label className="admin-label">Pays d'Origine</label>
                  <input
                    type="text"
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Poids Unitaire (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Délai Estimé</label>
                  <input
                    type="text"
                    value={estimatedDeliveryTime}
                    onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* IMAGE URL */}
              <div>
                <label className="admin-label">URL de l'Image du Produit</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="admin-input"
                  placeholder="/images/assets/item_1.jpg"
                />
              </div>

              {/* SHORT & FULL DESCRIPTION */}
              <div>
                <label className="admin-label">Description Courte</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Description Complète</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="admin-input"
                  style={{ height: "auto" }}
                />
              </div>

              {/* STATUS & FEATURED */}
              <div style={{ display: "flex", gap: 20, alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: 14 }}>
                <div>
                  <label className="admin-label">Statut</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="admin-input">
                    <option value="active">Actif / Publié</option>
                    <option value="draft">Brouillon</option>
                    <option value="inactive">Inactif</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, marginTop: 18, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  Mettre en Avant (Featured)
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 14 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ background: "#F1F5F9", color: "#334155" }}>
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "10px 24px", fontWeight: 800 }}>
                  {saving ? "Enregistrement..." : editingProduct ? "Mettre à jour" : "Créer le Produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
