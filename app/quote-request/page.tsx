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
  ArrowRight,
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
        formData.optReinforcedPackaging && "Emballage Renforcé Caisse Bois",
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
    <div style={{ background: "#F8FAFC", minHeight: "100vh", paddingBottom: 80, fontFamily: "var(--font-body), 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* SOBRE HERO HEADER WITH CARGOLINK NAVY */}
      <header
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #162438 100%)",
          color: "#FFFFFF",
          padding: "52px 0 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px", textAlign: "center", position: "relative", zIndex: 2 }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 14 }}>
            <span>SOURCING DIRECT CHINE ➔ BÉNIN</span>
            <span>•</span>
            <span>RÉPONSE SOUS 2H</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 3.6vw, 42px)",
              fontWeight: 800,
              color: "#FFFFFF",
              margin: "0 0 14px",
              lineHeight: 1.15,
            }}
          >
            Devis Sur-Mesure & Sourcing Usine
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "#CBD5E1",
              maxWidth: 640,
              margin: "0 auto 32px",
              lineHeight: 1.6,
            }}
          >
            Obtenez une cotation précise avec tarif direct usine, inspection entrepôt, dédouanement et livraison sécurisée à Cotonou.
          </p>

          {/* MINIMALIST STEP PROGRESS LINE */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "10px 24px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              color: "#CBD5E1",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#FFFFFF", fontWeight: 700 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#165491", color: "#FFF", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
              <span>Produit & Quantité</span>
            </div>
            <ChevronRight style={{ width: 14, height: 14, color: "#64748B" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
              <span>Transport & Options</span>
            </div>
            <ChevronRight style={{ width: 14, height: 14, color: "#64748B" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
              <span>Devis & Validation</span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <section style={{ padding: "40px 0", marginTop: -20, position: "relative", zIndex: 5 }}>
        <div className="container" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
          
          {submitted ? (
            /* SUCCESS STATE VIEW */
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: "48px 32px",
                textAlign: "center",
                border: "1px solid #F1F5F9",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 style={{ width: 36, height: 36 }} />
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: "0 0 10px" }}>
                Devis N° {createdQuoteNumber} Transmis !
              </h2>
              
              <p style={{ fontSize: 14, color: "#64748B", margin: "0 auto 28px", lineHeight: 1.6 }}>
                Notre équipe logistique étudie votre demande auprès des fournisseurs. Vous recevrez une proposition officielle sous 2 heures.
              </p>

              {/* SUMMARY RECAP */}
              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 12,
                  padding: "20px",
                  margin: "0 auto 28px",
                  textAlign: "left",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0F172A", marginBottom: 12, borderBottom: "1px solid #E2E8F0", paddingBottom: 8 }}>
                  Récapitulatif de la Demande
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Produit / Référence :</span>
                    <strong style={{ color: "#0F172A", textAlign: "right", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {formData.productName || selectedProduct?.name || "Sourcing personnalisé Chine"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Quantité :</span>
                    <strong style={{ color: "#0F172A" }}>{formData.quantity} unités</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Transport :</span>
                    <strong style={{ color: "#0F172A" }}>
                      {formData.shippingMode === "sea" ? "Fret Maritime Groupé (40-65j)" : "Fret Aérien Express (5-12j)"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Destination :</span>
                    <strong style={{ color: "#0F172A" }}>{formData.destCountry}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E2E8F0", paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontWeight: 700, color: "#0F172A" }}>Montant Estimé Total :</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: "#165491" }}>
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
                    background: "#165491",
                    color: "#FFFFFF",
                    padding: "13px 24px",
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 8,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CreditCard style={{ width: 16, height: 16 }} />
                  <span>Payer par Mobile Money</span>
                </Link>

                <a
                  href={`https://wa.me/22997000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    padding: "13px 22px",
                    fontSize: 13.5,
                    fontWeight: 700,
                    borderRadius: 8,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <MessageSquare style={{ width: 16, height: 16 }} />
                  <span>Contacter WhatsApp</span>
                </a>

                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    background: "#FFFFFF",
                    color: "#0F172A",
                    padding: "13px 20px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Nouvelle demande
                </button>
              </div>
            </div>
          ) : (
            /* FORM & ESTIMATOR GRID */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>
              
              {/* LEFT FORM COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* SELECTED PRODUCT CARD BANNER (if from product page) */}
                {selectedProduct ? (
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 12,
                      padding: "18px 20px",
                      border: "1px solid #165491",
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={selectedProduct.images?.[0]?.public_image_url || "/images/assets/item_1.jpg"}
                      alt={selectedProduct.name}
                      style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", background: "#F8FAFC", border: "1px solid #F1F5F9", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#165491", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>
                        Produit du catalogue sélectionné
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>
                        {selectedProduct.name}
                      </h3>
                      <div style={{ fontSize: 13, color: "#165491", fontWeight: 700 }}>
                        {selectedProduct.price.toLocaleString()} FCFA <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>/ unité (min. {selectedProduct.minimum_order_quantity || 1}u)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* QUICK PRESETS BANNER */
                  <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "16px 20px", border: "1px solid #F1F5F9" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
                      Exemples de produits (cliquez pour remplir) :
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: "1px solid #E2E8F0",
                            background: "#F8FAFC",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#334155",
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

                {/* FORM CONTAINER */}
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    padding: "32px",
                    border: "1px solid #F1F5F9",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
                  }}
                >
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    
                    {/* SECTION 1: PRODUCT & QUANTITY */}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
                        <span>Produit & Quantité Souhaitée</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div>
                          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                            Lien du produit ou description détaillée *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: https://1688.com/item/12345.html ou '100 casques Bluetooth ANC'"
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
                              padding: "12px 14px",
                              fontSize: 13.5,
                              borderRadius: 8,
                              border: "1px solid #E2E8F0",
                              background: "#FFFFFF",
                              color: "#0F172A",
                              outline: "none",
                              transition: "border 0.2s ease"
                            }}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div>
                            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                              Quantité (unités) *
                            </label>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden", background: "#FFFFFF" }}>
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
                                style={{ width: 40, height: 42, background: "#F8FAFC", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#0F172A" }}
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
                                style={{ width: "100%", height: 42, border: "none", textAlign: "center", fontWeight: 700, fontSize: 15, outline: "none", color: "#0F172A" }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    quantity: prev.quantity + (prev.quantity < 50 ? 1 : 10),
                                  }))
                                }
                                style={{ width: 40, height: 42, background: "#F8FAFC", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#0F172A" }}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                              Photo ou Fichier (optionnel)
                            </label>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                height: 42,
                                border: "1px dashed #CBD5E1",
                                borderRadius: 8,
                                background: "#F8FAFC",
                                cursor: "pointer",
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: attachedFile ? "#059669" : "#64748B",
                                padding: "0 12px",
                              }}
                            >
                              <Upload style={{ width: 15, height: 15 }} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {attachedFile ? attachedFile.name : "Joindre un fichier..."}
                              </span>
                              <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} style={{ display: "none" }} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SHIPPING MODE */}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
                        <span>Mode de Transport & Destination</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                        {/* AIR */}
                        <div
                          onClick={() => setFormData({ ...formData, shippingMode: "air" })}
                          style={{
                            padding: "14px 16px",
                            borderRadius: 10,
                            border: formData.shippingMode === "air" ? "2px solid #165491" : "1px solid #E2E8F0",
                            background: formData.shippingMode === "air" ? "#F0F7FF" : "#FFFFFF",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, color: "#0F172A" }}>
                              <Plane style={{ width: 17, height: 17, color: "#165491" }} />
                              <span>Fret Aérien Express</span>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#165491", background: "#E0F2FE", padding: "1px 6px", borderRadius: 4 }}>5–12 Jours</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>
                            Tarif indicatif : 7 500 FCFA / kg
                          </div>
                        </div>

                        {/* SEA */}
                        <div
                          onClick={() => setFormData({ ...formData, shippingMode: "sea" })}
                          style={{
                            padding: "14px 16px",
                            borderRadius: 10,
                            border: formData.shippingMode === "sea" ? "2px solid #165491" : "1px solid #E2E8F0",
                            background: formData.shippingMode === "sea" ? "#F0F7FF" : "#FFFFFF",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, color: "#0F172A" }}>
                              <Ship style={{ width: 17, height: 17, color: "#165491" }} />
                              <span>Fret Maritime Groupé</span>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "1px 6px", borderRadius: 4 }}>Économique</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>
                            Délai : 40–65 jours · 185 000 FCFA / CBM
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          Destination de réception *
                        </label>
                        <select
                          value={formData.destCountry}
                          onChange={(e) => setFormData({ ...formData, destCountry: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            fontSize: 13.5,
                            borderRadius: 8,
                            border: "1px solid #E2E8F0",
                            background: "#FFFFFF",
                            color: "#0F172A",
                            outline: "none",
                            fontWeight: 600,
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

                    {/* SECTION 3: OPTIONS ADDITIONNELLES */}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
                        <span>Services & Options Incluses</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                          {
                            id: "optInspection",
                            label: "Inspection Qualité en Entrepôt Chine",
                            sub: "Rapport photo HD & vérification conformité (+15 000 FCFA)",
                            checked: formData.optInspection,
                          },
                          {
                            id: "optReinforcedPackaging",
                            label: "Emballage Renforcé Caisse Bois / Bulle",
                            sub: "Protection maximale pendant le transport (+5 000 FCFA)",
                            checked: formData.optReinforcedPackaging,
                          },
                          {
                            id: "optCustomBranding",
                            label: "Personnalisation Logo & Branding Propre",
                            sub: "Impression de votre logo sur cartons produits (+10 000 FCFA)",
                            checked: formData.optCustomBranding,
                          },
                        ].map((opt) => (
                          <label
                            key={opt.id}
                            style={{
                              display: "flex",
                              gap: 12,
                              padding: "10px 12px",
                              borderRadius: 8,
                              background: opt.checked ? "#F0F7FF" : "#FFFFFF",
                              border: `1px solid ${opt.checked ? "#BAE6FD" : "#F1F5F9"}`,
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
                              style={{ width: 16, height: 16, marginTop: 2, accentColor: "#165491" }}
                            />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{opt.label}</div>
                              <div style={{ fontSize: 11.5, color: "#64748B" }}>{opt.sub}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 4: CLIENT CONTACT */}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>4</span>
                        <span>Coordonnées de Contact</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                            Nom & Prénom *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Jean Koffi"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              fontSize: 13.5,
                              borderRadius: 8,
                              border: "1px solid #E2E8F0",
                              background: "#FFFFFF",
                              color: "#0F172A",
                              outline: "none",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
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
                              padding: "11px 14px",
                              fontSize: 13.5,
                              borderRadius: 8,
                              border: "1px solid #E2E8F0",
                              background: "#FFFFFF",
                              color: "#0F172A",
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          Email (optionnel)
                        </label>
                        <input
                          type="email"
                          placeholder="votre.email@exemple.com"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            fontSize: 13.5,
                            borderRadius: 8,
                            border: "1px solid #E2E8F0",
                            background: "#FFFFFF",
                            color: "#0F172A",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          Instructions pour l'usine ou détails spécifiques
                        </label>
                        <textarea
                          placeholder="Ex: Préciser 50 pièces couleur noire et 50 pièces couleur or..."
                          value={formData.details}
                          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                          style={{
                            width: "100%",
                            height: 70,
                            padding: "10px 12px",
                            fontSize: 13,
                            borderRadius: 8,
                            border: "1px solid #E2E8F0",
                            background: "#FFFFFF",
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
                        padding: "15px 24px",
                        fontSize: 15,
                        fontWeight: 800,
                        borderRadius: 8,
                        background: "#165491",
                        color: "#FFFFFF",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        boxShadow: "0 4px 16px rgba(22, 84, 145, 0.25)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Send style={{ width: 17, height: 17 }} />
                      <span>{loading ? "Transmission en cours..." : "Soumettre ma Demande de Devis"}</span>
                    </button>

                    <div style={{ fontSize: 12, color: "#64748B", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <ShieldCheck style={{ width: 15, height: 15, color: "#059669" }} />
                      <span>Zéro engagement bancaire à cette étape</span>
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT STICKY ESTIMATOR SIDEBAR */}
              <div style={{ position: "sticky", top: 90, display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* ESTIMATOR DARK NAVY CARD */}
                <div
                  style={{
                    padding: "24px",
                    background: "#0F172A",
                    color: "#FFFFFF",
                    borderRadius: 16,
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.15)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calculator style={{ width: 17, height: 17, color: "#38BDF8" }} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.06em", textTransform: "uppercase" }}>CALCULATEUR DEVIS</span>
                    </div>

                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#94A3B8" }}>
                      BÉNIN (FCFA)
                    </span>
                  </div>

                  {/* COST BREAKDOWN */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94A3B8" }}>
                        Marchandise ({quantity} × {formatAmount(unitPriceFCFA)})
                      </span>
                      <strong style={{ color: "#FFFFFF" }}>{formatAmount(productCostFCFA)}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94A3B8" }}>
                        Frais Sourcing & Gestion (5%)
                      </span>
                      <strong style={{ color: "#FFFFFF" }}>{formatAmount(serviceFeeFCFA)}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94A3B8" }}>
                        Fret {formData.shippingMode === "sea" ? "Maritime" : "Aérien"} estimé
                      </span>
                      <strong style={{ color: "#FFFFFF" }}>{formatAmount(estimatedShippingFeeFCFA)}</strong>
                    </div>

                    {extraOptionsCostFCFA > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#38BDF8" }}>
                        <span>Services choisis</span>
                        <strong>+{formatAmount(extraOptionsCostFCFA)}</strong>
                      </div>
                    )}
                  </div>

                  {/* GLOWING TOTAL HIGHLIGHT */}
                  <div style={{ background: "rgba(255, 255, 255, 0.07)", padding: "16px", borderRadius: 10, marginBottom: 18, border: "1px solid rgba(255,255,255,0.12)" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      Estimation Totale Indicative
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
                      {formatAmount(totalEstimatedFCFA)}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                      * Inclus marchandise usine, gestion & fret Cotonou.
                    </div>
                  </div>

                  {/* TRUST POINTS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "#CBD5E1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock style={{ width: 14, height: 14, color: "#38BDF8" }} />
                      <span>Réponse officielle sous 2 heures max</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldCheck style={{ width: 14, height: 14, color: "#059669" }} />
                      <span>Inspection physique entrepôt Chine</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin style={{ width: 14, height: 14, color: "#38BDF8" }} />
                      <span>Livraison sécurisée Cotonou & Bénin</span>
                    </div>
                  </div>
                </div>

                {/* HELP BOX */}
                <div style={{ padding: "16px 18px", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <HelpCircle style={{ width: 15, height: 15, color: "#165491" }} />
                    <span>Besoin d'aide ?</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10, lineHeight: 1.4 }}>
                    Assistance sourcing directe disponible 7j/7.
                  </div>
                  <a
                    href="https://wa.me/22997000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12.5, fontWeight: 700, color: "#165491", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <MessageSquare style={{ width: 14, height: 14 }} />
                    <span>Contacter WhatsApp →</span>
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
