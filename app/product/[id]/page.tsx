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
  Layers,
  XCircle,
} from "lucide-react";
import { MobileStoreProvider, useMobileStore } from "@/lib/mobile-store";
import PhoneStateBadge from "@/components/PhoneStateBadge";
import { findMatchingVariant, getAvailableOptionsForAttribute, getPresetAttributesForCategory, generateCartesianVariants } from "@/lib/variant-presets";
import type { ProductAttributeDefinition, ProductVariant } from "@/types/catalog";

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
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
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
      // Initialize dynamic variant selection
      if (data) {
        let initialVars = data.variants;
        if ((!initialVars || initialVars.length === 0)) {
          const query = `${data.category?.slug || (data.category as any)?.name || ""} ${data.name || ""}`.toLowerCase();
          let detectedType = "other";
          if (query.includes("phone") || query.includes("iphone") || query.includes("samsung") || query.includes("téléphone")) detectedType = "phones";
          else if (query.includes("ipad") || query.includes("tab") || query.includes("tablette")) detectedType = "tablets";
          else if (query.includes("mac") || query.includes("laptop") || query.includes("pc") || query.includes("ordinateur")) detectedType = "laptops";
          else if (query.includes("robe") || query.includes("shirt") || query.includes("vetement") || query.includes("vêtement")) detectedType = "clothing";
          else if (query.includes("chaussure") || query.includes("sneaker") || query.includes("basket") || query.includes("shoe")) detectedType = "shoes";
          else if (query.includes("sport") || query.includes("fitness")) detectedType = "sport";

          if (detectedType !== "other" || (data.storage_options && data.storage_options.length > 0)) {
            const presetDefs = getPresetAttributesForCategory(detectedType, data.name || "");
            const initChecked: Record<string, string[]> = {};
            presetDefs.forEach((attr) => {
              if (attr.name === "Modèle") {
                initChecked[attr.name] = ["Simple", "Pro", "Pro Max"].filter((p) => attr.values.includes(p));
              } else if (attr.name === "Pointure") {
                initChecked[attr.name] = ["39", "40", "41", "42", "43"].filter((p) => attr.values.includes(p));
              } else if (attr.name === "Taille") {
                initChecked[attr.name] = ["M", "L", "XL"].filter((p) => attr.values.includes(p));
              } else {
                initChecked[attr.name] = attr.values.slice(0, Math.min(attr.values.length, 3));
              }
            });
            const activeDefs = presetDefs
              .map((attr) => ({
                name: attr.name,
                values: (initChecked[attr.name] || attr.values).slice(0, 3).filter((v) => v.trim() !== ""),
              }))
              .filter((attr) => attr.values.length > 0);

            if (activeDefs.length > 0) {
              initialVars = generateCartesianVariants(
                activeDefs,
                Number(data.price) || 3500,
                data.wholesale_price_5_units ? Number(data.wholesale_price_5_units) : Math.round((Number(data.price) || 3500) * 0.8),
                data.stock_quantity ? Math.round(Number(data.stock_quantity) / Math.max(1, activeDefs.length)) : 50,
                data.slug || data.name || "item"
              );
            }
          }
        }

        if (initialVars && initialVars.length > 0) {
          const firstActive = initialVars.find((v) => v.is_active) || initialVars[0];
          if (firstActive && firstActive.attributes) {
            setSelectedAttributes(firstActive.attributes);
          }
        }
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

  // Dynamic Variant Resolution with Category Preset Fallback
  let resolvedVariants: ProductVariant[] = [];
  let resolvedAttributesDef: ProductAttributeDefinition[] = [];

  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    resolvedVariants = product.variants;
    resolvedAttributesDef = (product.attributes_definition && product.attributes_definition.length > 0)
      ? product.attributes_definition
      : (() => {
          const keys = Array.from(new Set(product.variants!.flatMap((v) => Object.keys(v.attributes || {}))));
          return keys.map((k) => ({
            name: k,
            values: Array.from(new Set(product.variants!.map((v) => v.attributes?.[k]).filter(Boolean))),
          }));
        })();
  } else {
    const query = `${product.category?.slug || (product.category as any)?.name || ""} ${product.name || ""}`.toLowerCase();
    let detectedType = "other";
    if (query.includes("phone") || query.includes("iphone") || query.includes("samsung") || query.includes("téléphone")) detectedType = "phones";
    else if (query.includes("ipad") || query.includes("tab") || query.includes("tablette")) detectedType = "tablets";
    else if (query.includes("mac") || query.includes("laptop") || query.includes("pc") || query.includes("ordinateur")) detectedType = "laptops";
    else if (query.includes("robe") || query.includes("shirt") || query.includes("vetement") || query.includes("vêtement")) detectedType = "clothing";
    else if (query.includes("chaussure") || query.includes("sneaker") || query.includes("basket") || query.includes("shoe")) detectedType = "shoes";
    else if (query.includes("sport") || query.includes("fitness")) detectedType = "sport";

    if (detectedType !== "other" || (product.storage_options && product.storage_options.length > 0)) {
      const presetDefs = getPresetAttributesForCategory(detectedType, product.name || "");
      const initChecked: Record<string, string[]> = {};
      presetDefs.forEach((attr) => {
        if (attr.name === "Modèle") {
          initChecked[attr.name] = ["Simple", "Pro", "Pro Max"].filter((p) => attr.values.includes(p));
        } else if (attr.name === "Pointure") {
          initChecked[attr.name] = ["39", "40", "41", "42", "43"].filter((p) => attr.values.includes(p));
        } else if (attr.name === "Taille") {
          initChecked[attr.name] = ["M", "L", "XL"].filter((p) => attr.values.includes(p));
        } else {
          initChecked[attr.name] = attr.values.slice(0, Math.min(attr.values.length, 3));
        }
      });
      const activeDefs = presetDefs
        .map((attr) => ({
          name: attr.name,
          values: (initChecked[attr.name] || attr.values).slice(0, 3).filter((v) => v.trim() !== ""),
        }))
        .filter((attr) => attr.values.length > 0);

      if (activeDefs.length > 0) {
        resolvedVariants = generateCartesianVariants(
          activeDefs,
          Number(product.price) || 3500,
          product.wholesale_price_5_units ? Number(product.wholesale_price_5_units) : Math.round((Number(product.price) || 3500) * 0.8),
          product.stock_quantity ? Math.round(Number(product.stock_quantity) / Math.max(1, activeDefs.length)) : 50,
          product.slug || product.name || "item"
        );
        resolvedAttributesDef = activeDefs;
      }
    }
  }

  const hasProductVariants = resolvedVariants.length > 0;
  const currentVariant = hasProductVariants
    ? findMatchingVariant(resolvedVariants, selectedAttributes) || resolvedVariants.find((v) => v.is_active) || resolvedVariants[0]
    : null;

  const currentAvailableStock = currentVariant
    ? currentVariant.stock_quantity
    : (product.stock_quantity ?? 100);

  const isVariantInStock = hasProductVariants
    ? Boolean(currentVariant && currentVariant.is_active && currentAvailableStock > 0)
    : Boolean(product.status === "active" && currentAvailableStock > 0);

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
  const hasFreight = !isBeauty && (unitAirFreight > 0 || unitSeaFreight > 0);

  // Margin / Service rate from product configuration (5% standard Service & Contrôle Qualité Usine)
  const marginPercent = product.cargolink_margin_percent !== undefined && product.cargolink_margin_percent !== null
    ? Number(product.cargolink_margin_percent)
    : 5;
  const serviceRate = marginPercent / 100;

  // Pricing calculations (Single & Wholesale Tier) - Variant aware!
  const baseUnitPrice = currentVariant
    ? Number(currentVariant.price)
    : (Number(product.price) || 0);

  const wholesalePrice5 = currentVariant && currentVariant.wholesale_price_5_units
    ? Number(currentVariant.wholesale_price_5_units)
    : product.wholesale_price_5_units && Number(product.wholesale_price_5_units) > 0
    ? Number(product.wholesale_price_5_units)
    : Math.round(baseUnitPrice * 0.8);

  const hasWholesaleDiscount = Boolean(wholesalePrice5 && wholesalePrice5 > 0 && wholesalePrice5 < baseUnitPrice);
  const isWholesaleApplied = Boolean(hasWholesaleDiscount && quantity >= 5);
  const activeUnitPrice = isWholesaleApplied ? (wholesalePrice5 as number) : baseUnitPrice;

  const productTotal = quantity * activeUnitPrice;
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

  const handleSelectAttributeOption = (attrName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!isVariantInStock) return;

    let variantTitle = "";
    if (currentVariant) {
      variantTitle = currentVariant.title || Object.values(currentVariant.attributes).join(" • ");
    } else if (selectedStorage) {
      variantTitle = selectedStorage;
    }

    const itemName = variantTitle ? `${product.name} (${variantTitle})` : product.name;

    addToCart({
      id: product.id,
      variantId: currentVariant ? currentVariant.id : null,
      variantTitle: variantTitle || null,
      variantAttributes: currentVariant ? currentVariant.attributes : null,
      name: itemName,
      category: product.category?.name || (isBeauty ? "Beauté & Soins" : "Général"),
      price: activeUnitPrice,
      wholesalePrice5: wholesalePrice5,
      oldPrice: (product as any).oldPrice || Math.round(activeUnitPrice * 1.25),
      image: currentVariant?.image_url || mainImage,
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

                {/* DYNAMIC ATTRIBUTE & VARIANT SELECTORS */}
                {hasProductVariants && resolvedVariants.length > 0 ? (
                  <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: 16, border: "1.5px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                        <Layers style={{ width: 15, height: 15, color: "#2563EB" }} />
                        Caractéristiques & Options :
                      </div>
                      {currentVariant && (
                        <span style={{ fontSize: 11, background: isVariantInStock ? "#DCFCE7" : "#FEE2E2", color: isVariantInStock ? "#166534" : "#DC2626", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                          {isVariantInStock ? `✓ En Stock (${currentAvailableStock} dispo)` : "✕ Épuisé / Non disponible"}
                        </span>
                      )}
                    </div>

                    {/* GROUPS PER ATTRIBUTE */}
                    {(() => {
                      const effectiveDefs = (resolvedAttributesDef && resolvedAttributesDef.length > 0)
                        ? resolvedAttributesDef
                        : (() => {
                            const keys = Array.from(new Set(resolvedVariants.flatMap((v) => Object.keys(v.attributes))));
                            return keys.map((k) => ({
                              name: k,
                              values: Array.from(new Set(resolvedVariants.map((v) => v.attributes[k]).filter(Boolean))),
                            }));
                          })();

                      return effectiveDefs.map((attr) => {
                        const selectedVal = selectedAttributes[attr.name] || "";
                        const availableOptions = getAvailableOptionsForAttribute(resolvedVariants, selectedAttributes, attr.name);

                        return (
                          <div key={attr.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "flex", justifyContent: "space-between" }}>
                              <span>{attr.name} :</span>
                              <strong style={{ color: "#0F172A" }}>{selectedVal || "Non sélectionné"}</strong>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {attr.values.map((val) => {
                                const isSelected = selectedVal === val;
                                const optStatus = availableOptions.find((o) => o.value === val);
                                const isOptionValid = optStatus ? optStatus.isAvailable : true;
                                const isOptionInStock = optStatus ? optStatus.isInStock : true;

                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleSelectAttributeOption(attr.name, val)}
                                    style={{
                                      padding: "6px 14px",
                                      borderRadius: 8,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      background: isSelected ? "#0F172A" : isOptionValid ? "#FFFFFF" : "#F1F5F9",
                                      color: isSelected ? "#FFFFFF" : isOptionValid ? "#334155" : "#94A3B8",
                                      border: isSelected
                                        ? "2px solid #0F172A"
                                        : isOptionValid
                                        ? "1px solid #CBD5E1"
                                        : "1px dashed #CBD5E1",
                                      boxShadow: isSelected ? "0 2px 8px rgba(15,23,42,0.2)" : "none",
                                      opacity: isOptionValid ? 1 : 0.6,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    {isSelected && <Check style={{ width: 12, height: 12, strokeWidth: 3 }} />}
                                    <span>{val}</span>
                                    {!isOptionInStock && isOptionValid && (
                                      <span style={{ fontSize: 9.5, color: isSelected ? "#FCD34D" : "#EA580C", fontWeight: 700 }}>
                                        (Épuisé)
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}

                    {/* CURRENT COMBINATION SKU / SUMMARY */}
                    {currentVariant && (
                      <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "#64748B" }}>
                        <span>Réf : <strong>{currentVariant.sku || currentVariant.id}</strong></span>
                        <span>Prix unitaire : <strong style={{ color: "#0F172A" }}>{formatPrice(currentVariant.price)}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* STORAGE CAPACITY OPTIONS SELECTOR FALLBACK FOR OLD PHONES */
                  product.storage_options && product.storage_options.length > 0 && (
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
                  )
                )}

              {/* RATING & REVIEWS */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} style={{ width: 15, height: 15, fill: "#F59E0B", color: "#F59E0B" }} />
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>5.0</span>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>• Stock disponible usine : {currentAvailableStock} unités</span>
              </div>

              {/* PRICING & VOLUME TIERS (1 ART vs 5+ ART) */}
              <div style={{ padding: "16px 0", borderTop: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: isWholesaleApplied ? "#15803D" : "#DC2626", fontFamily: "'Poppins', sans-serif" }}>
                    {formatPrice(activeUnitPrice)}
                  </span>
                  <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>/ unité usine</span>
                  {isWholesaleApplied && (
                    <span style={{ fontSize: 16, color: "#94A3B8", textDecoration: "line-through", fontWeight: 600 }}>
                      {formatPrice(baseUnitPrice)}
                    </span>
                  )}
                  {isWholesaleApplied && (
                    <span style={{ fontSize: 11.5, background: "#DCFCE7", color: "#166534", padding: "3px 10px", borderRadius: 999, fontWeight: 700, border: "1px solid #86EFAC" }}>
                      ✓ TARIF GROS APPLIQUÉ ({quantity} unités)
                    </span>
                  )}
                </div>

                {/* GRILLE TARIFAIRE DÉGRESSIVE (VOLUME PRICING WIDGET) */}
                {hasWholesaleDiscount && wholesalePrice5 && (
                  <div style={{ marginTop: 14, background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                      💰 Grille Tarifaire Dégressive Usine :
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {/* TIER 1: 1 à 4 articles */}
                      <div
                        onClick={() => setQuantity(1)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: !isWholesaleApplied ? "#FFFFFF" : "#F1F5F9",
                          border: !isWholesaleApplied ? "2px solid #0F172A" : "1px solid #CBD5E1",
                          cursor: "pointer",
                          boxShadow: !isWholesaleApplied ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: !isWholesaleApplied ? "#0F172A" : "#64748B" }}>
                          1 à 4 articles (Standard)
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                          {formatPrice(baseUnitPrice)}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                          Prix au détail
                        </div>
                      </div>

                      {/* TIER 2: 5 articles et plus */}
                      <div
                        onClick={() => setQuantity(Math.max(5, quantity))}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: isWholesaleApplied ? "#F0FDF4" : "#FFFFFF",
                          border: isWholesaleApplied ? "2px solid #16A34A" : "1.5px dashed #86EFAC",
                          cursor: "pointer",
                          position: "relative",
                          boxShadow: isWholesaleApplied ? "0 2px 8px rgba(22, 163, 74, 0.15)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span style={{ position: "absolute", top: -8, right: 8, background: "#16A34A", color: "#FFF", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999 }}>
                          PRIX DE GROS
                        </span>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isWholesaleApplied ? "#15803D" : "#16A34A" }}>
                          Dès 5 articles (Économie)
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#15803D", marginTop: 2 }}>
                          {formatPrice(wholesalePrice5)}
                        </div>
                        <div style={{ fontSize: 10, color: "#16A34A", marginTop: 2, fontWeight: 600 }}>
                          -{Math.round(((baseUnitPrice - wholesalePrice5) / baseUnitPrice) * 100)}% d'économie / unité
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QUANTITY SELECTOR */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                  Quantité commandée :
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", background: "#F1F5F9", borderRadius: 12, padding: 4 }}>
                    <button
                      onClick={() => setQuantity(Math.max(product.minimum_order_quantity || 1, quantity - 1))}
                      style={{ width: 36, height: 36, borderRadius: 8, background: "#FFFFFF", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0F172A" }}
                    >
                      <Minus style={{ width: 16, height: 16 }} />
                    </button>
                    <span style={{ minWidth: 44, textAlign: "center", fontWeight: 700, fontSize: 15, color: "#0F172A" }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: 36, height: 36, borderRadius: 8, background: "#FFFFFF", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0F172A" }}
                    >
                      <Plus style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                  <span style={{ fontSize: 12, color: "#64748B" }}>
                    {hasWholesaleDiscount && wholesalePrice5 && quantity < 5 ? (
                      <span style={{ color: "#16A34A", fontWeight: 600 }}>
                        💡 Ajoutez encore {5 - quantity} article{5 - quantity > 1 ? "s" : ""} pour débloquer le tarif de gros à {formatPrice(wholesalePrice5)}/u !
                      </span>
                    ) : (
                      `Min. de commande usine : ${product.minimum_order_quantity || 1} unité`
                    )}
                  </span>
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
                      <div style={{ fontSize: 11, color: "#0369A1", fontWeight: 700 }}>15 jours • Aéroport Cotonou</div>
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
                      <div style={{ fontSize: 11, color: "#15803D", fontWeight: 700 }}>50–95 jours • Port Cotonou</div>
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
                  <span>Marchandise ({quantity} × {formatPrice(activeUnitPrice)})</span>
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
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isVariantInStock}
                  style={{
                    background: isVariantInStock ? "#16A34A" : "#94A3B8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 14,
                    padding: "16px 24px",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: isVariantInStock ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: isVariantInStock ? "0 6px 20px rgba(22, 163, 74, 0.25)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isVariantInStock ? (
                    <>
                      <ShoppingBag style={{ width: 20, height: 20 }} />
                      <span>Ajouter au Panier ({formatPrice(total)})</span>
                    </>
                  ) : (
                    <>
                      <XCircle style={{ width: 20, height: 20 }} />
                      <span>Combinaison Épuisée / Indisponible</span>
                    </>
                  )}
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
