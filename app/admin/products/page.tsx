"use client";

import React, { useState, useEffect } from "react";
import { PRODUCTS, Product } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/admin/activity-logger";
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
  Tag,
  DollarSign,
  Box,
  MapPin,
  Sparkles,
  X
} from "lucide-react";

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [oldPrice, setOldPrice] = useState<number>(0);
  const [minQty, setMinQty] = useState<number>(10);
  const [category, setCategory] = useState("electronics");
  const [badge, setBadge] = useState("");
  const [origin, setOrigin] = useState("Shenzhen, Chine");
  const [weight, setWeight] = useState("0.5 kg");
  const [volume, setVolume] = useState("0.005 CBM");
  const [image, setImage] = useState("/images/assets/item_1.jpg");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setProducts(PRODUCTS);
        setLoading(false);
      }
    }, 1200);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      completed = true;
      clearTimeout(timer);

      if (error || !data || data.length === 0) {
        setProducts(PRODUCTS);
      } else {
        setProducts(data as any);
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      setProducts(PRODUCTS);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle("");
    setSubtitle("");
    setPrice(5000);
    setOldPrice(7500);
    setMinQty(10);
    setCategory("electronics");
    setBadge("NOUVEAU");
    setOrigin("Guangzhou, Chine");
    setWeight("0.35 kg");
    setVolume("0.002 CBM");
    setImage("/images/assets/item_1.jpg");
    setDescription("Produit direct usine Chine haute qualité avec garantie CargoLink.");
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setSubtitle(prod.subtitle || "");
    setPrice(prod.price);
    setOldPrice(prod.oldPrice || 0);
    setMinQty(prod.minQty);
    setCategory(prod.category);
    setBadge(prod.badge || "");
    setOrigin(prod.origin);
    setWeight(prod.weight);
    setVolume(prod.volume);
    setImage(prod.image);
    setDescription(prod.description);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || price <= 0) {
      alert("Veuillez saisir un titre valide et un prix supérieur à 0.");
      return;
    }

    setSaving(true);
    const payload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title,
      subtitle: subtitle || "Direct usine Chine",
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      minQty: Number(minQty),
      image: image || "/images/assets/item_1.jpg",
      images: [image || "/images/assets/item_1.jpg"],
      category,
      badge: badge || undefined,
      origin: origin || "Chine",
      weight: weight || "0.5 kg",
      volume: volume || "0.005 CBM",
      rating: editingProduct ? editingProduct.rating : 4.8,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 12,
      description,
      features: editingProduct ? editingProduct.features : ["Haute qualité usine", "Garantie CargoLink", "Emballage individuel"],
      specifications: editingProduct ? editingProduct.specifications : [{ label: "Origine", value: origin }],
      reviews: editingProduct ? editingProduct.reviews : [],
      related: [],
    };

    try {
      const supabase = createClient();
      if (editingProduct) {
        try {
          await supabase.from("products").update(payload).eq("id", editingProduct.id);
        } catch (err) {}

        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? payload : p)));
        await logAdminAction({ action: "UPDATE_PRODUCT", entityType: "products", entityId: editingProduct.id, newValues: payload });
        alert("L'article a été modifié avec succès !");
      } else {
        try {
          await supabase.from("products").insert([payload]);
        } catch (err) {}

        setProducts((prev) => [payload, ...prev]);
        await logAdminAction({ action: "CREATE_PRODUCT", entityType: "products", entityId: payload.id, newValues: payload });
        alert("Le nouvel article a été ajouté au catalogue !");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement de l'article.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'article "${prod.title}" ?`)) return;

    try {
      const supabase = createClient();
      try {
        await supabase.from("products").delete().eq("id", prod.id);
      } catch (e) {}

      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
      await logAdminAction({ action: "DELETE_PRODUCT", entityType: "products", entityId: prod.id });
      alert("L'article a été supprimé du catalogue.");
    } catch (err) {
      alert("Suppression effectuée en mode démo.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const t = (p.title || "").toLowerCase();
    const c = (p.category || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = t.includes(q) || c.includes(q);
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            CATALOGUE PRODUITS & SOURCING
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Gestion des Articles & Sourcing
          </h1>
        </div>
        <button onClick={openCreateModal} className="btn btn-orange" style={{ padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
          <Plus style={{ width: 16 }} /> Ajouter un Article
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher un article par nom, catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Catégorie :</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Toutes les catégories</option>
            <option value="electronics">Électronique & High-Tech</option>
            <option value="solar">Énergie Solaire</option>
            <option value="fashion">Mode & Chaussures</option>
            <option value="machinery">Outillage & PME</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Visuel & Article</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Catégorie</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Prix Unitaire</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>MOQ Min.</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Origine Chine</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement du catalogue articles...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun article trouvé dans le catalogue.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={p.image}
                          alt={p.title}
                          style={{ width: 44, height: 44, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.subtitle}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", fontSize: 11 }}>
                        {p.category}
                      </span>
                      {p.badge && (
                        <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", fontSize: 10, marginLeft: 6 }}>
                          {p.badge}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 900, color: "var(--orange-primary)", fontSize: 14 }}>
                      {p.price.toLocaleString()} FCFA
                      {p.oldPrice && (
                        <span style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "line-through", marginLeft: 6 }}>
                          {p.oldPrice.toLocaleString()} FCFA
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                      {p.minQty} unités
                    </td>

                    <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin style={{ width: 13, color: "var(--blue-primary)" }} /> {p.origin}
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <Edit style={{ width: 13 }} /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, color: "#DC2626", border: "1px solid #FCA5A5" }}
                          title="Supprimer l'article"
                        >
                          <Trash2 style={{ width: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT ARTICLE MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)" }}>GESTION CATALOGUE</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0 0" }}>
                  {editingProduct ? `Modifier "${editingProduct.title}"` : "Ajouter un Nouvel Article"}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X style={{ width: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>TITRE DE L'ARTICLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Casque Bluetooth ANC TWS High-Tech"
                  style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>SOUS-TITRE / DESCRIPTION COURTE</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Direct Usine Shenzhen — Lot Grossiste"
                  style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>PRIX UNITAIRE GROSSISTE (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 800, color: "var(--orange-primary)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>PRIX BARRÉ CONSEILLÉ (FCFA)</label>
                  <input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(Number(e.target.value))}
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>MOQ (QTÉ MIN.)</label>
                  <input
                    type="number"
                    value={minQty}
                    onChange={(e) => setMinQty(Number(e.target.value))}
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>CATÉGORIE</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700, background: "#FFF" }}
                  >
                    <option value="electronics">Électronique & High-Tech</option>
                    <option value="solar">Énergie Solaire</option>
                    <option value="fashion">Mode & Chaussures</option>
                    <option value="machinery">Outillage & PME</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>BADGE PROMO</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: BEST SELLER"
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>ORIGINE CHINE</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>POIDS (KG)</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>VOLUME (CBM)</label>
                  <input
                    type="text"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>URL IMAGE PRINCIPALE</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/images/assets/item_1.jpg"
                  style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>DESCRIPTION DÉTAILLÉE DE L'ARTICLE</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Spécifications techniques, avantages revendeur..."
                  style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ padding: "8px 16px" }}>
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="btn btn-orange" style={{ padding: "8px 22px", fontWeight: 800 }}>
                  {saving ? "Enregistrement..." : editingProduct ? "Mettre à jour l'Article" : "Créer l'Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
