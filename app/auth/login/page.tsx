"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
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

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setErrorMsg(
        authError.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : authError.message
      );
      return;
    }

    // Fetch user profile role from Supabase to determine exact route
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
  };

  return (
    <div style={{ padding: "50px 0", background: "var(--bg-main)" }}>
      <div className="container" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="card admin-card" style={{ padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span className="badge" style={{ background: "var(--navy-dark)", color: "#FFF", marginBottom: 8 }}>
              ESPACE MEMBRE & LOGISTIQUE
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0" }}>
              Connexion à CargoLink
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Saisissez vos identifiants pour suivre vos colis ou gérer vos devis.
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
              <AlertCircle style={{ width: 18, flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                ADRESSE EMAIL *
              </label>
              <input
                type="email"
                required
                placeholder="exemple@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", margin: 0 }}>
                  MOT DE PASSE *
                </label>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: "var(--orange-primary)", fontWeight: 700 }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff style={{ width: 16 }} /> : <Eye style={{ width: 16 }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-orange admin-btn"
              style={{ padding: 14, fontSize: 15, marginTop: 6 }}
            >
              {loading ? "Vérification..." : "Se Connecter Mon Espace"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>
              Vous n'avez pas encore de compte ?{" "}
              <Link href="/auth/sign-up" style={{ color: "var(--navy-dark)", fontWeight: 800 }}>
                Créer un compte
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 50 }}>Chargement...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
