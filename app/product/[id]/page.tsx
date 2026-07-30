"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProductById, getRelatedProducts, PRODUCTS } from "@/lib/products";
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
} from "lucide-react";

type TabId = "description" | "specs" | "reviews" | "shipping";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "1";

  const product = getProductById(id);

  const [quantity, setQuantity] = useState(1);
  const [shippingMode, setShippingMode] = useState<"air" | "sea">("air");
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  const relatedProducts = product ? getRelatedProducts(product.related) : [];

  useEffect(() => {
    if (!product) router.push("/catalog");
  }, [product]);

  if (!product) return null;

  // ===========================================================================
  // PRICE CALCULATION
  // ===========================================================================
  const unitPrice = product.price;
  const productTotal = quantity * unitPrice;
  const serviceFeeRate = 0.05;
  const serviceFee = Math.round(productTotal * serviceFeeRate);
  const airRatePerKg = 2500;   // FCFA/kg (air freight China → Bénin)
  const seaRateCBM = 95000;   // FCFA/CBM (sea freight)
  const estimatedWeight = parseFloat(product.weight) * quantity;
  const estimatedVolume = parseFloat(product.volume) * quantity;
  const shippingFee =
    shippingMode === "air"
      ? Math.round(estimatedWeight * airRatePerKg)
      : Math.round(estimatedVolume * seaRateCBM);
  const total = productTotal + serviceFee + shippingFee;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryLabel: Record<string, string> = {
    electronics: "High-Tech & Audio",
    fashion: "Mode & Chaussures",
    beauty: "Beauté & Soins",
    machinery: "Outillage & PME",
  };

  const TABS: { id: TabId; label: string }[] = [
    { id: "description", label: "Description" },
    { id: "specs", label: "Spécifications" },
    { id: "reviews", label: `Avis (${product.reviews.length})` },
    { id: "shipping", label: "Livraison & Douane" },
  ];

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 28 }}>

        {/* ================================================================ */}
        {/* BREADCRUMB                                                        */}
        {/* ================================================================ */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-muted)", marginBottom: 24, flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontWeight: 600 }}>Accueil</Link>
          <ChevronRight style={{ width: 14 }} />
          <Link href="/catalog" style={{ color: "var(--text-muted)", fontWeight: 600 }}>Catalogue</Link>
          <ChevronRight style={{ width: 14 }} />
          <Link href={`/catalog?cat=${product.category}`} style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            {categoryLabel[product.category] || product.category}
          </Link>
          <ChevronRight style={{ width: 14 }} />
          <span style={{ color: "var(--navy-dark)", fontWeight: 700, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.title}
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
              {product.badge && (
                <div className="product-badge-overlay">{product.badge}</div>
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
                src={product.images[activeImage]}
                alt={product.title}
                className="product-main-image"
              />
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div style={{ display: "flex", gap: 10 }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className="product-thumb"
                    style={{ borderColor: activeImage === idx ? "var(--orange-primary)" : "var(--border-light)" }}
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
                {product.badge && (
                  <span className="badge" style={{ background: "#FEE2E2", color: "#991B1B" }}>{product.badge}</span>
                )}
                <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)" }}>
                  DIRECT USINE — {product.origin}
                </span>
              </div>

              <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--navy-dark)", lineHeight: 1.25, marginBottom: 6 }}>
                {product.title}
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>{product.subtitle}</p>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      style={{ width: 16, fill: s <= Math.round(product.rating) ? "#F59E0B" : "none", color: s <= Math.round(product.rating) ? "#F59E0B" : "#D1D5DB" }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy-dark)" }}>{product.rating}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({product.reviewsCount} avis)</span>
              </div>

              {/* Price Display */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20, padding: "12px 0", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: "var(--orange-primary)" }}>
                  {unitPrice.toLocaleString()} FCFA
                </span>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>/unité</span>
                {product.oldPrice && (
                  <span style={{ fontSize: 15, color: "#94A3B8", textDecoration: "line-through", fontWeight: 600 }}>
                    {product.oldPrice.toLocaleString()} FCFA
                  </span>
                )}
                {product.oldPrice && (
                  <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 800 }}>
                    -{Math.round((1 - unitPrice / product.oldPrice) * 100)}%
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
                  href={`/quote-request?prod=${encodeURIComponent(product.title)}&qty=${quantity}&mode=${shippingMode}`}
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
                  Inspection qualité + dédouanement + livraison à Cotonou inclus
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TABS SECTION                                                      */}
        {/* ================================================================ */}
        <div className="card" style={{ padding: 0, overflow: "hidden", marginTop: 28 }}>
          {/* Tab Headers */}
          <div className="product-tabs-header">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "16px 24px",
                  fontWeight: activeTab === tab.id ? 900 : 700,
                  fontSize: 14,
                  color: activeTab === tab.id ? "var(--navy-dark)" : "var(--text-muted)",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "3px solid var(--orange-primary)" : "3px solid transparent",
                  marginBottom: -2,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
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
                  {product.description}
                </p>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 14 }}>
                  Caractéristiques clés
                </h3>
                <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                  {product.features.map((f) => (
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
                      {product.specifications.map((spec, idx) => (
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
                        <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--navy-dark)" }}>{product.weight}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 13, color: "var(--text-muted)" }}>Volume unitaire</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--navy-dark)" }}>{product.volume}</td>
                      </tr>
                      <tr style={{ background: "var(--bg-main)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 13, color: "var(--text-muted)" }}>Origine</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--navy-dark)" }}>{product.origin}</td>
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
                    <div style={{ fontSize: 52, fontWeight: 900, color: "var(--navy-dark)", lineHeight: 1 }}>{product.rating}</div>
                    <div style={{ display: "flex", gap: 3, justifyContent: "center", margin: "6px 0" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} style={{ width: 16, fill: s <= Math.round(product.rating) ? "#F59E0B" : "none", color: s <= Math.round(product.rating) ? "#F59E0B" : "#D1D5DB" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{product.reviewsCount} avis</div>
                  </div>

                  {/* Bar chart */}
                  <div style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map((s) => {
                      const pct = s === 5 ? 68 : s === 4 ? 22 : s === 3 ? 7 : s === 2 ? 2 : 1;
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

                {/* Reviews List */}
                {product.reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                    <MessageSquare style={{ width: 40, margin: "0 auto 12px", opacity: 0.3 }} />
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Aucun avis texte pour ce produit.</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Soyez le premier à noter ce produit après votre commande !</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {product.reviews.map((review, idx) => (
                      <div key={idx} style={{ padding: 18, background: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--orange-primary)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15 }}>
                              {review.author[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--navy-dark)" }}>{review.author}</div>
                              <div style={{ display: "flex", gap: 2 }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} style={{ width: 13, fill: s <= review.rating ? "#F59E0B" : "none", color: s <= review.rating ? "#F59E0B" : "#D1D5DB" }} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{review.date}</span>
                        </div>
                        <p style={{ fontSize: 13.5, color: "var(--navy-dark)", lineHeight: 1.7 }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SHIPPING */}
            {activeTab === "shipping" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
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
                    <div key={mode.title} style={{ padding: 20, background: mode.bg, borderRadius: "var(--radius-md)", border: `1px solid ${mode.color}33` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon style={{ width: 22, color: mode.color }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 16, color: mode.color }}>{mode.title}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: mode.color, opacity: 0.8 }}>{mode.delay}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: mode.color, marginBottom: 10 }}>
                        Tarif : {mode.rate}
                      </div>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                        {mode.points.map((p) => (
                          <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
                            <CheckCircle2 style={{ width: 15, color: mode.color, flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontWeight: 600, color: "#1E293B" }}>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                {/* Customs Info */}
                <div style={{ gridColumn: "1 / -1", padding: 20, background: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <ShieldCheck style={{ width: 20, color: "var(--blue-primary)" }} />
                    <span style={{ fontWeight: 900, fontSize: 15, color: "var(--navy-dark)" }}>Dédouanement & Conformité</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, fontSize: 13, color: "var(--navy-dark)" }}>
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

        {/* ================================================================ */}
        {/* RELATED PRODUCTS                                                  */}
        {/* ================================================================ */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--navy-dark)" }}>Produits Similaires</h2>
              <Link href="/catalog" style={{ fontSize: 13, fontWeight: 800, color: "var(--orange-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                Voir tout le catalogue <ArrowRight style={{ width: 16 }} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/product/${rp.id}`}
                  style={{ display: "block", background: "#FFF", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", overflow: "hidden", transition: "all 0.2s", boxShadow: "var(--shadow-sm)" }}
                  className="product-related-card"
                >
                  <div style={{ height: 180, overflow: "hidden", background: "#F8FAFC" }}>
                    <img src={rp.image} alt={rp.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy-dark)", marginBottom: 6, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {rp.title}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: "var(--orange-primary)" }}>{rp.price.toLocaleString()} FCFA</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Min. {rp.minQty}u.</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* BOTTOM CTA BANNER                                                 */}
        {/* ================================================================ */}
        <div style={{ marginTop: 40, background: "linear-gradient(135deg, var(--navy-dark) 0%, #1E3A5F 100%)", borderRadius: "var(--radius-xl)", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#FFF", marginBottom: 6 }}>
              Prêt à commander ? Notre équipe vous accompagne.
            </div>
            <div style={{ fontSize: 14, color: "#94A3B8" }}>
              Devis gratuit en 24h · Inspection qualité · Livraison porte-à-porte
            </div>
          </div>
          <Link
            href={`/quote-request?prod=${encodeURIComponent(product.title)}&qty=${quantity}`}
            className="btn"
            style={{ background: "var(--orange-primary)", color: "#FFF", padding: "14px 28px", fontSize: 14, fontWeight: 900, borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}
          >
            <ShoppingBag style={{ width: 18 }} /> Obtenir mon Devis Gratuit
          </Link>
        </div>

      </div>
    </div>
  );
}
