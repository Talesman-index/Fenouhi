"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ padding: "50px 0", background: "var(--bg-main)" }}>
      <div className="container" style={{ maxWidth: 460, margin: "0 auto" }}>
        
        {/* BRAND LOGO */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Logo href="/" size={42} />
        </div>

        <div className="card admin-card" style={{ padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--orange-light)", color: "var(--orange-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <KeyRound style={{ width: 28 }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0" }}>
              Mot de Passe Oublié ?
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Saisissez votre email. Nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe.
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
              <AlertCircle style={{ width: 18, flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "var(--green-bg)", color: "var(--green-success)", padding: 16, borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 13.5, fontWeight: 700 }}>
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>. Cliquez sur le lien reçu pour réinitialiser votre accès.
              </div>
              <Link href="/auth/login" className="btn btn-primary" style={{ background: "rgba(15,23,42,0.1)", color: "var(--navy-dark)", width: "100%" }}>
                <ArrowLeft style={{ width: 16 }} /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  VOTRE ADRESSE EMAIL *
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-orange admin-btn"
                style={{ padding: 14, fontSize: 15 }}
              >
                {loading ? "Envoi du lien..." : "Envoyer le Lien de Récupération"}
              </button>

              <div style={{ textAlign: "center", marginTop: 8 }}>
                <Link href="/auth/login" style={{ fontSize: 13, color: "var(--navy-dark)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ArrowLeft style={{ width: 14 }} /> Annuler et retourner à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
