"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProductByIdOrSlug, getProductImageUrl } from "@/lib/supabase/catalog";
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
  Plus,
  Minus,
  CheckCircle2,
  MessageSquare,
  Globe,
  ArrowRight,
  Award,
  Check,
  Folder,
  Calculator,
  Box,
  MapPin,
  Lock,
  Building2,
} from "lucide-react";
import { MobileStoreProvider, useMobileStore } from "@/lib/mobile-store";
import PhoneStateBadge from "@/components/PhoneStateBadge";

type TabId = "description" | "specs" | "shipping" | "reviews";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  const {
    formatPrice,
    addToCart,
    toggleFavorite,
    isFavorite,
    currency,
  } = useMobileStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [shippingMode, setShippingMode] = useState<"air" | "sea">("air");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      const data = await getProductByIdOrSlug(id);
      setProduct(data);
      if (data?.storage_options && data.storage_options.length > 0) {
        setSelectedStorage(data.storage_options[0]);
      }
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
      <div style={{ padding: "100px 0", textAlign: "center", background: "#FAF7F2", color: "#0F172A", fontWeight: 700 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTopColor: "#0284C7", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        Chargement de la fiche produit FENOUHI...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", background: "#FAF7F2", minHeight: "70vh" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>Produit Indisponible</h2>
        <p style={{ color: "#64748B", marginBottom: 20 }}>Cet article n'est actuellement pas disponible ou a été retiré de la vente.</p>
        <Link href="/catalog" style={{ background: "#0F172A", color: "#FFF", padding: "12px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 600 }}>
          Retour au Catalogue
        </Link>
      </div>
    );
  }

  const productImages = Array.isArray(product.images) && product.images.length > 0 
    ? product.images.map((img: any) => typeof img === "string" ? img : (img?.public_image_url || img?.url || "/images/assets/hero_iphone16.png"))
    : [getProductImageUrl(product)];
  const mainImage = productImages[activeImage] || productImages[0] || "/images/assets/hero_iphone16.png";

  // Beauty product detection (no international freight charged)
  const isBeauty =
    product.category?.slug === "beauty" ||
    (product as any).category === "beauty" ||
    (product as any).category === "Beauté & Soins" ||
    product.id?.includes("disaar") ||
    product.id?.includes("efero") ||
    product.id?.includes("masque") ||
    product.id?.includes("snail") ||
    product.id?.includes("rashel") ||
    product.id?.includes("aichun") ||
    product.id?.includes("roushun") ||
    product.id?.includes("savon-papaye") ||
    product.id?.includes("vapeur");

  // Freight rates per unit
  const airRatePerKg = product.air_freight_rate_per_kg !== undefined && product.air_freight_rate_per_kg !== null
    ? Number(product.air_freight_rate_per_kg)
    : (isBeauty ? 0 : 0);
  const seaRatePerCbm = product.sea_freight_rate_per_cbm !== undefined && product.sea_freight_rate_per_cbm !== null
    ? Number(product.sea_freight_rate_per_cbm)
    : 0;

  const weightKg = Number(product.weight || 0);
  const unitAirFreight = (isBeauty || airRatePerKg === 0) ? 0 : Math.round(weightKg * airRatePerKg);
  const unitSeaFreight = (isBeauty || seaRatePerCbm === 0) ? 0 : Math.round(0.01 * seaRatePerCbm);

  // Check if freight applies (fret > 0)
  const hasFreight = !isBeauty && (unitAirFreight > 0 || unitSeaFreight > 0 || (airRatePerKg > 0) || (seaRatePerCbm > 0));

  // Margin / Service rate from product configuration (5% standard Service & Contrôle Qualité Usine)
  const marginPercent = product.cargolink_margin_percent !== undefined && product.cargolink_margin_percent !== null
    ? Number(product.cargolink_margin_percent)
    : 5;
  const serviceRate = marginPercent / 100;

  // Pricing calculations
  const unitPrice = Number(product.price) || 0;
  const productTotal = quantity * unitPrice;
  const serviceFee = Math.round(productTotal * serviceRate);
  const shippingFee = hasFreight ? (shippingMode === "air" ? quantity * unitAirFreight : quantity * unitSeaFreight) : 0;
  const total = productTotal + serviceFee + shippingFee;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    const itemName = selectedStorage ? `${product.name} (${selectedStorage})` : product.name;
    addToCart({
      id: product.id,
      name: itemName,
      category: product.category?.name || (isBeauty ? "Beauté & Soins" : "Général"),
      price: product.price,
      oldPrice: (product as any).oldPrice || Math.round(product.price * 1.25),
      image: mainImage,
      quantity: quantity,
      shippingMode: shippingMode,
      deliveryRange: hasFreight ? (shippingMode === "air" ? "Express 5-12j (Cotonou)" : "Maritime 40-65j (Port Cotonou)") : "Livraison Directe Cotonou",
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 4000);
  };

  const categoryName = product.category?.name || "Catégorie Usine";

  const TABS: { id: TabId; label: string }[] = [
    { id: "description", label: "Description Détaillée" },
    { id: "specs", label: "Fiche Technique & Colisage" },
    ...(hasFreight ? [{ id: "shipping" as TabId, label: "Logistique Chine ➔ Bénin" }] : []),
    { id: "reviews", label: "Avis Clients Vérifiés (5.0)" },
  ];

  const fav = isFavorite(product.id);

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", padding: "20px 0 60px" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>

        {/* TOAST NOTIFICATION */}
        {addedToast && (
          <div
            style={{
              position: "fixed",
              bottom: 30,
              right: 30,
              background: "#0F172A",
              color: "#FFFFFF",
              padding: "16px 22px",
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              gap: 12,
              animation: "slideUp 0.3s ease",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check style={{ width: 16, height: 16, strokeWidth: 3 }} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Article ajouté au panier !</div>
              <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{quantity}x {product.name}</div>
            </div>
            <Link
              href="/cart"
              style={{
                marginLeft: 8,
                background: "#16A34A",
                color: "#FFF",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Voir le Panier
            </Link>
          </div>
        )}

        {/* BREADCRUMB */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#64748B",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={{ color: "#64748B", textDecoration: "none", fontWeight: 600 }}>Accueil</Link>
          <ChevronRight style={{ width: 14, height: 14, color: "#CBD5E1" }} />
          <Link href="/catalog" style={{ color: "#64748B", textDecoration: "none", fontWeight: 600 }}>Catalogue</Link>
          <ChevronRight style={{ width: 14, height: 14, color: "#CBD5E1" }} />
          <span style={{ color: "#64748B", fontWeight: 600 }}>{categoryName}</span>
          <ChevronRight style={{ width: 14, height: 14, color: "#CBD5E1" }} />
          <span style={{ color: "#0F172A", fontWeight: 600, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.name}
          </span>
        </nav>

        {/* MAIN PRODUCT GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32, alignItems: "start" }}>

          {/* LEFT: GALLERY & ASSURANCE */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* MAIN IMAGE CARD */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                padding: "20px",
                border: "1px solid #E2D9CC",
                position: "relative",
                boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
              }}
            >
              {/* SOURCING PILL BADGE */}
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  background: "#0F172A",
                  color: "#FBBF24",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: 999,
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  border: "1px solid rgba(251, 191, 36, 0.4)",
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.25)",
                }}
              >
                <Building2 style={{ width: 14, height: 14, color: "#FBBF24" }} />
                <span>DIRECT USINE CHINE</span>
              </div>

              {/* FAVORITE BUTTON */}
              <button
                onClick={() =>
                  toggleFavorite({
                    id: product.id,
                    name: product.name,
                    category: categoryName,
                    price: product.price,
                    oldPrice: (product as any).oldPrice || Math.round(product.price * 1.2),
                    image: mainImage,
                    inStock: true,
                  })
                }
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: fav ? "#FEF2F2" : "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: fav ? "#DC2626" : "#64748B",
                  transition: "all 0.2s ease",
                }}
                title="Ajouter aux favoris"
              >
                <Heart style={{ width: 20, height: 20, fill: fav ? "#DC2626" : "none", strokeWidth: 2 }} />
              </button>

              <img
                src={mainImage}
                alt={product.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: 380,
                  objectFit: "contain",
                  borderRadius: 16,
                }}
              />
            </div>

            {/* THUMBNAIL STRIP */}
            {productImages.length > 1 && (
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      border: activeImage === idx ? "2px solid #0284C7" : "1.5px solid #E2E8F0",
                      background: "#FFFFFF",
                      padding: 4,
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <img src={img} alt={`Vue ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                  </button>
                ))}
              </div>
            )}

            {/* 4 TRUST & QUALITY PILLARS (STYLE LIGNE ÉPURÉE D'AMBRE USINE) */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: "24px 16px",
                border: "1px solid #E2D9CC",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px 16px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
                <ShieldCheck style={{ width: 34, height: 34, color: "#D97706", strokeWidth: 1.6 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>Contrôle Qualité</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Inspecté en usine Chine</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
                <Award style={{ width: 34, height: 34, color: "#D97706", strokeWidth: 1.6 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>Origine Certifiée</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Fournisseur 100% audité</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
                <Package style={{ width: 34, height: 34, color: "#D97706", strokeWidth: 1.6 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>Emballage Export</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Sécurisé & renforcé</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
                <Truck style={{ width: 34, height: 34, color: "#D97706", strokeWidth: 1.6 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>Dédouanement Cotonou</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>100% Inclus sans surprise</div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: BUY BOX & LOGISTICS ESTIMATOR */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "28px",
              border: "1px solid #E2D9CC",
              boxShadow: "0 4px 24px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* DESTINATION BENIN PILL */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span style={{ background: "#ECFDF5", color: "#065F46", padding: "4px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin style={{ width: 13, height: 13 }} />
                Livraison Bénin : Cotonou, Calavi & Régions
              </span>

              <button
                onClick={handleCopyLink}
                style={{ background: "transparent", border: "none", color: "#64748B", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <Share2 style={{ width: 14, height: 14 }} />
                <span>{copied ? "Lien copié !" : "Partager"}</span>
              </button>
            </div>

            {/* PRODUCT TITLE */}
            <div>
              <h1 style={{ fontSize: "clamp(20px, 2.5vw, 24px)", fontWeight: 700, color: "#0F172A", fontFamily: "'Poppins', sans-serif", margin: "0 0 8px", lineHeight: 1.25 }}>
                {product.name}
              </h1>

              {/* PHONE CONDITION & STATE BADGES */}
              {(product.condition_state || product.grade) && (
                <div style={{ margin: "10px 0 12px" }}>
                  <PhoneStateBadge
                    conditionState={product.condition_state}
                    grade={product.grade}
                    simType={product.sim_type}
                    regionVersion={product.region_version}
                    size="lg"
                    showSecondaryTags={true}
                  />
                </div>
              )}

              <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, lineHeight: 1.4 }}>
                {product.short_description || "Produit certifié usine pour importation directe avec dédouanement tout-en-un au Bénin."}
              </p>
            </div>

            {/* STORAGE CAPACITY OPTIONS SELECTOR */}
            {product.storage_options && product.storage_options.length > 0 && (
              <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                  Sélectionner la capacité de stockage :
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.storage_options.map((option) => {
                    const isSelected = selectedStorage === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedStorage(option)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          background: isSelected ? "#0F172A" : "#FFFFFF",
                          color: isSelected ? "#FFFFFF" : "#334155",
                          border: isSelected ? "2px solid #0F172A" : "1px solid #CBD5E1",
                          boxShadow: isSelected ? "0 2px 6px rgba(15,23,42,0.15)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RATING & REVIEWS */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} style={{ width: 15, height: 15, fill: "#F59E0B", color: "#F59E0B" }} />
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>5.0</span>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>• Stock disponible usine : {product.stock_quantity || 100} unités</span>
            </div>

            {/* UNIT PRICE IN FCFA */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "14px 0", borderTop: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>
                {formatPrice(unitPrice)}
              </span>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>/ unité usine</span>
              {(product as any).oldPrice && (
                <span style={{ fontSize: 15, color: "#94A3B8", textDecoration: "line-through", fontWeight: 600 }}>
                  {formatPrice((product as any).oldPrice)}
                </span>
              )}
            </div>

            {/* QUANTITY SELECTOR */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                Quantité à commander :
              </label>
              <div style={{ display: "inline-flex", alignItems: "center", background: "#F1F5F9", borderRadius: 14, padding: "4px 8px", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: 34, height: 34, borderRadius: 10, background: "#CBD5E1", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F172A" }}
                >
                  <Minus style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
                </button>
                <span style={{ minWidth: 40, textAlign: "center", fontSize: 17, fontWeight: 700, color: "#0F172A" }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{ width: 34, height: 34, borderRadius: 10, background: "#0F172A", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF" }}
                >
                  <Plus style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
                </button>
              </div>
            </div>

            {/* SHIPPING MODE SELECTOR (Uniquement pour articles avec fret international requis) */}
            {hasFreight && (
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                  Mode de Transit Chine ➔ Bénin :
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {/* AIR FREIGHT */}
                  <div
                    onClick={() => setShippingMode("air")}
                    style={{
                      background: shippingMode === "air" ? "#E0F2FE" : "#FFFFFF",
                      border: shippingMode === "air" ? "2px solid #0284C7" : "1.5px solid #E2E8F0",
                      borderRadius: 14,
                      padding: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Plane style={{ width: 22, height: 22, color: "#0284C7", margin: "0 auto 4px" }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Fret Aérien Express</div>
                    <div style={{ fontSize: 11, color: "#0369A1", fontWeight: 700 }}>5–12 jours • Aéroport Cotonou</div>
                  </div>

                  {/* SEA FREIGHT */}
                  <div
                    onClick={() => setShippingMode("sea")}
                    style={{
                      background: shippingMode === "sea" ? "#DCFCE7" : "#FFFFFF",
                      border: shippingMode === "sea" ? "2px solid #16A34A" : "1.5px solid #E2E8F0",
                      borderRadius: 14,
                      padding: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Ship style={{ width: 22, height: 22, color: "#16A34A", margin: "0 auto 4px" }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Fret Maritime Groupé</div>
                    <div style={{ fontSize: 11, color: "#15803D", fontWeight: 700 }}>40–65 jours • Port Cotonou</div>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSPARENT COST BREAKDOWN */}
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: 16,
                padding: "18px",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", textTransform: "uppercase", marginBottom: 2 }}>
                Estimation {hasFreight ? "Transparente (Tout Compris)" : "Directe (Sans Fret)"}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569" }}>
                <span>Marchandise ({quantity} × {formatPrice(unitPrice)})</span>
                <strong style={{ color: "#0F172A" }}>{formatPrice(productTotal)}</strong>
              </div>

              {serviceFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569" }}>
                  <span>Service & Contrôle Qualité Usine ({marginPercent}%)</span>
                  <strong style={{ color: "#0F172A" }}>{formatPrice(serviceFee)}</strong>
                </div>
              )}

              {hasFreight && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569" }}>
                  <span>Fret international ({shippingMode === "air" ? "Aérien Express" : "Maritime Groupé"})</span>
                  {shippingFee === 0 ? (
                    <span style={{ color: "#16A34A", fontWeight: 700 }}>Inclus / Offert (0 FCFA)</span>
                  ) : (
                    <strong style={{ color: "#0284C7" }}>{formatPrice(shippingFee)}</strong>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#16A34A", fontWeight: 700 }}>
                <span>{hasFreight ? "Dédouanement Cotonou" : "Frais de Fret & Logistique"}</span>
                <span>{hasFreight ? "Inclus (0 frais caché)" : "Non facturé (0 FCFA)"}</span>
              </div>

              <div style={{ height: 1, background: "#E2E8F0", margin: "4px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: "#0F172A" }}>Total TTC</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* ACTION CTA BUTTONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={handleAddToCart}
                style={{
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px 24px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 6px 20px rgba(22, 163, 74, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <ShoppingBag style={{ width: 20, height: 20 }} />
                <span>Ajouter au Panier ({formatPrice(total)})</span>
              </button>

              <Link
                href={`/quote-request?prod=${encodeURIComponent(product.name)}&qty=${quantity}${isBeauty ? "" : `&mode=${shippingMode}`}`}
                style={{
                  background: "#FFFFFF",
                  color: "#0F172A",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: 14,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textAlign: "center",
                }}
              >
                <Calculator style={{ width: 18, height: 18 }} />
                <span>Demander un Devis Personnalisé</span>
              </Link>
            </div>

          </div>

        </div>

        {/* ================================================================ */}
        {/* TABS SECTION                                                      */}
        {/* ================================================================ */}
        <div style={{ marginTop: 48 }}>
          <div style={{ display: "flex", borderBottom: "2px solid #E2D9CC", gap: 12, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 18px",
                  fontSize: 14,
                  fontWeight: activeTab === tab.id ? 900 : 700,
                  color: activeTab === tab.id ? "#0284C7" : "#64748B",
                  borderBottom: activeTab === tab.id ? "3px solid #0284C7" : "3px solid transparent",
                  background: "transparent",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  cursor: "pointer",
                  marginBottom: -2,
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "28px", border: "1px solid #E2D9CC", marginTop: 20, boxShadow: "0 2px 12px rgba(15, 23, 42, 0.02)" }}>
            {activeTab === "description" && (
              <div style={{ fontSize: 14.5, color: "#334155", lineHeight: 1.7 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 12px" }}>
                  À propos du produit
                </h3>
                <p style={{ margin: "0 0 16px" }}>
                  {product.description || product.short_description || "Produit de haute facture fabriqué selon les standards internationaux de qualité pour exportation en Afrique de l'Ouest."}
                </p>
                <ul style={{ paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  <li>Inspection des composants et conformité aux normes internationales.</li>
                  <li>Conditionnement protecteur pour transport maritime ou aérien long courrier.</li>
                  <li>Prise en charge directe par les équipes FENOUHI à Shenzhen / Guangzhou.</li>
                </ul>
              </div>
            )}

            {activeTab === "specs" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <div style={{ background: "#F8FAFC", padding: "14px 18px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 11.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Origine Usine</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{product.country_of_origin || "Chine (Guangdong)"}</div>
                </div>
                <div style={{ background: "#F8FAFC", padding: "14px 18px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 11.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Poids estimé</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{product.weight ? `${product.weight} kg` : "0.45 kg / unité"}</div>
                </div>
                <div style={{ background: "#F8FAFC", padding: "14px 18px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 11.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Quantité Minimum (MOQ)</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{product.minimum_order_quantity || 1} unité(s)</div>
                </div>
                <div style={{ background: "#F8FAFC", padding: "14px 18px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 11.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Hub de Transit</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Akpakpa Port (Cotonou, Bénin)</div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Processus Logistique FENOUHI Chine ➔ Bénin
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  <div style={{ background: "#FAF7F2", padding: "16px", borderRadius: 14, border: "1px solid #E2D9CC" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0284C7", marginBottom: 4 }}>1. SOURCING & CONTRÔLE</div>
                    <p style={{ fontSize: 12.5, color: "#475569", margin: 0 }}>Collecte usine à Shenzhen/Guangzhou et contrôle qualité immédiat.</p>
                  </div>
                  <div style={{ background: "#FAF7F2", padding: "16px", borderRadius: 14, border: "1px solid #E2D9CC" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0284C7", marginBottom: 4 }}>2. TRANSIT INTERNATIONAL</div>
                    <p style={{ fontSize: 12.5, color: "#475569", margin: 0 }}>Départ par avion cargo (5-12j) ou conteneur maritime (40-65j).</p>
                  </div>
                  <div style={{ background: "#FAF7F2", padding: "16px", borderRadius: 14, border: "1px solid #E2D9CC" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0284C7", marginBottom: 4 }}>3. DÉDOUANEMENT COTONOU</div>
                    <p style={{ fontSize: 12.5, color: "#475569", margin: 0 }}>Passage aux douanes de l'Aéroport ou Port de Cotonou intégralement géré.</p>
                  </div>
                  <div style={{ background: "#FAF7F2", padding: "16px", borderRadius: 14, border: "1px solid #E2D9CC" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0284C7", marginBottom: 4 }}>4. REMISE EN MAIN PROPRE</div>
                    <p style={{ fontSize: 12.5, color: "#475569", margin: 0 }}>Livraison à votre adresse à Cotonou/Calavi ou retrait dans nos agences.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#0F172A", fontFamily: "'Poppins', sans-serif" }}>5.0</div>
                  <div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} style={{ width: 16, height: 16, fill: "#F59E0B", color: "#F59E0B" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>Basé sur les avis clients et importateurs vérifiés au Bénin</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <strong style={{ fontSize: 13.5, color: "#0F172A" }}>Gaston H. (Cotonou, Haie Vive)</strong>
                      <span style={{ fontSize: 11.5, color: "#16A34A", fontWeight: 700 }}>✓ Achat vérifié</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>
                      "Reçu en 8 jours via le fret aérien à l'aéroport de Cotonou. Produit conforme à la description et très bien emballé."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center" }}>Chargement...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}
