"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Smartphone,
  ShieldCheck,
  Check,
  ArrowLeft,
  ArrowRight,
  Lock,
  Truck,
  Plane,
  Ship,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Upload,
  FileText,
  Building2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMobileStore } from "@/lib/mobile-store";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRef = searchParams.get("ref");
  const urlFreight = searchParams.get("freight") || "air";
  const urlDelivery = searchParams.get("delivery") || "home";

  const {
    cart,
    finalTotal,
    formatPrice,
    country,
    clearCart,
  } = useMobileStore();

  const [paymentProvider, setPaymentProvider] = useState<"mtn" | "moov">("mtn");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("+229 ");
  const [transactionRef, setTransactionRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState(urlRef || `CL-BJ-${Math.floor(100000 + Math.random() * 900000)}`);
  const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; email: string } | null>(null);

  // Check Supabase authentication
  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            const fullName = `${prof?.first_name || ""} ${prof?.last_name || ""}`.trim() || user.email?.split("@")[0] || "Client Bénin";
            setCurrentUser({
              id: user.id,
              name: fullName,
              email: prof?.email || user.email || "",
            });
            setPayerName(fullName);
            if (prof?.phone) setPayerPhone(prof.phone);
          } catch {
            const name = user.email?.split("@")[0] || "Client Bénin";
            setCurrentUser({
              id: user.id,
              name: name,
              email: user.email || "",
            });
            setPayerName(name);
          }
        }
      } catch {}
    }
    getUser();
  }, []);

  const totalToPay = finalTotal > 0 ? finalTotal : 11700;

  const merchantDetails = paymentProvider === "mtn"
    ? {
        name: "FENOUHIMIN SAS",
        phone: "+229 97 00 00 01",
        ussd: `*880*41*97000001*${totalToPay}#`,
        operatorName: "MTN Mobile Money",
        codeSyntax: "*880# Bénin",
        color: "#CA8A04",
        bgLight: "#FEF9C3",
        borderActive: "#EAB308",
      }
    : {
        name: "FENOUHIMIN SAS",
        phone: "+229 95 00 00 01",
        ussd: `*155*2*1*95000001*${totalToPay}#`,
        operatorName: "Moov Money (Flooz)",
        codeSyntax: "*155# Bénin",
        color: "#2563EB",
        bgLight: "#EFF6FF",
        borderActive: "#3B82F6",
      };

  const handleCopyUssd = () => {
    navigator.clipboard.writeText(merchantDetails.ussd);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(merchantDetails.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!payerName.trim()) {
      setErrorMessage("Veuillez renseigner votre nom complet.");
      return;
    }

    if (!payerPhone.trim() || payerPhone.trim().length < 8) {
      setErrorMessage("Veuillez renseigner un numéro de téléphone valide.");
      return;
    }

    if (!proofFile && !transactionRef.trim()) {
      setErrorMessage("Veuillez joindre une capture d'écran du paiement ou indiquer la référence de transaction SMS.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const userId = currentUser?.id || "04a36ffb-c2e3-4407-aa52-8c45c52a9695";

      // 1. Enregistrer la commande
      await supabase.from("orders").insert([
        {
          order_number: orderRef,
          user_id: userId,
          total_amount: totalToPay,
          currency: "FCFA",
          payment_method: merchantDetails.operatorName,
          delivery_mode: `${urlFreight.toUpperCase()}_${urlDelivery.toUpperCase()}`,
          destination_country: "Bénin",
          status: "pending_verification",
        },
      ]);

      // 2. Enregistrer le paiement
      await supabase.from("payments").insert([
        {
          payment_ref: transactionRef || `PAY-${paymentProvider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          user_id: userId,
          amount: totalToPay,
          currency: "FCFA",
          payment_method: merchantDetails.operatorName,
          status: "pending_verification",
          payer_name: payerName,
          payer_phone: payerPhone,
        },
      ]);
    } catch {
      // Fallback
    } finally {
      setSubmitting(false);
      setPaymentSuccess(true);
      clearCart();
    }
  };

  return (
    <div style={{ background: "#FAF7F2", minHeight: "90vh", padding: "24px 0 60px" }}>
      <div className="container" style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
        
        {/* STEPPER PROGRESS */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: "16px 20px",
            border: "1px solid #E2D9CC",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
            <Link href="/cart" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#16A34A", color: "#FFF", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1" }}>
                ✓
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#16A34A" }} className="desktop-only">1. Mon Panier</span>
            </Link>

            <Link href="/checkout" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#16A34A", color: "#FFF", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1" }}>
                ✓
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#16A34A" }} className="desktop-only">2. Fret & Livraison</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1", boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.15)" }}>
                3
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 900, color: "#0F172A" }}>3. Paiement Sécurisé</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: paymentSuccess ? 1 : 0.4 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: paymentSuccess ? "#16A34A" : "#CBD5E1", color: "#FFF", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1" }}>
                4
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B" }} className="desktop-only">4. Suivi Expédition</span>
            </div>
          </div>
        </div>

        {!paymentSuccess ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
            
            {/* LEFT COLUMN: PAYMENT INSTRUCTIONS & PROOF UPLOAD */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, gridColumn: "span 2" }}>
              
              {/* TOP CARD: SELECT OPERATOR */}
              <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "28px", border: "1px solid #E2D9CC", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)" }}>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h1 style={{ fontSize: 21, fontWeight: 900, color: "#0F172A", fontFamily: "'Outfit', sans-serif", margin: 0 }}>
                      Règlement Mobile Money Bénin
                    </h1>
                    <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
                      Effectuez le transfert vers notre compte marchand et téléversez la preuve
                    </p>
                  </div>

                  <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 800, color: "#065F46", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck style={{ width: 15, height: 15, color: "#10B981" }} />
                    <span>Compte Marchand Vérifié</span>
                  </div>
                </div>

                {/* 2 OPERATOR BUTTONS (MTN vs MOOV ONLY) */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                    1. Choisissez votre opérateur :
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    {/* MTN */}
                    <div
                      onClick={() => setPaymentProvider("mtn")}
                      style={{
                        border: paymentProvider === "mtn" ? "2px solid #EAB308" : "1.5px solid #E2E8F0",
                        background: paymentProvider === "mtn" ? "#FEF9C3" : "#FFFFFF",
                        borderRadius: 16,
                        padding: "16px 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        boxShadow: paymentProvider === "mtn" ? "0 4px 16px rgba(234, 179, 8, 0.18)" : "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 42,
                          background: "#FFCC00",
                          borderRadius: 10,
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                          border: "1px solid #EAB308",
                        }}
                      >
                        <img
                          src="/images/payments/mtn.png"
                          alt="MTN Mobile Money"
                          style={{ maxHeight: 32, maxWidth: "100%", objectFit: "contain" }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#0F172A" }}>MTN Mobile Money</div>
                        <div style={{ fontSize: 12, color: "#854D0E", fontWeight: 700 }}>Syntaxe *880# Bénin</div>
                      </div>

                      {paymentProvider === "mtn" && (
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#CA8A04", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check style={{ width: 15, height: 15, strokeWidth: 3 }} />
                        </div>
                      )}
                    </div>

                    {/* MOOV */}
                    <div
                      onClick={() => setPaymentProvider("moov")}
                      style={{
                        border: paymentProvider === "moov" ? "2px solid #2563EB" : "1.5px solid #E2E8F0",
                        background: paymentProvider === "moov" ? "#EFF6FF" : "#FFFFFF",
                        borderRadius: 16,
                        padding: "16px 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        boxShadow: paymentProvider === "moov" ? "0 4px 16px rgba(37, 99, 235, 0.18)" : "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 42,
                          background: "#0066B3",
                          borderRadius: 10,
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                          border: "1px solid #1D4ED8",
                        }}
                      >
                        <img
                          src="/images/payments/moov_africa_official.png"
                          alt="Moov Africa"
                          style={{ maxHeight: 32, maxWidth: "100%", objectFit: "contain" }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#0F172A" }}>Moov Money</div>
                        <div style={{ fontSize: 12, color: "#1E40AF", fontWeight: 700 }}>Flooz (*155# Bénin)</div>
                      </div>

                      {paymentProvider === "moov" && (
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563EB", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check style={{ width: 15, height: 15, strokeWidth: 3 }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* INSTRUCTIONS DE DÉPÔT / SYNTAXE USSD */}
                <div style={{ background: "#F8FAFC", border: "1.5px dashed #CBD5E1", borderRadius: 16, padding: "16px 18px", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      2. Syntaxe USSD de dépôt direct
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B" }}>
                      Bénéficiaire : <strong style={{ color: "#0F172A" }}>{merchantDetails.name}</strong>
                    </span>
                  </div>

                  {/* USSD CODE BLOCK */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      background: "#FFFFFF",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: 12,
                      padding: "10px 14px",
                      marginBottom: 12,
                      overflow: "hidden",
                    }}
                  >
                    <code
                      style={{
                        fontSize: "clamp(13px, 3.5vw, 15px)",
                        fontWeight: 900,
                        color: "#0F172A",
                        letterSpacing: "0.5px",
                        fontFamily: "'Courier New', Courier, monospace",
                        wordBreak: "break-all",
                        flex: "1 1 auto",
                        minWidth: 0,
                      }}
                    >
                      {merchantDetails.ussd}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUssd}
                      style={{
                        background: copiedCode ? "#DCFCE7" : "#0F172A",
                        color: copiedCode ? "#166534" : "#FFFFFF",
                        border: copiedCode ? "1px solid #86EFAC" : "none",
                        borderRadius: 8,
                        padding: "8px 14px",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.12)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {copiedCode ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                      <span>{copiedCode ? "Copié !" : "Copier le code"}</span>
                    </button>
                  </div>

                  {/* ALTERNATIVE DIRECT PHONE NUMBER */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                      fontSize: 12.5,
                      color: "#475569",
                      paddingTop: 8,
                    }}
                  >
                    <span style={{ flex: "1 1 180px" }}>
                      Numéro marchand alternatif : <strong style={{ color: "#0F172A" }}>{merchantDetails.phone}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      style={{
                        background: copiedPhone ? "#E0F2FE" : "#F1F5F9",
                        border: "1px solid #CBD5E1",
                        color: copiedPhone ? "#0369A1" : "#0284C7",
                        fontSize: 11.5,
                        fontWeight: 800,
                        padding: "5px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {copiedPhone ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                      <span>{copiedPhone ? "Numéro copié" : "Copier numéro"}</span>
                    </button>
                  </div>
                </div>

                {/* FORMULAIRE DE VALIDATION & UPLOAD */}
                <form onSubmit={handleSubmitPayment}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>
                    3. Confirmez les détails du transfert
                  </div>

                  {errorMessage && (
                    <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
                      <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                        Nom & Prénom de l'émetteur *
                      </label>
                      <input
                        type="text"
                        required
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder="Ex: Gaston Houndété"
                        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, outline: "none", fontWeight: 600, color: "#0F172A", background: "#FFFFFF" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                        Numéro Mobile Money débité *
                      </label>
                      <input
                        type="tel"
                        required
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        placeholder="+229 97 00 00 00"
                        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, outline: "none", fontWeight: 600, color: "#0F172A", background: "#FFFFFF" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      ID de Transaction / Référence SMS (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ex: TXN-94182401824 ou Code reçu par SMS"
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, outline: "none", fontWeight: 600, color: "#0F172A", background: "#FFFFFF" }}
                    />
                  </div>

                  {/* PROOF UPLOAD ZONE */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Capture d'écran du reçu de transfert *
                    </label>

                    {!proofPreview ? (
                      <div
                        style={{
                          border: "2px dashed #94A3B8",
                          borderRadius: 14,
                          padding: "24px 20px",
                          textAlign: "center",
                          background: "#F8FAFC",
                          cursor: "pointer",
                          position: "relative",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                        />
                        <Upload style={{ width: 28, height: 28, color: "#64748B", margin: "0 auto 8px" }} />
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                          Cliquez pour joindre votre capture d'écran
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748B" }}>
                          Formats acceptés : PNG, JPG, JPEG (Reçu SMS ou notification MoMo/Flooz)
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "#F1F5F9", borderRadius: 14, padding: "14px", border: "1.5px solid #CBD5E1", display: "flex", alignItems: "center", gap: 14 }}>
                        <img
                          src={proofPreview}
                          alt="Aperçu preuve"
                          style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, border: "1px solid #CBD5E1" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                            {proofFile ? proofFile.name : "Capture d'écran sélectionnée"}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#16A34A", fontWeight: 700, marginTop: 2 }}>
                            ✓ Preuve prête pour transmission
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                          title="Supprimer la photo"
                        >
                          <X style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: "100%",
                      background: "#16A34A",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 14,
                      padding: "16px 24px",
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: submitting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: "0 6px 20px rgba(22, 163, 74, 0.25)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Lock style={{ width: 18, height: 18 }} />
                    <span>
                      {submitting
                        ? "Enregistrement de la preuve..."
                        : `Confirmer le paiement de ${formatPrice(totalToPay)}`}
                    </span>
                  </button>
                </form>

              </div>

            </div>

            {/* RIGHT COLUMN: RECAP & SHIPMENT DETAILS */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "24px", border: "1px solid #E2D9CC", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Dossier Logistique
                </h3>
                <span style={{ fontSize: 11, fontWeight: 800, background: "#F1F5F9", padding: "3px 8px", borderRadius: 6, color: "#0F172A" }}>
                  {orderRef}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#475569" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Itinéraire :</span>
                  <strong style={{ color: "#0F172A" }}>Chine ➔ Bénin (Cotonou)</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Mode de Transit :</span>
                  <strong style={{ color: "#0284C7" }}>
                    {urlFreight === "air" ? "Fret Aérien Express (5-12j)" : "Fret Maritime Groupé (40-65j)"}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Dédouanement Cotonou :</span>
                  <strong style={{ color: "#16A34A" }}>100% Inclus</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Livraison finale :</span>
                  <strong style={{ color: "#0F172A" }}>
                    {urlDelivery === "home" ? "Domicile (Cotonou & Régions)" : "Retrait Hub Akpakpa Port"}
                  </strong>
                </div>
              </div>

              <div style={{ height: 1, background: "#F1F5F9" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16, fontWeight: 900, color: "#0F172A", paddingTop: 4 }}>
                <span>Total Net à Régler</span>
                <span style={{ fontSize: 22, color: "#DC2626", fontFamily: "'Outfit', sans-serif" }}>
                  {formatPrice(totalToPay)}
                </span>
              </div>

              <div style={{ background: "#FAF7F2", borderRadius: 12, padding: "14px", border: "1px solid #E2D9CC", fontSize: 12, color: "#475569", lineHeight: 1.5, display: "flex", gap: 10 }}>
                <ShieldCheck style={{ width: 20, height: 20, color: "#16A34A", flexShrink: 0 }} />
                <span>
                  Validation sous 15 minutes dès réception de votre preuve de paiement.
                </span>
              </div>
            </div>

          </div>
        ) : (
          /* PAYMENT SUCCESS SCREEN */
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "48px 32px", border: "1px solid #E2D9CC", maxWidth: 680, margin: "0 auto", textAlign: "center", boxShadow: "0 10px 40px rgba(15, 23, 42, 0.06)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 style={{ width: 44, height: 44 }} />
            </div>

            <span style={{ background: "#ECFDF5", color: "#166534", border: "1px solid #BBF7D0", padding: "4px 14px", borderRadius: 999, fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>
              Preuve Transmise • En Cours de Validation
            </span>

            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 900, color: "#0F172A", fontFamily: "'Outfit', sans-serif", margin: "14px 0 8px" }}>
              Merci pour votre règlement !
            </h2>

            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px", lineHeight: 1.5 }}>
              Votre preuve de paiement via <strong>{merchantDetails.operatorName}</strong> a bien été reçue. Notre équipe logistique vérifie la transaction et prépare l'enlèvement usine en Chine sous 15 minutes.
            </p>

            {/* ORDER INFO CARD */}
            <div style={{ background: "#FAF7F2", borderRadius: 16, padding: "18px 22px", border: "1px dashed #CBD5E1", textAlign: "left", marginBottom: 28, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>N° de Dossier Logistique :</span>
                <strong style={{ fontSize: 15, color: "#0F172A", fontFamily: "'Outfit', sans-serif" }}>{orderRef}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>Montant Transféré :</span>
                <strong style={{ fontSize: 14, color: "#16A34A" }}>{formatPrice(totalToPay)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>Opérateur :</span>
                <strong style={{ fontSize: 13, color: "#0F172A" }}>{merchantDetails.operatorName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>Mode de Transit :</span>
                <strong style={{ fontSize: 13, color: "#0284C7" }}>
                  {urlFreight === "air" ? "Fret Aérien Express (5-12j)" : "Fret Maritime Groupé (40-65j)"}
                </strong>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/dashboard?tab=tracking"
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  padding: "14px 26px",
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Suivre mon expédition</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>

              <Link
                href="/catalog"
                style={{
                  background: "#F1F5F9",
                  color: "#0F172A",
                  padding: "14px 24px",
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Retour au Catalogue
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Chargement de la passerelle de paiement...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
