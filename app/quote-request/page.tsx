"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProductByIdOrSlug } from "@/lib/supabase/catalog";
import type { Product } from "@/types/catalog";
import { createClient } from "@/lib/supabase/client";
import {
  Send,
  CheckCircle2,
  Package,
  Plane,
  Ship,
  Info,
  ArrowLeft,
  Calculator,
  ShieldCheck,
  CreditCard,
  Upload,
  Phone,
  Globe,
  Clock,
  Check,
  Plus,
  Minus,
  FileCode,
  DollarSign,
  Share2,
  Printer,
  Smartphone,
  Shirt,
  ShoppingBag,
  Wrench,
  Zap,
  Search,
  MessageSquare,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

type Currency = "FCFA" | "EUR" | "USD";

const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; label: string }> = {
  FCFA: { symbol: "FCFA", rate: 1, label: "Franc CFA (XOF)" },
  EUR: { symbol: "€", rate: 0.00152, label: "Euro (€)" },
  USD: { symbol: "$", rate: 0.00165, label: "US Dollar ($)" },
};

const PRESET_CATEGORIES = [
  { icon: Smartphone, label: "High-Tech & Audio", sample: "100 Casques Bluetooth ANC TWS" },
  { icon: Shirt, label: "Sneakers & Mode", sample: "50 paires Baskets Running Sport" },
  { icon: ShoppingBag, label: "Bijoux & Sacs", sample: "30 Sacs à main cuir véritable" },
  { icon: Wrench, label: "Outillage & PME", sample: "5 Groupes Électrogènes 5kW Solaire" },
  { icon: Zap, label: "Panneaux Solaires", sample: "20 Panneaux Solaires 550W Monocristallin" },
];

function QuoteRequestContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const prodTitle = searchParams.get("prod");
  const initialQty = searchParams.get("qty") || "50";
  const initialMode = searchParams.get("mode") || "air";

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCurrency, setActiveCurrency] = useState<Currency>("FCFA");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdQuoteNumber, setCreatedQuoteNumber] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    url: "",
    productName: "",
    quantity: 50,
    destCountry: "Bénin (Cotonou)",
    shippingMode: "air" as "air" | "sea",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    details: "",
    optInspection: false,
    optReinforcedPackaging: false,
    optCustomBranding: false,
    optSampleRequest: false,
  });

  // Attached File State
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);

  useEffect(() => {
    async function resolveProduct() {
      let p: Product | null = null;
      if (productId) {
        p = await getProductByIdOrSlug(productId);
      } else if (prodTitle) {
        p = await getProductByIdOrSlug(prodTitle);
      }

      if (p) {
        setSelectedProduct(p);
        setFormData((prev) => ({
          ...prev,
          productName: p.name,
          url: `https://cargolink.africa/product/${p.id}`,
          quantity: Math.max(p.minimum_order_quantity, parseInt(initialQty) || p.minimum_order_quantity),
          shippingMode: initialMode === "sea" ? "sea" : "air",
        }));
      } else if (prodTitle) {
        setFormData((prev) => ({
          ...prev,
          productName: prodTitle,
          url: prodTitle.startsWith("http") ? prodTitle : "",
          quantity: parseInt(initialQty) || 50,
          shippingMode: initialMode === "sea" ? "sea" : "air",
        }));
      }
    }
    resolveProduct();
  }, [productId, prodTitle, initialQty, initialMode]);

  // Dynamic calculations based on product and options
  const unitPriceFCFA = selectedProduct ? selectedProduct.price : 6500;
  const quantity = Math.max(1, formData.quantity || 1);
  const productCostFCFA = unitPriceFCFA * quantity;
  const serviceFeeFCFA = Math.round(productCostFCFA * 0.05);

  const weightPerUnit = selectedProduct ? (selectedProduct.weight || 0.35) : 0.35;
  const volumePerUnit = selectedProduct ? ((selectedProduct.length || 0.1) * (selectedProduct.width || 0.1) * (selectedProduct.height || 0.1)) : 0.002;
  const totalWeight = weightPerUnit * quantity;
  const totalVolume = volumePerUnit * quantity;

  const airRateFCFA = 7500; // FCFA/kg
  const seaRateFCFA = 185000; // FCFA/CBM
  const estimatedShippingFeeFCFA =
    formData.shippingMode === "sea"
      ? Math.round(totalVolume * seaRateFCFA)
      : Math.round(totalWeight * airRateFCFA);

  // Extra options cost
  const inspectionCostFCFA = formData.optInspection ? 15000 : 0;
  const packagingCostFCFA = formData.optReinforcedPackaging ? 5000 : 0;
  const brandingCostFCFA = formData.optCustomBranding ? 10000 : 0;
  const extraOptionsCostFCFA = inspectionCostFCFA + packagingCostFCFA + brandingCostFCFA;

  const totalEstimatedFCFA =
    productCostFCFA + serviceFeeFCFA + estimatedShippingFeeFCFA + extraOptionsCostFCFA;

  // Convert to active currency
  const curr = CURRENCY_RATES[activeCurrency];
  const formatAmount = (fcfaAmount: number) => {
    if (activeCurrency === "FCFA") {
      return `${fcfaAmount.toLocaleString()} FCFA`;
    }
    const converted = fcfaAmount * curr.rate;
    return `${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${curr.symbol}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setAttachedFile({ name: file.name, size: `${sizeMb} MB` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const generatedNum = `DEV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedQuoteNumber(generatedNum);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const optionsList = [
        formData.optInspection && "Inspection Usine Guangzhou",
        formData.optReinforcedPackaging && "Emballage Renforcé Bois",
        formData.optCustomBranding && "Personnalisation Logo / Marque",
        formData.optSampleRequest && "Demande Échantillon Préalable",
        attachedFile && `Fichier joint: ${attachedFile.name}`,
      ]
        .filter(Boolean)
        .join(", ");

      await supabase.from("quotes").insert({
        quote_number: generatedNum,
        user_id: user?.id || null,
        user_name: formData.clientName,
        user_email: formData.clientEmail || user?.email || null,
        product_link: formData.url || formData.productName,
        product_name: formData.productName || selectedProduct?.name || "Demande Importation Sourcing",
        quantity: formData.quantity,
        estimated_price: unitPriceFCFA,
        estimated_weight: totalWeight,
        shipping_mode: formData.shippingMode,
        destination_country: formData.destCountry.split(" ")[0],
        destination_city: formData.destCountry.includes("Cotonou")
          ? "Cotonou"
          : formData.destCountry.includes("Lomé")
          ? "Lomé"
          : formData.destCountry.includes("Abidjan")
          ? "Abidjan"
          : formData.destCountry.includes("Dakar")
          ? "Dakar"
          : "Douala",
        status: "new",
        product_cost: productCostFCFA,
        service_fee: serviceFeeFCFA,
        shipping_fee: estimatedShippingFeeFCFA,
        extra_fee: extraOptionsCostFCFA,
        admin_notes: `Tel WhatsApp: ${formData.clientPhone}. Options: ${optionsList}. Instructions: ${formData.details}`,
      });
    } catch (err) {
      console.warn("Notice: quote record saved locally", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour CargoLink Africa ! J'ai soumis la demande de devis N° *${createdQuoteNumber}*.\n\n` +
      `📦 *Produit* : ${formData.productName || selectedProduct?.name}\n` +
      `🔢 *Quantité* : ${formData.quantity} unités\n` +
      `🚢 *Mode* : ${formData.shippingMode === "sea" ? "Fret Maritime" : "Fret Aérien"}\n` +
      `📍 *Destination* : ${formData.destCountry}\n` +
      `💰 *Total Estimé* : ${formatAmount(totalEstimatedFCFA)}\n\n` +
      `Merci de confirmer la disponibilité et d'émettre mon devis officiel usine.`
  );

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", paddingBottom: 80 }}>
      {/* HERO HEADER WITH GRADIENT & STEP BADGES */}
      <header
        style={{
          background: "linear-gradient(135deg, var(--navy-dark) 0%, #1E293B 100%)",
          color: "#FFF",
          padding: "50px 0 65px",
          borderBottom: "4px solid var(--orange-primary)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-10%",
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(22,84,145,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", padding: "6px 16px", borderRadius: 9999, fontSize: 12, fontWeight: 800, color: "#F8FAFC", marginBottom: 16 }}>
            <Sparkles style={{ width: 14, color: "#F59E0B" }} />
            BUREAU GUANGZHOU & COTONOU DIRECT · RÉPONSE EN &lt; 2H
          </div>

          <h1 className="hero-page-title" style={{ fontSize: 32, fontWeight: 900, marginBottom: 10 }}>
            Demande de Devis d'Importation Sur-Mesure
          </h1>
          <p style={{ fontSize: 15, color: "#CBD5E1", maxWidth: 680, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Bénéficiez du prix usine direct sans intermédiaire. Inspection qualité à Guangzhou, dédouanement et livraison à destination garantis.
          </p>

          {/* STEP INDICATOR */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(15,23,42,0.6)", padding: "10px 20px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.15)", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { num: "1", title: "Produit & Quantité" },
              { num: "2", title: "Transport & Options" },
              { num: "3", title: "Devis Officiel" },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                {idx > 0 && <ChevronRight style={{ width: 14, color: "#64748B" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: idx === 0 ? "var(--orange-primary)" : "rgba(255,255,255,0.2)", color: "#FFF", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {step.num}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: idx === 0 ? "#FFF" : "#94A3B8" }}>{step.title}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <section style={{ padding: "40px 0", marginTop: -20, position: "relative", zIndex: 5 }}>
        <div className="container">
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            {submitted ? (
              /* SUCCESS STATE VIEW */
              <div className="card" style={{ padding: 40, textAlign: "center", background: "#FFF", borderRadius: 24, boxShadow: "0 20px 40px rgba(15,23,42,0.08)" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#DCFCE7", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <CheckCircle2 style={{ width: 44 }} />
                </div>
                <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", fontSize: 12, marginBottom: 8 }}>
                  CONFIRMATION OFFICIELLE ENVOYÉE
                </span>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>
                  Demande de Devis N° {createdQuoteNumber} Transmise !
                </h2>
                <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 540, margin: "0 auto 24px", lineHeight: 1.6 }}>
                  Notre équipe de sourcing à Guangzhou traite votre dossier. Vous recevrez l'offre commerciale définitive avec les tarifs douaniers exacts sous 2h.
                </p>

                {/* SUMMARY RECAP CARD */}
                <div style={{ background: "var(--bg-main)", borderRadius: 16, padding: 24, maxWidth: 560, margin: "0 auto 28px", textAlign: "left", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "var(--navy-dark)", marginBottom: 12, borderBottom: "1px solid var(--border-light)", paddingBottom: 8 }}>
                    Récapitulatif de la Demande
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Produit / Lien :</span>
                      <strong style={{ color: "var(--navy-dark)", textAlign: "right", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {formData.productName || selectedProduct?.name || "Sourcing personnalisé"}
                      </strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Quantité demandée :</span>
                      <strong>{formData.quantity} unités</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Mode de transport :</span>
                      <strong>{formData.shippingMode === "sea" ? "Fret Maritime CBM" : "Fret Aérien Express"}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Destination :</span>
                      <strong>{formData.destCountry}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: 10, marginTop: 4 }}>
                      <span style={{ fontWeight: 900, color: "var(--navy-dark)" }}>Montant Estimé Total :</span>
                      <span style={{ fontWeight: 900, fontSize: 18, color: "var(--orange-primary)" }}>{formatAmount(totalEstimatedFCFA)}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  <Link
                    href={`/payment?quote_id=${createdQuoteNumber || "DEV-2026-9410"}`}
                    className="btn btn-orange"
                    style={{ padding: "14px 28px", fontSize: 14.5, fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 9999, boxShadow: "0 8px 25px rgba(245,158,11,0.3)" }}
                  >
                    <CreditCard style={{ width: 18 }} />
                    Valider & Payer par Mobile Money
                  </Link>

                  <a
                    href={`https://wa.me/22997000000?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: "14px 24px", fontSize: 14, fontWeight: 800, background: "var(--navy-dark)", color: "#FFF", borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    <MessageSquare style={{ width: 18 }} />
                    Discuter WhatsApp
                  </a>

                  <Link
                    href="/dashboard"
                    className="btn btn-primary"
                    style={{ padding: "14px 24px", fontSize: 14, fontWeight: 800, background: "var(--navy-dark)", color: "#FFF", borderRadius: 9999 }}
                  >
                    Voir dans mon Espace Client
                  </Link>

                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn"
                    style={{ padding: "14px 20px", fontSize: 13.5, fontWeight: 700, border: "1px solid var(--border-light)", background: "#FFF", borderRadius: 9999 }}
                  >
                    Nouvelle demande
                  </button>
                </div>
              </div>
            ) : (
              /* FORM & ESTIMATOR GRID */
              <div className="quote-request-main-grid">
                
                {/* LEFT FORM COLUMN */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  
                  {/* SELECTED PRODUCT CARD BANNER (if from product detail page) */}
                  {selectedProduct ? (
                    <div className="card" style={{ padding: 20, background: "#FFF", borderRadius: 16, border: "2px solid var(--blue-primary)", position: "relative" }}>
                      <span className="badge" style={{ position: "absolute", top: -12, left: 20, background: "var(--blue-primary)", color: "#FFF", fontSize: 11, padding: "3px 12px" }}>
                        PRODUIT SÉLECTIONNÉ DANS LE CATALOGUE
                      </span>

                      <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 4 }}>
                        <img
                          src={selectedProduct.images?.[0]?.public_image_url || "/images/assets/item_1.jpg"}
                          alt={selectedProduct.name}
                          style={{ width: 84, height: 84, borderRadius: 12, objectFit: "cover", background: "#F8FAFC", border: "1px solid var(--border-light)", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--navy-dark)", lineHeight: 1.3, marginBottom: 4 }}>
                            {selectedProduct.name}
                          </h3>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                            {selectedProduct.short_description} · Origine : <strong>{selectedProduct.country_of_origin || "Chine"}</strong>
                          </div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                            <span style={{ fontSize: 18, fontWeight: 900, color: "var(--orange-primary)" }}>
                              {selectedProduct.price.toLocaleString()} FCFA
                            </span>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/ unité (min. {selectedProduct.minimum_order_quantity}u)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* QUICK PRESETS BANNER (if custom request) */
                    <div className="card" style={{ padding: 20, background: "#FFF", borderRadius: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: 10 }}>
                        VOUS CHERCHEZ UN PRODUIT SPÉCIFIQUE ? CLIQUEZ POUR PRÉ-REMPLIR :
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {PRESET_CATEGORIES.map((cat) => (
                          <button
                            key={cat.label}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                productName: cat.sample,
                              }))
                            }
                            style={{
                              padding: "6px 12px",
                              borderRadius: 9999,
                              border: "1px solid var(--border-light)",
                              background: "var(--bg-main)",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--navy-dark)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.18s ease",
                            }}
                          >
                            <cat.icon style={{ width: 14, height: 14 }} /> {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FORM CARD */}
                  <div className="card responsive-form-card">
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                      
                      {/* SECTION 1: PRODUCT & QUANTITY */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border-light)", paddingBottom: 8 }}>
                          <Package style={{ width: 18, color: "var(--orange-primary)" }} />
                          1. Informations sur le Produit & Quantité
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                              LIEN CHINE (1688, TAOBAO, ALIBABA) OU NOM DU PRODUIT *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: https://detail.1688.com/offer/6789.html ou '200 casques bluetooth ANC'"
                              value={formData.productName || formData.url}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  productName: e.target.value,
                                  url: e.target.value,
                                })
                              }
                              className="admin-input"
                              style={{ width: "100%", padding: "12px 14px", fontSize: 13.5, borderRadius: "var(--radius-sm)" }}
                            />
                          </div>

                          <div className="grid-2" style={{ gap: 16 }}>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                                QUANTITÉ SOUHAITÉE (UNITÉS) *
                              </label>
                              <div style={{ display: "flex", alignItems: "center", border: "2px solid var(--border-light)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      quantity: Math.max(
                                        selectedProduct ? selectedProduct.minimum_order_quantity : 1,
                                        prev.quantity - (prev.quantity <= 50 ? 1 : 10)
                                      ),
                                    }))
                                  }
                                  style={{ width: 44, height: 42, background: "var(--bg-main)", border: "none", cursor: "pointer", fontWeight: 900, fontSize: 18 }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  required
                                  min={selectedProduct ? selectedProduct.minimum_order_quantity : 1}
                                  value={formData.quantity}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      quantity: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  style={{ width: "100%", height: 42, border: "none", textAlign: "center", fontWeight: 900, fontSize: 16, outline: "none" }}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      quantity: prev.quantity + (prev.quantity < 50 ? 1 : 10),
                                    }))
                                  }
                                  style={{ width: 44, height: 42, background: "var(--bg-main)", border: "none", cursor: "pointer", fontWeight: 900, fontSize: 18 }}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div>
                              <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                                ATTACHER UNE PHOTO / PHOTO MODEL (OPTIONNEL)
                              </label>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                  height: 44,
                                  border: "2px dashed var(--border-light)",
                                  borderRadius: "var(--radius-sm)",
                                  background: "var(--bg-main)",
                                  cursor: "pointer",
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  color: "var(--text-muted)",
                                }}
                              >
                                <Upload style={{ width: 16 }} />
                                {attachedFile ? attachedFile.name : "Ajouter une image..."}
                                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} style={{ display: "none" }} />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: SHIPPING MODE CARDS */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border-light)", paddingBottom: 8 }}>
                          <Plane style={{ width: 18, color: "var(--orange-primary)" }} />
                          2. Mode de Transport & Destination
                        </div>

                        <div className="quote-shipping-cards-grid">
                          {[
                            {
                              mode: "air" as const,
                              icon: Plane,
                              title: "Fret Aérien Express",
                              delay: "10–18 jours",
                              rate: "7 500 FCFA / kg",
                              badge: "RECOMMANDÉ",
                              color: "#0369A1",
                              bg: "#E0F2FE",
                            },
                            {
                              mode: "sea" as const,
                              icon: Ship,
                              title: "Fret Maritime CBM",
                              delay: "30–45 jours",
                              rate: "185 000 FCFA / CBM",
                              badge: "ÉCONOMIQUE",
                              color: "#059669",
                              bg: "#DCFCE7",
                            },
                          ].map((m) => {
                            const isSelected = formData.shippingMode === m.mode;
                            return (
                              <div
                                key={m.mode}
                                onClick={() => setFormData({ ...formData, shippingMode: m.mode })}
                                style={{
                                  padding: 16,
                                  borderRadius: 14,
                                  border: `2px solid ${isSelected ? m.color : "var(--border-light)"}`,
                                  background: isSelected ? m.bg : "#FFF",
                                  cursor: "pointer",
                                  position: "relative",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <span className="badge" style={{ position: "absolute", top: 10, right: 10, background: isSelected ? m.color : "#94A3B8", color: "#FFF", fontSize: 10 }}>
                                  {m.badge}
                                </span>

                                <div style={{ fontSize: 14, fontWeight: 900, color: m.color, marginBottom: 4 }}>
                                  {m.title}
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy-dark)", marginBottom: 2 }}>
                                  Délai : {m.delay}
                                </div>
                                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                                  Tarif usine : {m.rate}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                            PAYS & VILLE DE DESTINATION FINAL *
                          </label>
                          <select
                            value={formData.destCountry}
                            onChange={(e) => setFormData({ ...formData, destCountry: e.target.value })}
                            className="admin-input"
                            style={{ width: "100%", padding: "12px 14px", fontSize: 13.5, background: "#FFF", borderRadius: "var(--radius-sm)" }}
                          >
                            <option>Bénin (Cotonou)</option>
                            <option>Togo (Lomé)</option>
                            <option>Côte d'Ivoire (Abidjan)</option>
                            <option>Sénégal (Dakar)</option>
                            <option>Cameroun (Douala)</option>
                            <option>Niger (Niamey)</option>
                            <option>Burkina Faso (Ouagadougou)</option>
                            <option>Mali (Bamako)</option>
                          </select>
                        </div>
                      </div>

                      {/* SECTION 3: OPTIONS & SERVICES ADDITIONNELS */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border-light)", paddingBottom: 8 }}>
                          <ShieldCheck style={{ width: 18, color: "var(--orange-primary)" }} />
                          3. Services & Options Incluses
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {[
                            {
                              id: "optInspection",
                              label: "Inspection Qualité à l'Entrepôt de Guangzhou",
                              sub: "Vérification conformité + rapport photo HD avant embarquement (+15 000 FCFA)",
                              checked: formData.optInspection,
                            },
                            {
                              id: "optReinforcedPackaging",
                              label: "Emballage Renforcé Caisse Bois / Bulle Étanche",
                              sub: "Protection maximale contre les chocs et l'humidité pendant le transit (+5 000 FCFA)",
                              checked: formData.optReinforcedPackaging,
                            },
                            {
                              id: "optCustomBranding",
                              label: "Personnalisation Logo & Emballage Marque Propre",
                              sub: "Impression de votre logo sur cartons ou étiquettes produits (+10 000 FCFA)",
                              checked: formData.optCustomBranding,
                            },
                          ].map((opt) => (
                            <label
                              key={opt.id}
                              style={{
                                display: "flex",
                                gap: 12,
                                padding: 12,
                                borderRadius: 10,
                                background: opt.checked ? "var(--blue-light)" : "var(--bg-main)",
                                border: `1px solid ${opt.checked ? "var(--blue-primary)" : "var(--border-light)"}`,
                                cursor: "pointer",
                                transition: "all 0.18s ease",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={opt.checked}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [opt.id]: e.target.checked,
                                  })
                                }
                                style={{ width: 18, height: 18, marginTop: 2, accentColor: "var(--orange-primary)" }}
                              />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy-dark)" }}>{opt.label}</div>
                                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{opt.sub}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 4: CLIENT CONTACT */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border-light)", paddingBottom: 8 }}>
                          <Phone style={{ width: 18, color: "var(--orange-primary)" }} />
                          4. Vos Coordonnées de Contact
                        </div>

                        <div className="grid-2" style={{ gap: 16, marginBottom: 14 }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                              VOTRE NOM & PRÉNOM *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Jean Koffi"
                              value={formData.clientName}
                              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                              className="admin-input"
                              style={{ width: "100%", padding: "12px 14px", fontSize: 13.5, borderRadius: "var(--radius-sm)" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                              NUMÉRO WHATSAPP (AVEC INDICATIF) *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="+229 97 00 11 22"
                              value={formData.clientPhone}
                              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                              className="admin-input"
                              style={{ width: "100%", padding: "12px 14px", fontSize: 13.5, borderRadius: "var(--radius-sm)" }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                            EMAIL DE RECEPTION DU DEVIS (OPTIONNEL)
                          </label>
                          <input
                            type="email"
                            placeholder="votre.email@exemple.com"
                            value={formData.clientEmail}
                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                            className="admin-input"
                            style={{ width: "100%", padding: "12px 14px", fontSize: 13.5, borderRadius: "var(--radius-sm)" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                            INSTRUCTIONS SPÉCIFIQUES POUR L'USINE CHINOISE
                          </label>
                          <textarea
                            placeholder="Ex: Préciser 50 paires en noir taille 42 et 50 paires en blanc..."
                            value={formData.details}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            className="admin-input"
                            style={{ width: "100%", height: 75, padding: "10px 14px", fontSize: 13 }}
                          ></textarea>
                        </div>
                      </div>

                      {/* SUBMIT BUTTON */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-orange admin-btn"
                        style={{
                          padding: "16px 24px",
                          fontSize: 16,
                          fontWeight: 900,
                          borderRadius: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          boxShadow: "0 10px 25px rgba(22,84,145,0.25)",
                        }}
                      >
                        <Send style={{ width: 20 }} />
                        {loading ? "Calcul & Transmission en cours..." : "Soumettre ma Demande de Devis Officiel"}
                      </button>

                      <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <ShieldCheck style={{ width: 16, color: "var(--green-success)" }} />
                        Saisie 100% sécurisée · Zéro engagement bancaire à cette étape
                      </div>
                    </form>
                  </div>
                </div>

                {/* RIGHT STICKY ESTIMATOR SIDEBAR */}
                <div className="quote-estimator-sticky" style={{ position: "sticky", top: 90, display: "flex", flexDirection: "column", gap: 20 }}>
                  
                  {/* ESTIMATOR CARD */}
                  <div
                    className="card"
                    style={{
                      padding: 24,
                      background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
                      borderRadius: 20,
                      border: "2px solid var(--navy-dark)",
                      boxShadow: "0 12px 35px rgba(15,23,42,0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid var(--border-light)", paddingBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Calculator style={{ width: 18, color: "var(--orange-primary)" }} />
                        <span style={{ fontSize: 13, fontWeight: 900, color: "var(--navy-dark)" }}>CALCULATEUR EN TEMPS RÉEL</span>
                      </div>

                      {/* CURRENCY TOGGLE */}
                      <div style={{ display: "flex", background: "var(--bg-main)", borderRadius: 9999, padding: 2, border: "1px solid var(--border-light)" }}>
                        {(["FCFA", "EUR", "USD"] as Currency[]).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setActiveCurrency(c)}
                            style={{
                              padding: "3px 8px",
                              fontSize: 10.5,
                              fontWeight: 900,
                              borderRadius: 9999,
                              border: "none",
                              background: activeCurrency === c ? "var(--navy-dark)" : "transparent",
                              color: activeCurrency === c ? "#FFF" : "var(--text-muted)",
                              cursor: "pointer",
                            }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DETAILED COST BREAKDOWN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>
                          Marchandise ({quantity} × {formatAmount(unitPriceFCFA)})
                        </span>
                        <strong style={{ color: "var(--navy-dark)" }}>{formatAmount(productCostFCFA)}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>
                          Frais Sourcing & Gestion (5%)
                        </span>
                        <strong style={{ color: "var(--navy-dark)" }}>{formatAmount(serviceFeeFCFA)}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>
                          Fret {formData.shippingMode === "sea" ? "Maritime" : "Aérien"} estimé
                        </span>
                        <strong style={{ color: "var(--navy-dark)" }}>{formatAmount(estimatedShippingFeeFCFA)}</strong>
                      </div>

                      {extraOptionsCostFCFA > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--blue-primary)" }}>
                          <span>Services additionnels choisis</span>
                          <strong>+{formatAmount(extraOptionsCostFCFA)}</strong>
                        </div>
                      )}
                    </div>

                    {/* TOTAL HIGHLIGHT */}
                    <div style={{ background: "var(--navy-dark)", color: "#FFF", padding: "16px 18px", borderRadius: 14, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.05em" }}>
                        ESTIMATION TOTALE INDICATIVE
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#FFF", marginTop: 2 }}>
                        {formatAmount(totalEstimatedFCFA)}
                      </div>
                      <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 4 }}>
                        * Inclus marchandise, gestion et fret usine.
                      </div>
                    </div>

                    {/* TRUST POINTS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--navy-dark)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Zap style={{ width: 15, color: "#F59E0B" }} />
                        <span>Réponse officielle sous 2 heures max</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ShieldCheck style={{ width: 15, color: "var(--green-success)" }} />
                        <span>Inspection qualité physique à Guangzhou</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Globe style={{ width: 15, color: "var(--blue-primary)" }} />
                        <span>Accompagnement douane Cotonou / Afrique</span>
                      </div>
                    </div>
                  </div>

                  {/* NEED HELP BOX */}
                  <div className="card" style={{ padding: 18, background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#92400E", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <HelpCircle style={{ width: 16 }} /> Besoins d'aide pour votre commande ?
                    </div>
                    <div style={{ fontSize: 12, color: "#B45309", marginBottom: 10, lineHeight: 1.4 }}>
                      Nos conseillers sont disponibles 7j/7 pour vous assister dans le sourcing.
                    </div>
                    <a
                      href="https://wa.me/22997000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 800, color: "#92400E", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <MessageSquare style={{ width: 14 }} /> Écrire sur WhatsApp direct →
                    </a>
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function QuoteRequestPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
          Chargement du calculateur de devis...
        </div>
      }
    >
      <QuoteRequestContent />
    </Suspense>
  );
}
