"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { z } from "zod";
import { 
  UserPlus, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, 
  ShieldCheck, Eye, EyeOff, User, Mail, Phone, MapPin, Building, 
  Lock, Check, Sparkles, Package, Shield, Store, Briefcase, Building2
} from "lucide-react";
import type { AccountType } from "@/types/supabase";

// Validation schemas per step
const step1Schema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  accountType: z.enum(["individual", "reseller", "business"] as const),
});

const step2Schema = z.object({
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(6, "Numéro WhatsApp invalide (min 6 chiffres)"),
  country: z.string().min(2, "Veuillez sélectionner votre pays"),
  city: z.string().min(2, "Veuillez préciser votre ville"),
});

const step3Schema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function SignUpPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    accountType: "individual" as AccountType,
    email: "",
    phone: "",
    country: "Bénin",
    city: "Cotonou",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setLoading(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        setLoading(false);
        setServerError(`Erreur ${provider === "google" ? "Google" : "Facebook"} : ${error.message}`);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setLoading(false);
      setServerError(err.message || "Une erreur est survenue lors de l'initialisation OAuth.");
    }
  };

  // Validate step 1 and move to step 2
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const res = step1Schema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      accountType: formData.accountType,
    });

    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[issue.path[0] as string] = issue.message;
      });
      setErrors(errs);
      return;
    }
    setCurrentStep(2);
  };

  // Validate step 2 and move to step 3
  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const res = step2Schema.safeParse({
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
    });

    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[issue.path[0] as string] = issue.message;
      });
      setErrors(errs);
      return;
    }
    setCurrentStep(3);
  };

  // Final submission on Step 3
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const res = step3Schema.safeParse({
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms: formData.acceptTerms,
    });

    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[issue.path[0] as string] = issue.message;
      });
      setErrors(errs);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          account_type: formData.accountType,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setServerError(error.message);
    } else if (signUpData.session) {
      // Auto-confirm enabled or session active: direct redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } else {
      // Confirmation link sent
      router.push(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
    }
  };

  return (
    <div style={{ padding: "50px 0 80px", background: "var(--bg-main)", minHeight: "calc(100vh - 200px)" }}>
      <div className="container" style={{ maxWidth: 620, margin: "0 auto" }}>
        
        {/* LOGO BRANDING */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Logo href="/" size={42} />
        </div>

        {/* MAIN STEPPER CARD */}
        <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "36px 32px", border: "1px solid #E2E8F0", boxShadow: "0 12px 48px rgba(15, 23, 42, 0.06)" }}>
          
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={{ background: "var(--orange-light)", color: "var(--orange-hover)", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 9999, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              CRÉATION DE COMPTE CLIENT SÉCURISÉE
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: "10px 0 4px" }}>
              Inscrivez-vous sur CargoLink
            </h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Accédez aux prix usines Chine et au suivi en temps réel.
            </p>
          </div>

          {/* STEP INDICATOR BAR */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
              
              {/* CONNECTING LINE */}
              <div style={{ position: "absolute", top: 18, left: 30, right: 30, height: 3, background: "#E2E8F0", zIndex: 1 }} />
              <div 
                style={{ 
                  position: "absolute", 
                  top: 18, 
                  left: 30, 
                  width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "85%", 
                  height: 3, 
                  background: "#165491", 
                  transition: "width 0.4s ease", 
                  zIndex: 2 
                }} 
              />

              {/* STEP 1 PILL */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 3 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: currentStep >= 1 ? "#165491" : "#E2E8F0",
                  color: currentStep >= 1 ? "#FFF" : "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: currentStep === 1 ? "0 0 0 4px rgba(22,84,145,0.2)" : "none",
                  transition: "all 0.3s ease"
                }}>
                  {currentStep > 1 ? <Check style={{ width: 18 }} /> : "1"}
                </div>
                <span style={{ fontSize: 11, fontWeight: currentStep === 1 ? 900 : 700, color: currentStep === 1 ? "#165491" : "#64748B", marginTop: 6 }}>
                  Type & Identité
                </span>
              </div>

              {/* STEP 2 PILL */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 3 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: currentStep >= 2 ? "#165491" : "#E2E8F0",
                  color: currentStep >= 2 ? "#FFF" : "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: currentStep === 2 ? "0 0 0 4px rgba(22,84,145,0.2)" : "none",
                  transition: "all 0.3s ease"
                }}>
                  {currentStep > 2 ? <Check style={{ width: 18 }} /> : "2"}
                </div>
                <span style={{ fontSize: 11, fontWeight: currentStep === 2 ? 900 : 700, color: currentStep === 2 ? "#165491" : "#64748B", marginTop: 6 }}>
                  Coordonnées
                </span>
              </div>

              {/* STEP 3 PILL */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 3 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: currentStep === 3 ? "#165491" : "#E2E8F0",
                  color: currentStep === 3 ? "#FFF" : "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: currentStep === 3 ? "0 0 0 4px rgba(22,84,145,0.2)" : "none",
                  transition: "all 0.3s ease"
                }}>
                  3
                </div>
                <span style={{ fontSize: 11, fontWeight: currentStep === 3 ? 900 : 700, color: currentStep === 3 ? "#165491" : "#64748B", marginTop: 6 }}>
                  Sécurité
                </span>
              </div>

            </div>
          </div>

          {serverError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
              <AlertCircle style={{ width: 18, flexShrink: 0 }} />
              <div style={{ fontWeight: 600 }}>{serverError}</div>
            </div>
          )}

          {/* ==================== STEP 1: PROFIL & IDENTITÉ ==================== */}
          {currentStep === 1 && (
            <div>
              {/* SOCIAL SIGNUP BUTTONS */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11.5px 16px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    background: "#FFFFFF",
                    color: "#0F172A",
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  S'inscrire rapidement avec Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11.5px 16px",
                    borderRadius: 12,
                    border: "none",
                    background: "#1877F2",
                    color: "#FFFFFF",
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <svg width="18" height="18" fill="#FFFFFF" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  S'inscrire rapidement avec Facebook
                </button>
              </div>

              {/* DIVIDER */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>OU INSCRIPTION MANUELLE</span>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>

              <form onSubmit={handleNextFromStep1} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 10, letterSpacing: "0.5px" }}>
                  1. SÉLECTIONNEZ VOTRE PROFIL DE COMMANDE *
                </label>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  {/* OPTION 1: PARTICULIER */}
                  <div 
                    onClick={() => setFormData({ ...formData, accountType: "individual" })}
                    style={{
                      border: formData.accountType === "individual" ? "2px solid #165491" : "1.5px solid #E2E8F0",
                      background: formData.accountType === "individual" ? "#F0F9FF" : "#F8FAFC",
                      padding: 16,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: formData.accountType === "individual" ? "#165491" : "#E2E8F0", color: formData.accountType === "individual" ? "#FFF" : "#64748B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User style={{ width: 20 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Particulier / Acheteur Individuel</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Achats personnels, colis de groupe et livraison express.</div>
                    </div>
                    {formData.accountType === "individual" && <CheckCircle2 style={{ width: 20, color: "#165491" }} />}
                  </div>

                  {/* OPTION 2: REVENDEUR PME */}
                  <div 
                    onClick={() => setFormData({ ...formData, accountType: "reseller" })}
                    style={{
                      border: formData.accountType === "reseller" ? "2px solid #165491" : "1.5px solid #E2E8F0",
                      background: formData.accountType === "reseller" ? "#F0F9FF" : "#F8FAFC",
                      padding: 16,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: formData.accountType === "reseller" ? "#165491" : "#E2E8F0", color: formData.accountType === "reseller" ? "#FFF" : "#64748B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Store style={{ width: 20 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Revendeur & Boutique PME</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Tarifs de gros 1688/Taobao et gestion d'approvisionnement.</div>
                    </div>
                    {formData.accountType === "reseller" && <CheckCircle2 style={{ width: 20, color: "#165491" }} />}
                  </div>
                </div>
              </div>

              {/* PRÉNOM & NOM */}
              <div className="form-row-2col" style={{ marginTop: 4 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                    PRÉNOM *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean Marc"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: errors.firstName ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F172A",
                      outline: "none",
                      background: "#F8FAFC"
                    }}
                  />
                  {errors.firstName && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.firstName}</span>}
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                    NOM *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Koffi"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: errors.lastName ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F172A",
                      outline: "none",
                      background: "#F8FAFC"
                    }}
                  />
                  {errors.lastName && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.lastName}</span>}
                </div>
              </div>

              {/* NEXT BUTTON STEP 1 */}
              <button
                type="submit"
                className="btn btn-orange"
                style={{
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 10
                }}
              >
                Continuer (Étape 2 / 3) <ArrowRight style={{ width: 18 }} />
              </button>
            </form>
          </div>
          )}

          {/* ==================== STEP 2: CONTACT & LOGISTIQUE ==================== */}
          {currentStep === 2 && (
            <form onSubmit={handleNextFromStep2} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* EMAIL */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                  ADRESSE EMAIL PROFESSIONNELLE OU PERSONNELLE *
                </label>
                <div style={{ position: "relative" }}>
                  <Mail style={{ width: 17, height: 17, position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input
                    type="email"
                    required
                    placeholder="exemple@domaine.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      borderRadius: 12,
                      border: errors.email ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F172A",
                      outline: "none",
                      background: "#F8FAFC"
                    }}
                  />
                </div>
                {errors.email && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.email}</span>}
              </div>

              {/* TÉLÉPHONE WHATSAPP */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                  NUMÉRO WHATSAPP (POUR LE SUIVI DE VOS EXPÉDITIONS) *
                </label>
                <div style={{ position: "relative" }}>
                  <Phone style={{ width: 17, height: 17, position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input
                    type="text"
                    required
                    placeholder="+229 97 00 11 22"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      borderRadius: 12,
                      border: errors.phone ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F172A",
                      outline: "none",
                      background: "#F8FAFC"
                    }}
                  />
                </div>
                {errors.phone && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.phone}</span>}
              </div>

              {/* PAYS DE LIVRAISON & VILLE */}
              <div className="form-row-2col">
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                    PAYS DE LIVRAISON *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1.5px solid #E2E8F0",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0F172A",
                      outline: "none",
                      background: "#F8FAFC"
                    }}
                  >
                    <option value="Bénin">Bénin (Cotonou)</option>
                    <option value="Togo">Togo (Lomé)</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire (Abidjan)</option>
                    <option value="Sénégal">Sénégal (Dakar)</option>
                    <option value="Cameroun">Cameroun (Douala)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                    VILLE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cotonou"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: errors.city ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F172A",
                      outline: "none",
                      background: "#F8FAFC"
                    }}
                  />
                  {errors.city && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.city}</span>}
                </div>
              </div>

              {/* NAVIGATION STEP 2 BUTTONS */}
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 12,
                    border: "1.5px solid #CBD5E1",
                    background: "#FFF",
                    color: "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer"
                  }}
                >
                  <ArrowLeft style={{ width: 16 }} /> Retour
                </button>

                <button
                  type="submit"
                  className="btn btn-orange"
                  style={{
                    flex: 1,
                    padding: 14,
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  Continuer (Étape 3 / 3) <ArrowRight style={{ width: 18 }} />
                </button>
              </div>
            </form>
          )}

          {/* ==================== STEP 3: SÉCURITÉ & VALIDATION ==================== */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmitFinal} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* MOT DE PASSE & CONFIRMATION */}
              <div className="form-row-2col">
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                    MOT DE PASSE (MIN. 8 CARACTÈRES) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 38px 12px 14px",
                        borderRadius: 12,
                        border: errors.password ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0F172A",
                        outline: "none",
                        background: "#F8FAFC"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                    >
                      {showPassword ? <EyeOff style={{ width: 16 }} /> : <Eye style={{ width: 16 }} />}
                    </button>
                  </div>
                  {errors.password && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.password}</span>}
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                    CONFIRMER MOT DE PASSE *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: errors.confirmPassword ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F172A",
                      outline: "none",
                      background: "#F8FAFC"
                    }}
                  />
                  {errors.confirmPassword && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* REASSURANCE BADGES */}
              <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck style={{ width: 14, height: 14, color: "var(--orange-primary)" }} /> Vos garanties CargoLink Africa :
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#64748B", display: "flex", flexDirection: "column", gap: 4 }}>
                  <li>Cryptage de sécurité SSL 256-bit de vos données d'expédition.</li>
                  <li>Suivi en temps réel de vos conteneurs & colis aériens.</li>
                  <li>Assistance client personnalisée 7j/7 en Afrique & Chine.</li>
                </ul>
              </div>

              {/* CONDITIONS GENERALES CHECKBOX */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--orange-primary)", cursor: "pointer" }}
                />
                <label htmlFor="acceptTerms" style={{ fontSize: 12.5, color: "#64748B", cursor: "pointer", lineHeight: 1.4 }}>
                  J'accepte les <Link href="/terms" target="_blank" style={{ color: "#0F172A", fontWeight: 600, textDecoration: "none" }}>Conditions Générales</Link> et la <Link href="/privacy-policy" target="_blank" style={{ color: "#0F172A", fontWeight: 600, textDecoration: "none" }}>Politique de Confidentialité</Link> de CargoLink.
                </label>
              </div>
              {errors.acceptTerms && <span style={{ color: "#EF4444", fontSize: 11 }}>{errors.acceptTerms}</span>}

              {/* NAVIGATION STEP 3 BUTTONS */}
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 12,
                    border: "1.5px solid #CBD5E1",
                    background: "#FFF",
                    color: "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer"
                  }}
                >
                  <ArrowLeft style={{ width: 16 }} /> Retour
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-orange"
                  style={{
                    flex: 1,
                    padding: 14,
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  <UserPlus style={{ width: 18 }} />
                  {loading ? "Création du compte..." : "Créer Mon Compte CargoLink 🎉"}
                </button>
              </div>
            </form>
          )}

          {/* SIGN IN LINK */}
          <div style={{ textAlign: "center", fontSize: 13.5, color: "#64748B", marginTop: 24, paddingTop: 20, borderTop: "1px solid #F1F5F9" }}>
            Vous avez déjà un compte ?{" "}
            <Link href="/auth/login" style={{ color: "#0F172A", fontWeight: 700, textDecoration: "none" }}>
              Se connecter <ArrowRight style={{ width: 14, display: "inline" }} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
