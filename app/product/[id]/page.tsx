"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProductByIdOrSlug } from "@/lib/supabase/catalog";
import type { Product } from "@/types/catalog";
import {
  ShoppingBag,
  Heart,
  Share2,
  Star,
  Truck,
  ShieldCheck,
  Plane,
  Ship,
  Clock,
  Package,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  CheckCircle2,
  MessageSquare,
  Globe,
  ArrowRight,
  Award,
  Zap,
  AlertTriangle,
} from "lucide-react";

type TabId = "description" | "specs" | "reviews" | "shipping";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [shippingMode, setShippingMode] = useState<"air" | "sea">("air");
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      const data = await getProductByIdOrSlug(id);
      setProduct(data);
      setLoading(false);
      setActiveImage(0);
      if (data?.minimum_order_quantity) {
        setQuantity(data.minimum_order_quantity);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", background: "var(--bg-main)", color: "var(--navy-dark)", fontWeight: 700 }}>
        Chargement de la fiche produit depuis Supabase...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", background: "var(--bg-main)" }}>
        <h2 style={{ fontSize: 22, color: "var(--navy-dark)", marginBottom: 12 }}>Produit Introuvable</h2>
        <Link href="/catalog" className="btn btn-primary">Retour au Catalogue</Link>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.public_image_url) 
    : ["/images/assets/item_1.jpg"];
  const mainImage = productImages[activeImage] || productImages[0];

  // ===========================================================================
  // PRICE CALCULATION
  // ===========================================================================
  const unitPrice = product.price;
  const productTotal = quantity * unitPrice;
  const serviceFeeRate = 0.05;
  const serviceFee = Math.round(productTotal * serviceFeeRate);
  const airRatePerKg = 2500;   // FCFA/kg (air freight China → Bénin)
  const seaRateCBM = 95000;   // FCFA/CBM (sea freight)
  const estimatedWeight = (product.weight || 0.5) * quantity;
  const estimatedVolume = ((product.length || 0.1) * (product.width || 0.1) * (product.height || 0.1)) * quantity;
  const shippingFee =
    shippingMode === "air"
      ? Math.round(estimatedWeight * airRatePerKg)
      : Math.round(estimatedVolume * seaRateCBM);
  const total = productTotal + serviceFee + shippingFee;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categoryName = product.category?.name || "Catégorie Usine";

  const TABS: { id: TabId; label: string }[] = [
    { id: "description", label: "Description" },
    { id: "specs", label: "Spécifications" },
    { id: "reviews", label: "Avis & Évaluations" },
    { id: "shipping", label: "Livraison & Douane" },
  ];

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", paddingBottom: 60, width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
      <div className="container" style={{ paddingTop: 28, width: "100%", maxWidth: 1200, margin: "0 auto", paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" }}>

        {/* DEMO PRODUCT WARNING BANNER */}
        {product.is_demo && (
          <div style={{
            background: "#FEF3C7",
            border: "1px solid #F59E0B",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#92400E"
          }}>
            <AlertTriangle style={{ width: 24, height: 24, color: "#D97706", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 2 }}>
                💡 Produit de Démonstration (Simulation uniquement)
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.4, color: "#78350F" }}>
                Cet article est une fiche de démonstration à titre indicatif pour tester l'estimateur logistique. Les tarifs et délais affichés sont des estimations de simulation usine. Ce produit ne peut pas faire l'objet d'une commande commerciale réelle.
              </div>
            </div>
          </div>
        )}

        {/* BREADCRUMB */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-muted)", marginBottom: 24, flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontWeight: 600 }}>Accueil</Link>
          <ChevronRight style={{ width: 14 }} />
          <Link href="/catalog" style={{ color: "var(--text-muted)", fontWeight: 600 }}>Catalogue</Link>
          <ChevronRight style={{ width: 14 }} />
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            {categoryName}
          </span>
          <ChevronRight style={{ width: 14 }} />
          <span style={{ color: "var(--navy-dark)", fontWeight: 700, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.name}
          </span>
        </nav>

        {/* ================================================================ */}
        {/* TOP SECTION : GALLERY + BUY BOX                                  */}
        {/* ================================================================ */}
        <div className="product-detail-grid">

          {/* LEFT: IMAGE GALLERY */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Main Image */}
            <div className="product-main-image-container">
              {product.is_demo ? (
                <div className="product-badge-overlay" style={{ background: "#FEF3C7", color: "#92400E" }}>💡 DÉMO</div>
              ) : (
                <div className="product-badge-overlay" style={{ background: "#DCFCE7", color: "#166534" }}>✓ RÉEL</div>
              )}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="product-favorite-btn"
                aria-label="Ajouter aux favoris"
              >
                <Heart
                  style={{ width: 20, fill: isFavorite ? "#EF4444" : "none", color: isFavorite ? "#EF4444" : "#64748B" }}
                />
              </button>
              <img
                src={mainImage}
                alt={product.name}
                className="product-main-image"
              />
            </div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className="product-thumb"
                    style={{ borderColor: activeImage === idx ? "var(--orange-primary)" : "var(--border-light)", flexShrink: 0 }}
                  >
                    <img src={img} alt={`Vue ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="card" style={{ padding: "14px 18px" }}>
              <div className="product-trust-badges-grid">
                {[
                  { icon: ShieldCheck, label: "Inspection qualité", sub: "Chaque lot vérifié" },
                  { icon: Award, label: "Origine certifiée", sub: "Fournisseur vérifié" },
                  { icon: Package, label: "Emballage renforcé", sub: "Protection transit" },
                  { icon: Globe, label: "Dédouanement", sub: "Assistance incluse" },
                ].map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--blue-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: 16, color: "var(--blue-primary)" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)" }}>{b.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: BUY BOX */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Product Title Block */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {product.is_demo ? (
                  <span className="badge" style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>
                    💡 DÉMONSTRATION / SIMULATION
                  </span>
                ) : (
                  <span className="badge" style={{ background: "#DCFCE7", color: "#166534" }}>
                    ✓ PRODUIT RÉEL CERTIFIÉ
                  </span>
                )}
                <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)" }}>
                  DIRECT USINE — {product.country_of_origin || "Chine"}
                </span>
              </div>

              <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--navy-dark)", lineHeight: 1.25, marginBottom: 6 }}>
                {product.name}
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>{product.short_description}</p>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      style={{ width: 16, fill: "#F59E0B", color: "#F59E0B" }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy-dark)" }}>5.0</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>(Stock usine: {product.stock_quantity} unités)</span>
              </div>

              {/* Price Display */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20, padding: "12px 0", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)", flexWrap: "wrap" }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: "var(--orange-primary)" }}>
                  {unitPrice.toLocaleString()} FCFA
                </span>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>/unité</span>
                {(product as any).oldPrice && (
                  <span style={{ fontSize: 15, color: "#94A3B8", textDecoration: "line-through", fontWeight: 600 }}>
                    {((product as any).oldPrice).toLocaleString()} FCFA
                  </span>
                )}
                {(product as any).oldPrice && (
                  <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 800 }}>
                    -{Math.round((1 - unitPrice / (product as any).oldPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  QUANTITÉ À COMMANDER :
                </label>
                <div style={{ display: "inline-flex", alignItems: "center", border: "2px solid var(--border-light)", borderRadius: "var(--radius-sm)", overflow: "hidden", userSelect: "none" }}>
                  <button
                    type="button"
                    aria-label="Diminuer la quantité"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", border: "none", cursor: "pointer", color: "var(--navy-dark)" }}
                  >
                    <Minus style={{ width: 16, height: 16 }} />
                  </button>
                  <span
                    style={{ minWidth: 60, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "var(--navy-dark)", background: "#FFF", borderLeft: "1px solid var(--border-light)", borderRight: "1px solid var(--border-light)", paddingInline: 12 }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Augmenter la quantité"
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", border: "none", cursor: "pointer", color: "var(--navy-dark)" }}
                  >
                    <Plus style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>

              {/* Shipping Mode */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                  MODE D'EXPÉDITION :
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { value: "air" as const, icon: Plane, label: "Fret Aérien", sub: "10–18 jours", color: "#0369A1" },
                    { value: "sea" as const, icon: Ship, label: "Fret Maritime", sub: "30–45 jours", color: "#059669" },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.value}
                        onClick={() => setShippingMode(m.value)}
                        style={{
                          flex: 1,
                          padding: "12px 10px",
                          borderRadius: "var(--radius-sm)",
                          border: `2px solid ${shippingMode === m.value ? m.color : "var(--border-light)"}`,
                          background: shippingMode === m.value ? (m.value === "air" ? "#E0F2FE" : "#DCFCE7") : "#FFF",
                          cursor: "pointer",
                          textAlign: "center"
                        }}
                      >
                        <Icon style={{ width: 20, color: m.color, display: "block", margin: "0 auto 4px" }} />
                        <div style={{ fontSize: 12, fontWeight: 800, color: m.color }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ background: "var(--bg-main)", padding: 16, borderRadius: "var(--radius-sm)", marginBottom: 20, border: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", marginBottom: 10 }}>
                  ESTIMATION DE COÛT TOTAL
                </div>
                {[
                  { label: `Marchandise (${quantity} × ${unitPrice.toLocaleString()})`, value: productTotal },
                  { label: "Frais de service CargoLink (5%)", value: serviceFee },
                  { label: `Fret estimé (${shippingMode === "air" ? "aérien" : "maritime"})`, value: shippingFee },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontWeight: 800, color: "var(--navy-dark)" }}>{row.value.toLocaleString()} FCFA</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: 10, marginTop: 6 }}>
                  <span style={{ fontWeight: 900, fontSize: 14, color: "var(--navy-dark)" }}>Total estimé</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: "var(--orange-primary)" }}>
                    {total.toLocaleString()} FCFA
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  * Estimation indicative. Le devis officiel inclut les taxes douanières selon le pays de destination.
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link
                  href={`/quote-request?prod=${encodeURIComponent(product.name)}&qty=${quantity}&mode=${shippingMode}`}
                  className="btn btn-orange"
                  style={{ padding: "14px 20px", textAlign: "center", fontWeight: 900, fontSize: 14.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: "var(--radius-sm)" }}
                >
                  <ShoppingBag style={{ width: 20 }} />
                  Obtenir le Devis Officiel d'Expédition
                </Link>
                <Link
                  href="/contact"
                  className="btn"
                  style={{ padding: "12px 20px", textAlign: "center", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "2px solid var(--navy-dark)", background: "transparent", color: "var(--navy-dark)", borderRadius: "var(--radius-sm)" }}
                >
                  <MessageSquare style={{ width: 16 }} />
                  Parler à un Agent CargoLink
                </Link>
              </div>

              {/* Share */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
                <button
                  onClick={handleCopyLink}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}
                >
                  <Share2 style={{ width: 14 }} />
                  {copied ? "Lien copié !" : "Partager"}
                </button>
              </div>
            </div>

            {/* Delivery Info Banner */}
            <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, background: "#FFFBEB", border: "1px solid #FCD34D" }}>
              <Clock style={{ width: 22, color: "#D97706", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: "#92400E" }}>
                  Délai estimé : {shippingMode === "air" ? "10–18 jours" : "30–45 jours"} après confirmation de paiement
                </div>
                <div style={{ fontSize: 11.5, color: "#B45309" }}>
                  Inclus : Transit international + procédure de dédouanement Bénin
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TABS SECTION                                                      */}
        {/* ================================================================ */}
        <div style={{ marginTop: 40, width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "hidden", boxSizing: "border-box" }}>
          <div className="product-tabs-bar" style={{ display: "flex", borderBottom: "2px solid var(--border-light)", gap: 12, marginBottom: 24, overflowX: "auto", whiteSpace: "nowrap", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", paddingBottom: 4, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 10px",
                  fontSize: 13.5,
                  fontWeight: activeTab === tab.id ? 900 : 600,
                  color: activeTab === tab.id ? "var(--orange-primary)" : "var(--text-muted)",
                  borderBottom: activeTab === tab.id ? "3px solid var(--orange-primary)" : "none",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: -2,
                  flexShrink: 0,
                  whiteSpace: "nowrap"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="product-tab-content-container">
            {/* DESCRIPTION */}
            {activeTab === "description" && (
              <div>
                <p style={{ fontSize: 14.5, color: "var(--navy-dark)", lineHeight: 1.8, marginBottom: 24 }}>
                  {product.description || product.short_description || "Aucune description détaillée."}
                </p>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 14 }}>
                  Caractéristiques clés
                </h3>
                <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                  {((product as any).features || ["Formule usine certifiée ISO", "Testé en laboratoire avant expédition", "Garantie CargoLink 100%"]).map((f: string) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <CheckCircle2 style={{ width: 18, color: "var(--green-success)", flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--navy-dark)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SPECIFICATIONS */}
            {activeTab === "specs" && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 16 }}>Fiche Technique Complète</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 280 }}>
                    <tbody>
                      {((product as any).specifications || []).map((spec: any, idx: number) => (
                        <tr key={spec.label} style={{ background: idx % 2 === 0 ? "var(--bg-main)" : "#FFF" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 13, color: "var(--text-muted)", width: "38%" }}>
                            {spec.label}
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--navy-dark)" }}>
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: "var(--bg-main)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 13, color: "var(--text-muted)" }}>Poids unitaire</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--navy-dark)" }}>{product.weight || 0.5} kg</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 13, color: "var(--text-muted)" }}>Origine</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--navy-dark)" }}>{product.country_of_origin || "Chine"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <div>
                {/* Rating Summary */}
                <div className="product-reviews-summary-box">
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 52, fontWeight: 900, color: "var(--navy-dark)", lineHeight: 1 }}>5.0</div>
                    <div style={{ display: "flex", gap: 3, justifyContent: "center", margin: "6px 0" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} style={{ width: 16, fill: "#F59E0B", color: "#F59E0B" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Stock usine disponible</div>
                  </div>

                  {/* Bar chart */}
                  <div style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map((s) => {
                      const pct = s === 5 ? 100 : 0;
                      return (
                        <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)", width: 8, fontWeight: 700 }}>{s}</span>
                          <Star style={{ width: 13, fill: "#F59E0B", color: "#F59E0B" }} />
                          <div style={{ flex: 1, height: 6, background: "#E2E8F0", borderRadius: 9999 }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#F59E0B", borderRadius: 9999 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "var(--text-muted)", width: 30, fontWeight: 600 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SHIPPING */}
            {activeTab === "shipping" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[
                  {
                    icon: Plane,
                    color: "#0369A1",
                    bg: "#E0F2FE",
                    title: "Fret Aérien",
                    delay: "10–18 jours",
                    rate: `${airRatePerKg.toLocaleString()} FCFA/kg`,
                    points: [
                      "Recommandé pour électronique & mode",
                      "Suivi en temps réel express",
                      "Assurance transit incluse",
                      "Dédouanement prioritaire Cotonou",
                    ],
                  },
                  {
                    icon: Ship,
                    color: "#059669",
                    bg: "#DCFCE7",
                    title: "Fret Maritime",
                    delay: "30–45 jours",
                    rate: `${seaRateCBM.toLocaleString()} FCFA/CBM`,
                    points: [
                      "Idéal pour gros volumes et machines",
                      "Tarif le plus compétitif disponible",
                      "FCL & LCL (groupage) disponible",
                      "Entrepôt de groupage Guangzhou",
                    ],
                  },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <div key={mode.title} style={{ padding: 18, background: mode.bg, borderRadius: "var(--radius-md)", border: `1px solid ${mode.color}33` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon style={{ width: 20, color: mode.color }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 15, color: mode.color }}>{mode.title}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: mode.color, opacity: 0.8 }}>{mode.delay}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: mode.color, marginBottom: 10 }}>
                        Tarif : {mode.rate}
                      </div>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                        {mode.points.map((p) => (
                          <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5 }}>
                            <CheckCircle2 style={{ width: 15, color: mode.color, flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontWeight: 600, color: "#1E293B" }}>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                {/* Customs Info */}
                <div style={{ gridColumn: "1 / -1", padding: 18, background: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <ShieldCheck style={{ width: 20, color: "var(--blue-primary)" }} />
                    <span style={{ fontWeight: 900, fontSize: 15, color: "var(--navy-dark)" }}>Dédouanement & Conformité</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, fontSize: 12.5, color: "var(--navy-dark)" }}>
                    {[
                      "Documents douaniers préparés par CargoLink",
                      "Déclaration de valeur conforme aux normes UEMOA",
                      "Accompagnement pour TOGO, BÉNIN, NIGER, MALI, SÉNÉGAL",
                      "Frais douaniers estimés fournis sur le devis officiel",
                    ].map((p) => (
                      <div key={p} style={{ display: "flex", gap: 8 }}>
                        <Zap style={{ width: 14, color: "var(--blue-primary)", flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontWeight: 600 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM CTA BANNER */}
        <div className="product-bottom-cta-banner">
          <div>
            <div style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 900, color: "#FFF", marginBottom: 6 }}>
              Prêt à commander ? Notre équipe vous accompagne.
            </div>
            <div style={{ fontSize: 13.5, color: "#94A3B8" }}>
              Devis gratuit en 24h · Inspection qualité · Livraison porte-à-porte
            </div>
          </div>
          <Link
            href={`/quote-request?prod=${encodeURIComponent(product.name)}&qty=${quantity}`}
            className="btn"
            style={{ background: "var(--orange-primary)", color: "#FFF", padding: "12px 24px", fontSize: 13.5, fontWeight: 900, borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}
          >
            <ShoppingBag style={{ width: 18 }} /> Obtenir mon Devis Gratuit
          </Link>
        </div>

      </div>
    </div>
  );
}
