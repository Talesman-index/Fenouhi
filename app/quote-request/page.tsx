"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, getProductById, Product } from "@/lib/products";
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
} from "lucide-react";

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
  });

  useEffect(() => {
    let p: Product | undefined;
    if (productId) {
      p = getProductById(productId);
    } else if (prodTitle) {
      p = PRODUCTS.find(
        (item) => item.title.toLowerCase() === prodTitle.toLowerCase()
      );
    }

    if (p) {
      setSelectedProduct(p);
      setFormData((prev) => ({
        ...prev,
        productName: p.title,
        url: `https://cargolink.africa/product/${p.id}`,
        quantity: Math.max(p.minQty, parseInt(initialQty) || p.minQty),
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
  }, [productId, prodTitle, initialQty, initialMode]);

  // Dynamic calculations based on product and form selections
  const unitPrice = selectedProduct ? selectedProduct.price : 0;
  const quantity = Math.max(1, formData.quantity || 1);
  const productCost = unitPrice * quantity;
  const serviceFee = Math.round(productCost * 0.05);

  const weightPerUnit = selectedProduct ? parseFloat(selectedProduct.weight) || 0.3 : 0.3;
  const volumePerUnit = selectedProduct ? parseFloat(selectedProduct.volume) || 0.002 : 0.002;
  const totalWeight = weightPerUnit * quantity;
  const totalVolume = volumePerUnit * quantity;

  const airRate = 7500; // FCFA/kg
  const seaRate = 185000; // FCFA/CBM
  const estimatedShippingFee =
    formData.shippingMode === "sea"
      ? Math.round(totalVolume * seaRate)
      : Math.round(totalWeight * airRate);

  const totalEstimatedAmount = productCost + serviceFee + estimatedShippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const generatedNum = `DEV-${Date.now().toString().slice(-6)}`;
    setCreatedQuoteNumber(generatedNum);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("quotes").insert({
        quote_number: generatedNum,
        user_id: user?.id || null,
        user_name: formData.clientName,
        user_email: formData.clientEmail || user?.email || null,
        product_link: formData.url || formData.productName,
        product_name: formData.productName || selectedProduct?.title || "Produit Import",
        quantity: formData.quantity,
        estimated_price: unitPrice,
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
        product_cost: productCost,
        service_fee: serviceFee,
        shipping_fee: estimatedShippingFee,
        extra_fee: 0,
        admin_notes: `Demande directe web. Tel: ${formData.clientPhone}. Détails: ${formData.details}`,
      });
    } catch (err) {
      console.warn("Supabase insert warning (local demo mode):", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div>
      {/* HERO HEADER */}
      <header
        style={{
          background: "var(--navy-dark)",
          color: "#FFF",
          padding: "45px 0 55px",
          borderBottom: "4px solid var(--orange-primary)",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <span
            className="badge"
            style={{
              marginBottom: 12,
              background: "rgba(255,255,255,0.15)",
              color: "#FFF",
              fontSize: 12,
            }}
          >
            SOURCING SUR-MESURE & LOGISTIQUE CHINE → AFRIQUE
          </span>
          <h1 className="hero-page-title">Demande de Devis Détaillé d'Importation</h1>
          <p
            style={{
              fontSize: 15,
              color: "#CBD5E1",
              maxWidth: 660,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Calcul en temps réel selon les spécifications usine et les frais de transport officiels CargoLink Africa.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section style={{ padding: "40px 0 60px", background: "var(--bg-main)" }}>
        <div className="container">
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            {submitted ? (
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--green-bg)",
                    color: "var(--green-success)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <CheckCircle2 style={{ width: 36 }} />
                </div>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "var(--navy-dark)",
                    marginBottom: 8,
                  }}
                >
                  Demande de Devis Soumise avec Succès !
                </h2>
                <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 20 }}>
                  Référence officielle : <strong>{createdQuoteNumber}</strong>. Notre équipe étudie votre dossier et vous envoie la confirmation finale sur WhatsApp.
                </p>

                {/* Recap of Submitted Quote */}
                {selectedProduct && (
                  <div
                    style={{
                      background: "var(--bg-main)",
                      padding: 20,
                      borderRadius: 12,
                      maxWidth: 500,
                      margin: "0 auto 24px",
                      textAlign: "left",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--navy-dark)", marginBottom: 8 }}>
                      {selectedProduct.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>Quantité :</span> <strong>{formData.quantity} unités</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>Mode d'expédition :</span> <strong>{formData.shippingMode === "sea" ? "Maritime" : "Aérien"}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>Destination :</span> <strong>{formData.destCountry}</strong>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "var(--orange-primary)", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: 8, marginTop: 8 }}>
                      <span>Total Estimé :</span> <span>{totalEstimatedAmount.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/dashboard" className="btn btn-orange">
                    Accéder au Dashboard Client
                  </Link>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn btn-primary"
                    style={{ background: "rgba(15,23,42,0.1)", color: "var(--navy-dark)" }}
                  >
                    Faire une autre demande
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: selectedProduct ? "1fr 340px" : "1fr",
                  gap: 24,
                  alignItems: "start",
                }}
              >
                {/* FORM COLUMN */}
                <div className="card admin-card" style={{ padding: 32 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 20,
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--navy-dark)",
                      borderBottom: "1px solid var(--border-light)",
                      paddingBottom: 12,
                    }}
                  >
                    <Calculator style={{ width: 18, color: "var(--orange-primary)" }} />
                    {selectedProduct
                      ? "Formulaire Devis Personnalisé"
                      : "Saisie de la Demande de Devis"}
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--navy-dark)",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        1. PRODUIT OU LIEN CHINE (1688, ALIBABA, POIZON) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: https://detail.1688.com/offer/6543210.html ou '200 paires de baskets'"
                        value={formData.productName || formData.url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            productName: e.target.value,
                            url: e.target.value,
                          })
                        }
                        className="admin-input"
                      />
                    </div>

                    <div className="grid-2" style={{ gap: 16 }}>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "var(--navy-dark)",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          2. QUANTITÉ SOUHAITÉE *
                        </label>
                        <input
                          type="number"
                          required
                          min={selectedProduct ? selectedProduct.minQty : 1}
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                          className="admin-input"
                        />
                        {selectedProduct && (
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                            Min. {selectedProduct.minQty} unités pour ce produit usine
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "var(--navy-dark)",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          3. MODE D'EXPÉDITION *
                        </label>
                        <select
                          value={formData.shippingMode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shippingMode: e.target.value as "air" | "sea",
                            })
                          }
                          className="admin-input"
                          style={{ background: "#FFF", fontWeight: 700 }}
                        >
                          <option value="air">✈️ Fret Aérien (10–18 jours)</option>
                          <option value="sea">🚢 Fret Maritime (30–45 jours)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: 16 }}>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "var(--navy-dark)",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          4. PAYS & VILLE DE DESTINATION *
                        </label>
                        <select
                          value={formData.destCountry}
                          onChange={(e) => setFormData({ ...formData, destCountry: e.target.value })}
                          className="admin-input"
                          style={{ background: "#FFF" }}
                        >
                          <option>Bénin (Cotonou)</option>
                          <option>Togo (Lomé)</option>
                          <option>Côte d'Ivoire (Abidjan)</option>
                          <option>Sénégal (Dakar)</option>
                          <option>Cameroun (Douala)</option>
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "var(--navy-dark)",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          5. NUMÉRO WHATSAPP (POUR ENVOI DU DEVIS) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="+229 97 00 11 22"
                          value={formData.clientPhone}
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: 16 }}>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "var(--navy-dark)",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          6. NOM & PRÉNOM *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Jean Koffi"
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          className="admin-input"
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "var(--navy-dark)",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          7. EMAIL (OPTIONNEL)
                        </label>
                        <input
                          type="email"
                          placeholder="votre@email.com"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--navy-dark)",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        8. INSTRUCTIONS SPÉCIFIQUES (COULEURS, TAILLES, EMBALLAGE)
                      </label>
                      <textarea
                        placeholder="Précisez vos exigences pour la négociation usine..."
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className="admin-input"
                        style={{ height: 80 }}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-orange admin-btn"
                      style={{
                        padding: 14,
                        fontSize: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontWeight: 900,
                      }}
                    >
                      <Send style={{ width: 18 }} />
                      {loading
                        ? "Envoi en cours..."
                        : "Soumettre ma Demande de Devis Officiel"}
                    </button>
                  </form>
                </div>

                {/* PRODUCT RECAP SIDEBAR */}
                {selectedProduct && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="card" style={{ padding: 20 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "var(--text-muted)",
                          letterSpacing: "0.05em",
                          marginBottom: 10,
                        }}
                      >
                        RECAPITULATIF PRODUIT SÉLECTIONNÉ
                      </div>

                      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.title}
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 8,
                            objectFit: "cover",
                            background: "#F8FAFC",
                            border: "1px solid var(--border-light)",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "var(--navy-dark)",
                              lineHeight: 1.3,
                              marginBottom: 4,
                            }}
                          >
                            {selectedProduct.title}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--orange-primary)", fontWeight: 800 }}>
                            {selectedProduct.price.toLocaleString()} FCFA / un.
                          </div>
                        </div>
                      </div>

                      {/* DETAILED COST BREAKDOWN */}
                      <div
                        style={{
                          background: "var(--bg-main)",
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          marginBottom: 14,
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>
                            Marchandise ({quantity} × {unitPrice.toLocaleString()})
                          </span>
                          <span style={{ fontWeight: 800 }}>{productCost.toLocaleString()} FCFA</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>
                            Frais gestion CargoLink (5%)
                          </span>
                          <span style={{ fontWeight: 800 }}>{serviceFee.toLocaleString()} FCFA</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>
                            Transport ({formData.shippingMode === "sea" ? "Maritime" : "Aérien"})
                          </span>
                          <span style={{ fontWeight: 800 }}>
                            {estimatedShippingFee.toLocaleString()} FCFA
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            borderTop: "1px solid var(--border-light)",
                            paddingTop: 8,
                            marginTop: 4,
                            fontSize: 13,
                          }}
                        >
                          <span style={{ fontWeight: 900, color: "var(--navy-dark)" }}>
                            Total Estimé :
                          </span>
                          <span style={{ fontWeight: 900, color: "var(--orange-primary)" }}>
                            {totalEstimatedAmount.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                        * Le prix final inclura la vérification usine et l'inspection de conformité avant expédition.
                      </div>
                    </div>

                    {/* GUARANTEE BOX */}
                    <div
                      className="card"
                      style={{
                        padding: 16,
                        background: "#ECFDF5",
                        border: "1px solid #6EE7B7",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <ShieldCheck style={{ width: 24, color: "#059669", flexShrink: 0 }} />
                      <div style={{ fontSize: 12, color: "#065F46" }}>
                        <strong>Garantie CargoLink :</strong> Protection des fonds jusqu'à réception de la marchandise à destination.
                      </div>
                    </div>
                  </div>
                )}
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
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Chargement du formulaire de devis...
        </div>
      }
    >
      <QuoteRequestContent />
    </Suspense>
  );
}
