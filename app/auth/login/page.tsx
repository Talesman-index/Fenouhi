"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, AlertCircle, Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import type { UserRole } from "@/types/supabase";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    urlError ? "Session expirée ou code d'authentification invalide." : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    
    try {
      const supabase = createClient();

      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // AUTO-PROVISION DEMO/TEST ACCOUNT IF NOT YET REGISTERED IN SUPABASE
      if (authError && (email === "demo@cargolink.africa" || authError.message === "Invalid login credentials")) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: "Client",
              last_name: "Démo",
              phone: "+229 97 00 00 00",
              country: "Bénin",
              city: "Cotonou",
              account_type: "individual",
              role: "customer"
            }
          }
        });

        if (!signUpError && signUpData.user) {
          authData = signUpData;
          authError = null;
        }
      }

      if (authError || email.toLowerCase().trim() === "demo@cargolink.africa") {
        if (email.toLowerCase().trim() === "demo@cargolink.africa") {
          document.cookie = "client_demo_access=true; path=/; max-age=604800";
          setLoading(false);
          router.push("/dashboard?demo=true");
          router.refresh();
          return;
        }
        setLoading(false);
        setErrorMsg("Email ou mot de passe incorrect.");
        return;
      }

      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        const userRole: UserRole = profile?.role || "customer";

        setLoading(false);

        if (redirectTo) {
          router.push(redirectTo);
        } else if (["agent", "logistics", "admin", "super_admin"].includes(userRole)) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <div style={{ padding: "60px 0 80px", background: "var(--bg-main)", minHeight: "calc(100vh - 200px)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: 480, margin: "0 auto" }}>
        
        {/* BRAND LOGO BADGE */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 12 }}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 44, height: 44 }}>
              <rect width="40" height="40" rx="10" fill="#0F172A"/>
              <path d="M20 8L31 29H24.5L20 20L15.5 29H9L20 8Z" fill="#165491"/>
              <circle cx="20" cy="14" r="3" fill="#FFF"/>
            </svg>
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", display: "block", lineHeight: 1 }}>CargoLink</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#165491", letterSpacing: "0.5px" }}>LOGISTIQUE CHINE - AFRIQUE</span>
            </div>
          </Link>
        </div>

        {/* LOGIN CARD */}
        <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "36px 32px", border: "1px solid #E2E8F0", boxShadow: "0 10px 40px rgba(15, 23, 42, 0.05)" }}>
          
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              Connexion à Votre Espace
            </h1>
            <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, lineHeight: 1.4 }}>
              Accédez à vos commandes, vos devis et au suivi logistique Guangzhou ➔ Afrique.
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
              <AlertCircle style={{ width: 18, flexShrink: 0 }} />
              <div style={{ fontWeight: 600 }}>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* EMAIL FIELD */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: "#0F172A", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>
                ADRESSE EMAIL *
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ width: 17, height: 17, position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0F172A",
                    outline: "none",
                    background: "#F8FAFC",
                    transition: "border 0.2s ease"
                  }}
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "0.5px" }}>
                  MOT DE PASSE *
                </label>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: "var(--orange-primary)", fontWeight: 800, textDecoration: "none" }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock style={{ width: 17, height: 17, position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 42px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0F172A",
                    outline: "none",
                    background: "#F8FAFC",
                    transition: "border 0.2s ease"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 2 }}
                >
                  {showPassword ? <EyeOff style={{ width: 18 }} /> : <Eye style={{ width: 18 }} />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-orange"
              style={{
                padding: 14,
                fontSize: 15,
                fontWeight: 900,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              <LogIn style={{ width: 18 }} />
              {loading ? "Vérification en cours..." : "Se Connecter À Mon Espace"}
            </button>

            {/* SIGN UP REDIRECT */}
            <div style={{ textAlign: "center", fontSize: 13.5, color: "#64748B", marginTop: 8 }}>
              Vous n'avez pas encore de compte ?{" "}
              <Link href="/auth/sign-up" style={{ color: "#0F172A", fontWeight: 900, textDecoration: "none" }}>
                Créer un compte <ArrowRight style={{ width: 14, display: "inline" }} />
              </Link>
            </div>

            {/* QUICK DEMO LOGIN HELPER */}
            <div style={{ marginTop: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "12px 14px", borderRadius: 12, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0F172A" }}>
                💡 Accès rapide de démonstration :
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    document.cookie = "client_demo_access=true; path=/; max-age=604800";
                    setEmail("demo@cargolink.africa");
                    setPassword("CargoLink2026!");
                    router.push("/dashboard?demo=true");
                  }}
                  style={{ flex: 1, minWidth: 140, background: "#165491", border: "none", borderRadius: 9999, padding: "8px 12px", fontSize: 11.5, fontWeight: 900, color: "#FFFFFF", cursor: "pointer" }}
                >
                  🚀 Espace Client Démo
                </button>

                <Link
                  href="/admin?demo=true"
                  style={{ flex: 1, minWidth: 140, background: "var(--navy-dark)", border: "none", borderRadius: 9999, padding: "8px 12px", fontSize: 11.5, fontWeight: 900, color: "#FFFFFF", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  🔑 Espace Admin Démo
                </Link>
              </div>
            </div>

          </form>

          {/* TRUST BADGE */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, color: "#64748B", fontWeight: 700 }}>
            <ShieldCheck style={{ width: 16, color: "#165491" }} />
            Connexion SSL Sécurisée CargoLink Logistique
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60, fontWeight: 700, color: "#64748B" }}>Chargement...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
