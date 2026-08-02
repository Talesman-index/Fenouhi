"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
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

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setLoading(false);
        if (authError.message.includes("Email not confirmed")) {
          setErrorMsg("Veuillez confirmer votre adresse e-mail en cliquant sur le lien reçu dans votre boîte de réception avant de vous connecter.");
        } else if (authError.message.includes("Invalid login credentials")) {
          setErrorMsg("Email ou mot de passe incorrect. Vérifiez également l'orthographe de votre adresse e-mail.");
        } else {
          setErrorMsg(authError.message || "Une erreur est survenue lors de la connexion.");
        }
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

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo || "/dashboard")}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setLoading(false);
        setErrorMsg(`Connexion ${provider === "google" ? "Google" : "Facebook"} : ${error.message}`);
        return;
      }

      if (data?.url) {
        const checkRes = await fetch(data.url);
        if (!checkRes.ok) {
          const errData = await checkRes.json().catch(() => ({}));
          setLoading(false);
          const providerName = provider === "google" ? "Google" : "Facebook";
          if (errData?.msg?.includes("not enabled") || errData?.code === 400) {
            setErrorMsg(`La connexion via ${providerName} n'est pas encore activée sur le projet Supabase. Veuillez activer le fournisseur ${providerName} dans le Dashboard Supabase (Authentication > Providers).`);
          } else {
            setErrorMsg(errData?.msg || `La connexion via ${providerName} est temporairement indisponible.`);
          }
          return;
        }

        window.location.href = data.url;
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Une erreur est survenue lors de l'initialisation OAuth.");
    }
  };

  return (
    <div style={{ padding: "60px 0 80px", background: "var(--bg-main)", minHeight: "calc(100vh - 200px)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: 480, margin: "0 auto" }}>
        
        {/* BRAND LOGO BADGE */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Logo href="/" size={44} />
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

          {/* SOCIAL LOGIN BUTTONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                border: "1.5px solid #E2E8F0",
                background: "#FFFFFF",
                color: "#0F172A",
                fontSize: 13.5,
                fontWeight: 800,
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
              Continuer avec Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                border: "none",
                background: "#1877F2",
                color: "#FFFFFF",
                fontSize: 13.5,
                fontWeight: 800,
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
              Continuer avec Facebook
            </button>
          </div>

          {/* DIVIDER */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>OU AVEC EMAIL</span>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          </div>

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
