"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "votre adresse email";

  return (
    <div style={{ padding: "60px 0", background: "var(--bg-main)" }}>
      <div className="container" style={{ maxWidth: 540, margin: "0 auto" }}>
        
        {/* BRAND LOGO */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Logo href="/" size={42} />
        </div>

        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--orange-light)", color: "var(--orange-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <Mail style={{ width: 32 }} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 12 }}>
            Vérifiez Votre Boîte Mail !
          </h1>

          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
            Un lien de confirmation sécurisé a été envoyé à <strong>{email}</strong>.<br />
            Veuillez cliquer sur le lien dans l'email pour activer votre compte et accéder à votre espace logistique.
          </p>

          <div style={{ background: "var(--bg-main)", padding: 16, borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            Vous n'avez rien reçu ? Vérifiez votre dossier de courriers indésirables (Spam) ou attendez quelques instants.
          </div>

          <Link href="/auth/login" className="btn btn-orange" style={{ padding: "12px 24px", width: "100%" }}>
            Aller à la Page de Connexion <ArrowRight style={{ width: 16 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 50 }}>Chargement...</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
