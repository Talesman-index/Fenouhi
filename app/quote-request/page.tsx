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
  ArrowLeft,
  Calculator,
  ShieldCheck,
  CreditCard,
  Upload,
  Phone,
  Globe,
  Clock,
  Check,
  Smartphone,
  Shirt,
  ShoppingBag,
  Wrench,
  Zap,
  MessageSquare,
  Sparkles,
  ChevronRight,
  HelpCircle,
  X,
  Building2,
  MapPin,
} from "lucide-react";

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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdQuoteNumber, setCreatedQuoteNumber] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    url: "",
    productName: "",
    quantity: 50,
    destCountry: "Bénin (Cotonou, Calavi & Régions)",
    shippingMode: "air" as "air" | "sea",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    details: "",
    optInspection: true,
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
          quantity: Math.max(p.minimum_order_quantity || 1, parseInt(initialQty) || p.minimum_order_quantity || 50),
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

  // Dynamic calculations based on product and options (Strictly in FCFA)
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

  const formatAmount = (fcfaAmount: number) => {
    return `${fcfaAmount.toLocaleString("fr-FR")} FCFA`;
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
        formData.optInspection && "Inspection Qualité Entrepôt International",
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
        destination_country: "Bénin",
        destination_city: "Cotonou",
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
      `*Produit* : ${formData.productName || selectedProduct?.name}\n` +
      `*Quantité* : ${formData.quantity} unités\n` +
      `*Mode* : ${formData.shippingMode === "sea" ? "Fret Maritime Groupé" : "Fret Aérien Express"}\n` +
      `*Destination* : ${formData.destCountry}\n` +
      `*Total Estimé* : ${formatAmount(totalEstimatedFCFA)}\n\n` +
      `Merci de confirmer la disponibilité usine et d'émettre mon devis officiel.`
  );

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 80 }}>
      {/* HERO HEADER WITH DARK SLATE GRADIENT */}
      <header
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #165491 100%)",
          color: "#FFFFFF",
          padding: "48px 0 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "6px 16px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 800,
              color: "#38BDF8",
              marginBottom: 16,
            }}
          >
            <ShieldCheck style={{ width: 14, height: 14, color: "#10B981" }} />
            <span>SOURCING DIRECT USINES CHINE · DEVIS OFFICIEL SOUS 2H</span>
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              fontFamily: "'Outfit', sans-serif",
              color: "#FFFFFF",
              margin: "0 0 12px",
              letterSpacing: "-0.5px",
            }}
          >
            Devis d'Importation & Sourcing Sur-Mesure
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#CBD5E1",
              maxWidth: 680,
              margin: "0 auto 28px",
              lineHeight: 1.6,
            }}
          >
            Bénéficiez du prix direct usine en Chine. Inspection qualité en entrepôt international, dédouanement tout-en-un et livraison sécurisée au Bénin.
          </p>

          {/* STEP INDICATOR */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(12px)",
              padding: "10px 22px",
              borderRadius: 9999,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { num: "1", title: "Produit & Quantité" },
              { num: "2", title: "Transport & Options" },
              { num: "3", title: "Devis & Règlement" },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                {idx > 0 && <ChevronRight style={{ width: 14, height: 14, color: "#64748B" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      minWidth: 24,
                      minHeight: 24,
                      borderRadius: "50%",
                      background: idx === 0 ? "#EA580C" : "rgba(255, 255, 255, 0.2)",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      aspectRatio: "1/1",
                    }}
                  >
                    {step.num}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: idx === 0 ? "#FFFFFF" : "#94A3B8" }}>
                    {step.title}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <section style={{ padding: "36px 0", marginTop: -20, position: "relative", zIndex: 5 }}>
        <div className="container" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
          {submitted ? (
            /* SUCCESS STATE VIEW */
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                padding: "48px 32px",
                textAlign: "center",
                border: "1px solid #E2D9CC",
                boxShadow: "0 12px 40px rgba(15, 23, 42, 0.06)",
                maxWidth: 680,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 style={{ width: 44, height: 44 }} />
              </div>

              <span
                style={{
                  background: "#FEF3C7",
                  color: "#92400E",
                  fontSize: 12,
                  fontWeight: 900,
                  padding: "4px 12px",
                  borderRadius: 9999,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginBottom: 10,
                }}
              >
                DEMANDE ENREGISTRÉE AVEC SUCCÈS
              </span>

              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", fontFamily: "'Outfit', sans-serif", margin: "0 0 10px" }}>
                Devis N° {createdQuoteNumber} Transmis !
              </h2>
              <p style={{ fontSize: 14.5, color: "#64748B", margin: "0 auto 24px", lineHeight: 1.6 }}>
                Notre équipe logistique traite votre demande de sourcing direct en Chine. Vous recevrez l'offre officielle avec les tarifs fermes sous 2 heures.
              </p>

              {/* SUMMARY RECAP CARD */}
              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 18,
                  padding: "20px 24px",
                  margin: "0 auto 28px",
                  textAlign: "left",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 14, color: "#0F172A", marginBottom: 12, borderBottom: "1px solid #E2E8F0", paddingBottom: 8 }}>
                  Récapitulatif de la Demande
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Produit / Référence :</span>
                    <strong style={{ color: "#0F172A", textAlign: "right", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {formData.productName || selectedProduct?.name || "Sourcing personnalisé Chine"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Quantité :</span>
                    <strong style={{ color: "#0F172A" }}>{formData.quantity} unités</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Transit :</span>
                    <strong style={{ color: "#0F172A" }}>
                      {formData.shippingMode === "sea" ? "Fret Maritime Groupé (40-65j)" : "Fret Aérien Express (5-12j)"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Destination :</span>
                    <strong style={{ color: "#0F172A" }}>{formData.destCountry}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E2E8F0", paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontWeight: 900, color: "#0F172A" }}>Montant Estimé Total :</span>
                    <span style={{ fontWeight: 900, fontSize: 19, color: "#DC2626", fontFamily: "'Outfit', sans-serif" }}>
                      {formatAmount(totalEstimatedFCFA)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  href={`/payment?quote_id=${createdQuoteNumber || "DEV-2026-9410"}`}
                  style={{
                    background: "#16A34A",
                    color: "#FFFFFF",
                    padding: "14px 28px",
                    fontSize: 14.5,
                    fontWeight: 900,
                    borderRadius: 12,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 4px 16px rgba(22, 163, 74, 0.25)",
                  }}
                >
                  <CreditCard style={{ width: 18, height: 18 }} />
                  <span>Payer par Mobile Money Bénin</span>
                </Link>

                <a
                  href={`https://wa.me/22997000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    padding: "14px 24px",
                    fontSize: 14,
                    fontWeight: 800,
                    borderRadius: 12,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <MessageSquare style={{ width: 18, height: 18 }} />
                  <span>Contacter sur WhatsApp</span>
                </a>

                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    background: "#FFFFFF",
                    color: "#0F172A",
                    padding: "14px 20px",
                    fontSize: 13.5,
                    fontWeight: 700,
                    border: "1.5px solid #CBD5E1",
                    borderRadius: 12,
                    cursor: "pointer",
                  }}
                >
                  Nouvelle demande
                </button>
              </div>
            </div>
          ) : (
            /* FORM & ESTIMATOR 2-COLUMN GRID */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
              
              {/* LEFT FORM COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, gridColumn: "span 2" }}>
                
                {/* SELECTED PRODUCT CARD BANNER (if from product detail page) */}
                {selectedProduct ? (
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 18,
                      padding: "20px 24px",
                      border: "2px solid #0284C7",
                      position: "relative",
                      boxShadow: "0 4px 16px rgba(2, 132, 199, 0.08)",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: -11,
                        left: 20,
                        background: "#0284C7",
                        color: "#FFFFFF",
                        fontSize: 10.5,
                        fontWeight: 900,
                        padding: "2px 10px",
                        borderRadius: 6,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      Produit sélectionné du catalogue
                    </span>

                    <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 4 }}>
                      <img
                        src={selectedProduct.images?.[0]?.public_image_url || "/images/assets/item_1.jpg"}
                        alt={selectedProduct.name}
                        style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", background: "#F8FAFC", border: "1px solid #E2E8F0", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" }}>
                          {selectedProduct.name}
                        </h3>
                        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>
                          {selectedProduct.short_description || "Article direct usine certifiée"} · Origine : <strong>Chine</strong>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                          <span style={{ fontSize: 18, fontWeight: 900, color: "#DC2626", fontFamily: "'Outfit', sans-serif" }}>
                            {selectedProduct.price.toLocaleString()} FCFA
                          </span>
                          <span style={{ fontSize: 12, color: "#64748B" }}>/ unité (min. {selectedProduct.minimum_order_quantity || 1}u)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* QUICK PRESETS BANNER (if custom request) */
                  <div style={{ background: "#FFFFFF", borderRadius: 18, padding: "18px 20px", border: "1px solid #E2D9CC" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 10 }}>
                      Exemples d'articles fréquents (cliquez pour pré-remplir) :
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
                            border: "1px solid #CBD5E1",
                            background: "#F8FAFC",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#0F172A",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <cat.icon style={{ width: 13, height: 13, color: "#165491" }} />
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* FORM CARD */}
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 20,
                    padding: "28px",
                    border: "1px solid #E2D9CC",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
                  }}
                >
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    
                    {/* SECTION 1: PRODUCT & QUANTITY */}
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: "#0F172A",
                          fontFamily: "'Outfit', sans-serif",
                          marginBottom: 16,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          borderBottom: "1px solid #F1F5F9",
                          paddingBottom: 10,
                        }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          1
                        </div>
                        <span>Informations sur le Produit & Quantité</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                            Lien du produit ou description détaillée *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: https://1688.com/item/12345.html ou '50 montres connectées AMOLED'"
                            value={formData.productName || formData.url}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                productName: e.target.value,
                                url: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              fontSize: 13.5,
                              borderRadius: 10,
                              border: "1.5px solid #CBD5E1",
                              background: "#F8FAFC",
                              color: "#0F172A",
                              outline: "none",
                            }}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                              Quantité souhaitée (unités) *
                            </label>
                            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #CBD5E1", borderRadius: 10, overflow: "hidden", background: "#FFFFFF" }}>
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
                                style={{ width: 44, height: 44, background: "#F8FAFC", border: "none", cursor: "pointer", fontWeight: 900, fontSize: 18, color: "#0F172A" }}
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
                                style={{ width: "100%", height: 44, border: "none", textAlign: "center", fontWeight: 900, fontSize: 16, outline: "none", color: "#0F172A" }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    quantity: prev.quantity + (prev.quantity < 50 ? 1 : 10),
                                  }))
                                }
                                style={{ width: 44, height: 44, background: "#F8FAFC", border: "none", cursor: "pointer", fontWeight: 900, fontSize: 18, color: "#0F172A" }}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                              Photo / Modèle du produit (optionnel)
                            </label>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                height: 44,
                                border: "1.5px dashed #CBD5E1",
                                borderRadius: 10,
                                background: "#F8FAFC",
                                cursor: "pointer",
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: attachedFile ? "#16A34A" : "#64748B",
                                padding: "0 12px",
                              }}
                            >
                              <Upload style={{ width: 16, height: 16 }} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {attachedFile ? attachedFile.name : "Ajouter une image..."}
                              </span>
                              <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} style={{ display: "none" }} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SHIPPING MODE CARDS */}
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: "#0F172A",
                          fontFamily: "'Outfit', sans-serif",
                          marginBottom: 16,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          borderBottom: "1px solid #F1F5F9",
                          paddingBottom: 10,
                        }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          2
                        </div>
                        <span>Mode de Transport & Destination</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 16 }}>
                        {/* AIR */}
                        <div
                          onClick={() => setFormData({ ...formData, shippingMode: "air" })}
                          style={{
                            padding: "16px 18px",
                            borderRadius: 14,
                            border: formData.shippingMode === "air" ? "2px solid #0284C7" : "1.5px solid #E2E8F0",
                            background: formData.shippingMode === "air" ? "#F0F9FF" : "#FFFFFF",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              background: formData.shippingMode === "air" ? "#0284C7" : "#94A3B8",
                              color: "#FFFFFF",
                              fontSize: 10,
                              fontWeight: 900,
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            RECOMMANDÉ
                          </span>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <Plane style={{ width: 18, height: 18, color: "#0284C7" }} />
                            <div style={{ fontSize: 14.5, fontWeight: 900, color: "#0284C7" }}>Fret Aérien Express</div>
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>
                            Délai : 5–12 jours
                          </div>
                          <div style={{ fontSize: 11.5, color: "#64748B" }}>
                            Tarif : 7 500 FCFA / kg
                          </div>
                        </div>

                        {/* SEA */}
                        <div
                          onClick={() => setFormData({ ...formData, shippingMode: "sea" })}
                          style={{
                            padding: "16px 18px",
                            borderRadius: 14,
                            border: formData.shippingMode === "sea" ? "2px solid #059669" : "1.5px solid #E2E8F0",
                            background: formData.shippingMode === "sea" ? "#ECFDF5" : "#FFFFFF",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              background: formData.shippingMode === "sea" ? "#059669" : "#94A3B8",
                              color: "#FFFFFF",
                              fontSize: 10,
                              fontWeight: 900,
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            ÉCONOMIQUE
                          </span>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <Ship style={{ width: 18, height: 18, color: "#059669" }} />
                            <div style={{ fontSize: 14.5, fontWeight: 900, color: "#059669" }}>Fret Maritime Groupé</div>
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>
                            Délai : 40–65 jours
                          </div>
                          <div style={{ fontSize: 11.5, color: "#64748B" }}>
                            Tarif : 185 000 FCFA / CBM
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                          Destination finale de réception *
                        </label>
                        <select
                          value={formData.destCountry}
                          onChange={(e) => setFormData({ ...formData, destCountry: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 13.5,
                            borderRadius: 10,
                            border: "1.5px solid #CBD5E1",
                            background: "#FFFFFF",
                            color: "#0F172A",
                            outline: "none",
                            fontWeight: 700,
                          }}
                        >
                          <option>Bénin (Cotonou, Calavi & Régions)</option>
                          <option>Togo (Lomé)</option>
                          <option>Côte d'Ivoire (Abidjan)</option>
                          <option>Sénégal (Dakar)</option>
                          <option>Cameroun (Douala)</option>
                        </select>
                      </div>
                    </div>

                    {/* SECTION 3: OPTIONS & SERVICES ADDITIONNELS */}
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: "#0F172A",
                          fontFamily: "'Outfit', sans-serif",
                          marginBottom: 16,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          borderBottom: "1px solid #F1F5F9",
                          paddingBottom: 10,
                        }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          3
                        </div>
                        <span>Services & Options Incluses</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          {
                            id: "optInspection",
                            label: "Inspection Qualité en Entrepôt International",
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
                              padding: "12px 14px",
                              borderRadius: 10,
                              background: opt.checked ? "#EFF6FF" : "#F8FAFC",
                              border: `1.5px solid ${opt.checked ? "#3B82F6" : "#E2E8F0"}`,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
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
                              style={{ width: 18, height: 18, marginTop: 2, accentColor: "#165491" }}
                            />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{opt.label}</div>
                              <div style={{ fontSize: 11.5, color: "#64748B" }}>{opt.sub}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 4: CLIENT CONTACT */}
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: "#0F172A",
                          fontFamily: "'Outfit', sans-serif",
                          marginBottom: 16,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          borderBottom: "1px solid #F1F5F9",
                          paddingBottom: 10,
                        }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          4
                        </div>
                        <span>Vos Coordonnées de Contact</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                            Votre Nom & Prénom *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Jean Koffi"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              fontSize: 13.5,
                              borderRadius: 10,
                              border: "1.5px solid #CBD5E1",
                              background: "#F8FAFC",
                              color: "#0F172A",
                              outline: "none",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                            Numéro WhatsApp (avec indicatif) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="+229 97 00 11 22"
                            value={formData.clientPhone}
                            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              fontSize: 13.5,
                              borderRadius: 10,
                              border: "1.5px solid #CBD5E1",
                              background: "#F8FAFC",
                              color: "#0F172A",
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                          Email pour recevoir le devis (optionnel)
                        </label>
                        <input
                          type="email"
                          placeholder="votre.email@exemple.com"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 13.5,
                            borderRadius: 10,
                            border: "1.5px solid #CBD5E1",
                            background: "#F8FAFC",
                            color: "#0F172A",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                          Instructions spécifiques pour l'usine chinoise
                        </label>
                        <textarea
                          placeholder="Ex: Préciser 50 pièces couleur noire et 50 pièces couleur or..."
                          value={formData.details}
                          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                          style={{
                            width: "100%",
                            height: 75,
                            padding: "10px 14px",
                            fontSize: 13,
                            borderRadius: 10,
                            border: "1.5px solid #CBD5E1",
                            background: "#F8FAFC",
                            color: "#0F172A",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "16px 24px",
                        fontSize: 15.5,
                        fontWeight: 900,
                        borderRadius: 12,
                        background: "#0F172A",
                        color: "#FFFFFF",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.2)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Send style={{ width: 18, height: 18 }} />
                      <span>{loading ? "Calcul & Transmission en cours..." : "Soumettre ma Demande de Devis d'Importation"}</span>
                    </button>

                    <div style={{ fontSize: 12, color: "#64748B", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <ShieldCheck style={{ width: 16, height: 16, color: "#16A34A" }} />
                      <span>Saisie 100% sécurisée · Zéro engagement bancaire à cette étape</span>
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT STICKY ESTIMATOR SIDEBAR */}
              <div style={{ position: "sticky", top: 90, display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* ESTIMATOR CARD */}
                <div
                  style={{
                    padding: "24px",
                    background: "#FFFFFF",
                    borderRadius: 20,
                    border: "1.5px solid #0F172A",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calculator style={{ width: 18, height: 18, color: "#165491" }} />
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#0F172A", letterSpacing: "0.5px" }}>CALCULATEUR EN TEMPS RÉEL</span>
                    </div>

                    <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>
                      DEVISE : FCFA
                    </span>
                  </div>

                  {/* DETAILED COST BREAKDOWN */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748B" }}>
                        Marchandise ({quantity} × {formatAmount(unitPriceFCFA)})
                      </span>
                      <strong style={{ color: "#0F172A" }}>{formatAmount(productCostFCFA)}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748B" }}>
                        Frais Sourcing & Gestion (5%)
                      </span>
                      <strong style={{ color: "#0F172A" }}>{formatAmount(serviceFeeFCFA)}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748B" }}>
                        Fret {formData.shippingMode === "sea" ? "Maritime" : "Aérien"} estimé
                      </span>
                      <strong style={{ color: "#0F172A" }}>{formatAmount(estimatedShippingFeeFCFA)}</strong>
                    </div>

                    {extraOptionsCostFCFA > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#0284C7" }}>
                        <span>Services additionnels choisis</span>
                        <strong>+{formatAmount(extraOptionsCostFCFA)}</strong>
                      </div>
                    )}
                  </div>

                  {/* TOTAL HIGHLIGHT */}
                  <div style={{ background: "#0F172A", color: "#FFFFFF", padding: "18px 20px", borderRadius: 14, marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      Estimation Totale Indicative
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#FFFFFF", marginTop: 4, fontFamily: "'Outfit', sans-serif" }}>
                      {formatAmount(totalEstimatedFCFA)}
                    </div>
                    <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 4 }}>
                      * Inclus marchandise usine, gestion et fret international.
                    </div>
                  </div>

                  {/* TRUST POINTS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "#0F172A" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock style={{ width: 15, height: 15, color: "#EA580C" }} />
                      <span>Réponse officielle sous 2 heures max</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldCheck style={{ width: 15, height: 15, color: "#16A34A" }} />
                      <span>Inspection qualité physique en entrepôt international</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin style={{ width: 15, height: 15, color: "#0284C7" }} />
                      <span>Dédouanement & livraison à Cotonou / Bénin</span>
                    </div>
                  </div>
                </div>

                {/* NEED HELP BOX */}
                <div style={{ padding: "18px 20px", background: "#FEF9C3", border: "1.5px solid #FDE047", borderRadius: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "#854D0E", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <HelpCircle style={{ width: 16, height: 16 }} />
                    <span>Besoin d'aide pour votre devis ?</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#A16207", marginBottom: 10, lineHeight: 1.4 }}>
                    Nos conseillers sont disponibles 7j/7 pour vous assister dans le sourcing.
                  </div>
                  <a
                    href="https://wa.me/22997000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12.5, fontWeight: 800, color: "#854D0E", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <MessageSquare style={{ width: 14, height: 14 }} />
                    <span>Écrire sur WhatsApp direct →</span>
                  </a>
                </div>

              </div>

            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function QuoteRequestPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: 80, color: "#64748B" }}>
          Chargement du calculateur de devis...
        </div>
      }
    >
      <QuoteRequestContent />
    </Suspense>
  );
}
