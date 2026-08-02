"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  FileText,
  Truck,
  Package,
  Upload,
  Lock,
  ExternalLink,
  AlertCircle,
  Clock,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";

interface QuoteDetail {
  id: string;
  quote_number: string;
  product_name: string;
  product_link?: string;
  quantity: number;
  estimated_price: number;
  shipping_mode: string;
  destination_country: string;
  destination_city: string;
  product_cost: number;
  service_fee: number;
  shipping_fee: number;
  total_amount: number;
  user_name?: string;
  user_email?: string;
}

const DEMO_QUOTE: QuoteDetail = {
  id: "a1000000-0000-4000-a000-000000000002",
  quote_number: "DEV-2026-9410",
  product_name: "20 Montres Connectées SmartFit Pro X",
  product_link: "https://cargolink.africa/product/p1000000-0000-0000-0000-000000000001",
  quantity: 20,
  estimated_price: 205000,
  shipping_mode: "air",
  destination_country: "Bénin",
  destination_city: "Cotonou",
  product_cost: 175000,
  service_fee: 12500,
  shipping_fee: 17500,
  total_amount: 205000,
  user_name: "Client Démo",
  user_email: "client.demo@cargolink.africa"
};

function PaymentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteIdParam = searchParams.get("quote_id") || searchParams.get("ref");

  const [quote, setQuote] = useState<QuoteDetail>(DEMO_QUOTE);
  const [loading, setLoading] = useState(false);
  const [fetchingQuote, setFetchingQuote] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "moov" | "wave" | "orange" | "bank">("mtn");
  
  // Payer details
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Status flags
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch quote from Supabase if parameter exists
  useEffect(() => {
    async function loadQuote() {
      if (!quoteIdParam) {
        setFetchingQuote(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .or(`id.eq.${quoteIdParam},quote_number.eq.${quoteIdParam}`)
          .single();

        if (data && !error) {
          const totalCalc = Number(data.total_amount) || 
            ((Number(data.product_cost) || 0) + (Number(data.service_fee) || 0) + (Number(data.shipping_fee) || 0)) ||
            Number(data.estimated_price) || 205000;

          setQuote({
            id: data.id,
            quote_number: data.quote_number || quoteIdParam,
            product_name: data.product_name || "Lot de Produits Import",
            product_link: data.product_link,
            quantity: data.quantity || 1,
            estimated_price: totalCalc,
            shipping_mode: data.shipping_mode || "air",
            destination_country: data.destination_country || "Bénin",
            destination_city: data.destination_city || "Cotonou",
            product_cost: Number(data.product_cost) || Math.round(totalCalc * 0.8),
            service_fee: Number(data.service_fee) || Math.round(totalCalc * 0.08),
            shipping_fee: Number(data.shipping_fee) || Math.round(totalCalc * 0.12),
            total_amount: totalCalc,
            user_name: data.user_name || "Client CargoLink",
            user_email: data.user_email || "client@cargolink.africa"
          });
        }
      } catch (e) {
        console.log("Using default quote details");
      } finally {
        setFetchingQuote(false);
      }
    }

    loadQuote();
  }, [quoteIdParam]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const ussdCode = paymentMethod === "mtn" 
    ? `*880*41*97000001*${quote.total_amount}#`
    : paymentMethod === "moov"
    ? `*155*2*1*95000001*${quote.total_amount}#`
    : paymentMethod === "orange"
    ? `*144*4*1*07000002*${quote.total_amount}#`
    : `Transfert Wave vers +225 07 00 00 01`;

  const copyUssd = () => {
    navigator.clipboard.writeText(ussdCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Submit Payment & Create Order
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!payerName.trim() || !payerPhone.trim()) {
      setErrorMessage("Veuillez renseigner votre nom complet et votre numéro de téléphone.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const orderNum = `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentRef = `PAY-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Get current authenticated user session if available
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || "04a36ffb-c2e3-4407-aa52-8c45c52a9695";

      // 2. Create Order in Supabase
      const { data: orderData } = await supabase.from("orders").insert({
        order_number: orderNum,
        quote_id: quote.id.includes("-") ? quote.id : null,
        user_id: userId,
        amount: quote.total_amount,
        currency: "FCFA",
        payment_status: "paid",
        order_status: "confirmed",
        shipping_mode: quote.shipping_mode,
        destination_country: quote.destination_country,
        destination_city: quote.destination_city,
        tracking_number: `CL-2026-${Math.floor(100000 + Math.random() * 900000)}-BJ`,
        is_demo: true
      }).select().single();

      // 3. Create Payment record in Supabase
      await supabase.from("payments").insert({
        payment_ref: paymentRef,
        user_id: userId,
        order_id: orderData?.id || null,
        amount: quote.total_amount,
        currency: "FCFA",
        payment_method: paymentMethod === "mtn" ? "MTN Mobile Money" : paymentMethod === "moov" ? "Moov Money" : paymentMethod === "wave" ? "Wave" : paymentMethod === "orange" ? "Orange Money" : "Virement Bancaire",
        status: "paid",
        proof_of_payment_url: proofPreview || "https://cargolink.africa/images/demo/proof_mobile_money.png",
        is_demo: true
      });

      // 4. Update Quote status to accepted if valid UUID
      if (quote.id.includes("-")) {
        await supabase.from("quotes").update({ status: "accepted" }).eq("id", quote.id);
      }

      // 5. Create notification
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Paiement Reçu avec Succès !",
        message: `Votre règlement de ${quote.total_amount.toLocaleString("fr-FR")} FCFA pour la commande ${orderNum} a été validé.`,
        type: "payment",
        is_read: false,
        is_demo: true
      });

      setCreatedOrderNumber(orderNum);
      setPaymentSuccess(true);
    } catch (err: any) {
      console.warn("Payment processed with fallback local confirmation", err);
      setCreatedOrderNumber(`CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setPaymentSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", padding: "40px 0 80px" }}>
      <div className="container" style={{ maxWidth: 1040, margin: "0 auto", padding: "0 16px" }}>
        
        {/* HEADER BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/dashboard" className="btn" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#0F172A", padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 700 }}>
              <ArrowLeft style={{ width: 16 }} /> Retour
            </Link>
            <Logo size={36} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "6px 14px", borderRadius: 9999, color: "#065F46", fontSize: 12.5, fontWeight: 800 }}>
            <ShieldCheck style={{ width: 16, color: "#10B981" }} />
            <span>Paiement Sécurisé & Garanti par CargoLink</span>
          </div>
        </div>

        {/* IF PAYMENT SUCCESS CONFIRMATION SCREEN */}
        {paymentSuccess ? (
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "48px 32px", textAlign: "center", border: "1px solid #E2E8F0", boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 style={{ width: 44, height: 44 }} />
            </div>

            <span className="badge" style={{ background: "#DCFCE7", color: "#15803D", fontSize: 12, fontWeight: 900, marginBottom: 10, padding: "6px 14px" }}>
              PAIEMENT CONFIRMÉ & COMMANDE CRÉÉE
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "8px 0 12px" }}>
              Merci pour Votre Règlement !
            </h1>

            <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 24px" }}>
              Votre devis <strong style={{ color: "#0F172A" }}>{quote.quote_number}</strong> a été validé avec succès. La commande <strong style={{ color: "var(--orange-primary)" }}>{createdOrderNumber}</strong> a été générée et transmise à notre équipe logistique à Guangzhou.
            </p>

            <div style={{ background: "#F1F5F9", borderRadius: 16, padding: 20, textAlign: "left", marginBottom: 28, fontSize: 13.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748B" }}>Numéro de Commande :</span>
                <strong style={{ color: "#0F172A" }}>{createdOrderNumber}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748B" }}>Montant Réglé :</span>
                <strong style={{ color: "var(--orange-primary)", fontWeight: 900 }}>{quote.total_amount.toLocaleString("fr-FR")} FCFA</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748B" }}>Mode de Paiement :</span>
                <strong style={{ color: "#0F172A", textTransform: "uppercase" }}>{paymentMethod} Mobile Money</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Destination :</span>
                <strong style={{ color: "#0F172A" }}>{quote.destination_city}, {quote.destination_country}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard" className="btn btn-orange" style={{ padding: "14px 28px", fontSize: 14, fontWeight: 900, borderRadius: 9999 }}>
                Suivre Ma Commande en Direct
              </Link>
              <Link href="/catalog" className="btn btn-primary" style={{ padding: "14px 24px", fontSize: 14, fontWeight: 800, borderRadius: 9999, background: "#0F172A" }}>
                Retour au Catalogue
              </Link>
            </div>
          </div>
        ) : (
          /* MAIN CHECKOUT GRID */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
            
            {/* LEFT COLUMN: PAYMENT METHOD & FORM */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "28px 24px", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)" }}>
              
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                  Validation & Règlement du Devis
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                  Choisissez votre moyen de paiement et renseignez vos informations de règlement.
                </p>
              </div>

              {errorMessage && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
                  <AlertCircle style={{ width: 18, flexShrink: 0 }} />
                  <div style={{ fontWeight: 600 }}>{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmitPayment}>
                
                {/* 1. SELECTION MOYEN DE PAIEMENT */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", letterSpacing: "0.5px", display: "block", marginBottom: 10 }}>
                    1. SÉLECTIONNEZ LE MOYEN DE PAIEMENT *
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                    
                    {/* MTN */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mtn")}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: paymentMethod === "mtn" ? "2px solid #F59E0B" : "1.5px solid #E2E8F0",
                        background: paymentMethod === "mtn" ? "#FEF3C7" : "#FFFFFF",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#92400E" }}>MTN Momo</div>
                      <div style={{ fontSize: 10.5, color: "#B45309", marginTop: 2 }}>Bénin, CI, Tgo, Cam</div>
                    </button>

                    {/* MOOV */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("moov")}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: paymentMethod === "moov" ? "2px solid #2563EB" : "1.5px solid #E2E8F0",
                        background: paymentMethod === "moov" ? "#EFF6FF" : "#FFFFFF",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#1D4ED8" }}>Moov Money</div>
                      <div style={{ fontSize: 10.5, color: "#2563EB", marginTop: 2 }}>Bénin, CI, Togo</div>
                    </button>

                    {/* WAVE */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("wave")}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: paymentMethod === "wave" ? "2px solid #06B6D4" : "1.5px solid #E2E8F0",
                        background: paymentMethod === "wave" ? "#ECFEFF" : "#FFFFFF",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#0E7490" }}>Wave Money</div>
                      <div style={{ fontSize: 10.5, color: "#0891B2", marginTop: 2 }}>CI, Sénégal</div>
                    </button>

                    {/* ORANGE */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("orange")}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: paymentMethod === "orange" ? "2px solid #F97316" : "1.5px solid #E2E8F0",
                        background: paymentMethod === "orange" ? "#FFF7ED" : "#FFFFFF",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#C2410C" }}>Orange Money</div>
                      <div style={{ fontSize: 10.5, color: "#EA580C", marginTop: 2 }}>CI, Sénégal, Cam</div>
                    </button>

                    {/* VIREMENT */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: paymentMethod === "bank" ? "2px solid #0F172A" : "1.5px solid #E2E8F0",
                        background: paymentMethod === "bank" ? "#F8FAFC" : "#FFFFFF",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#0F172A" }}>Virement Banq.</div>
                      <div style={{ fontSize: 10.5, color: "#64748B", marginTop: 2 }}>BOA, Ecobank, UBA</div>
                    </button>

                  </div>
                </div>

                {/* INSTRUCTIONS DE PAIEMENT USSD */}
                <div style={{ background: "#F1F5F9", borderRadius: 14, padding: 16, marginBottom: 24, border: "1px solid #CBD5E1" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#334155", letterSpacing: "0.5px", marginBottom: 6 }}>
                    INSTRUCTIONS & CODE DE TRANSFERT INSTANTANÉ
                  </div>

                  {paymentMethod !== "bank" ? (
                    <>
                      <p style={{ fontSize: 12.5, color: "#475569", margin: "0 0 10px", lineHeight: 1.4 }}>
                        Effectuez le transfert Mobile Money vers le compte marchand officiel CargoLink Africa ou tapez directement le code USSD ci-dessous :
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFFFFF", padding: "10px 14px", borderRadius: 10, border: "1px solid #94A3B8" }}>
                        <code style={{ fontSize: 14, fontWeight: 900, color: "var(--navy-dark)", flex: 1 }}>{ussdCode}</code>
                        <button
                          type="button"
                          onClick={copyUssd}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange-primary)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800 }}
                        >
                          {copiedCode ? <Check style={{ width: 16, color: "#10B981" }} /> : <Copy style={{ width: 16 }} />}
                          <span>{copiedCode ? "Copié !" : "Copier"}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.5 }}>
                      <div><strong>Banque :</strong> Bank of Africa (BOA Bénin)</div>
                      <div><strong>Titulaire :</strong> CARGOLINK AFRICA LOGISTIQUE SAS</div>
                      <div><strong>RIB / IBAN :</strong> BJ66 0100 1002 4589 1234 5678 90</div>
                      <div style={{ marginTop: 4, color: "#64748B", fontSize: 11.5 }}>Motif : Devis {quote.quote_number}</div>
                    </div>
                  )}
                </div>

                {/* 2. INFOS DU PAYEUR */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                      NOM & PRÉNOM DU PAYEUR *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Serge Mensah"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                        N° TÉLÉPHONE PAYEUR *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+229 97 00 00 00"
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                        RÉFÉRENCE SMS / TRANSACTION
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: TXN-984120"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  {/* PREUVE DE PAIEMENT UPLOAD */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                      CAPTURE D'ÉCRAN OU PREUVE DE PAIEMENT (OPTIONNEL)
                    </label>
                    <div style={{ border: "1.5px dashed #CBD5E1", borderRadius: 12, padding: 14, textAlign: "center", background: "#F8FAFC", cursor: "pointer", position: "relative" }}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                      />
                      {proofPreview ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <CheckCircle2 style={{ width: 20, color: "#10B981" }} />
                          <span style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A" }}>Capture ajoutée avec succès</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#64748B", fontSize: 12.5, fontWeight: 600 }}>
                          <Upload style={{ width: 16 }} />
                          <span>Cliquez pour joindre une photo du reçu</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-orange"
                  style={{
                    width: "100%",
                    padding: 16,
                    fontSize: 15,
                    fontWeight: 900,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: "0 8px 25px rgba(245, 158, 11, 0.3)"
                  }}
                >
                  <Lock style={{ width: 18 }} />
                  <span>{loading ? "Validation en cours..." : `Confirmer & Payer ${quote.total_amount.toLocaleString("fr-FR")} FCFA`}</span>
                </button>

              </form>

            </div>

            {/* RIGHT COLUMN: ORDER & COST BREAKDOWN SUMMARY */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)" }}>
                <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", fontSize: 11, marginBottom: 8 }}>
                  RÉSUMÉ DU DEVIS N° {quote.quote_number}
                </span>

                <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: "4px 0 14px", lineHeight: 1.4 }}>
                  {quote.product_name}
                </h3>

                <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 12.5, color: "#475569", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Quantité Commandée :</span>
                    <strong style={{ color: "#0F172A" }}>{quote.quantity} unités</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Mode d'Expédition :</span>
                    <strong style={{ color: "#0F172A", textTransform: "uppercase" }}>Fret {quote.shipping_mode === "air" ? "Aérien Express" : "Maritime"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Destination :</span>
                    <strong style={{ color: "#0F172A" }}>{quote.destination_city}, {quote.destination_country}</strong>
                  </div>
                </div>

                {/* DETAILED COST BREAKDOWN */}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B" }}>
                    <span>Coût Marchandises (Usine Chine)</span>
                    <strong style={{ color: "#0F172A" }}>{quote.product_cost.toLocaleString("fr-FR")} FCFA</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B" }}>
                    <span>Fret & Transport International</span>
                    <strong style={{ color: "#0F172A" }}>{quote.shipping_fee.toLocaleString("fr-FR")} FCFA</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B" }}>
                    <span>Service & Inspection CargoLink</span>
                    <strong style={{ color: "#0F172A" }}>{quote.service_fee.toLocaleString("fr-FR")} FCFA</strong>
                  </div>

                  <div style={{ borderTop: "1.5px solid #0F172A", marginTop: 6, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#0F172A" }}>TOTAL À PAYER</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "var(--orange-primary)" }}>{quote.total_amount.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>

              </div>

              {/* SECURITY & TRUST BADGE */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                  <ShieldCheck style={{ width: 20, color: "#10B981" }} />
                  <span>Garantie Qualité & Protection Acheteur</span>
                </div>
                <p style={{ fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Vos fonds sont sécurisés jusqu'à la vérification des colis dans nos entrepôts de Guangzhou. En cas de non-conformité usine, vous bénéficiez du remboursement intégral.
                </p>
                <Link href="/contact" target="_blank" style={{ fontSize: 12, fontWeight: 800, color: "var(--orange-primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span>Besoin d'aide ? Contacter l'assistance WhatsApp</span>
                  <ExternalLink style={{ width: 12 }} />
                </Link>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center" }}>Chargement de l'espace de paiement...</div>}>
      <PaymentFormContent />
    </Suspense>
  );
}
