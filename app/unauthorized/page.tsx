"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const isSuspended = reason === "suspended";

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--bg-main)"
    }}>
      <div style={{ marginBottom: 24 }}>
        <Logo href="/" size={44} />
      </div>

      <div className="card" style={{
        maxWidth: 520,
        width: "100%",
        textAlign: "center",
        padding: "40px 32px"
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#FEF2F2",
          color: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px"
        }}>
          {isSuspended ? <Lock style={{ width: 38, height: 38 }} /> : <ShieldAlert style={{ width: 38, height: 38 }} />}
        </div>

        <span className="badge" style={{ background: "#FEE2E2", color: "#991B1B", marginBottom: 12 }}>
          {isSuspended ? "COMPTE SUSPENDU / INACTIF" : "ACCÈS RESTREINT (403)"}
        </span>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--navy-dark)", margin: "8px 0 12px" }}>
          {isSuspended ? "Compte Suspendu ou Inactif" : "Accès Non Autorisé"}
        </h1>

        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 28 }}>
          {isSuspended
            ? "Votre compte d'accès CargoLink Africa est temporairement suspendu ou inactif. Veuillez contacter le support administratif pour plus de précisions."
            : "Vous n'avez pas les privilèges ou le rôle requis pour accéder à cette section de la plateforme. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur logistique."}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="btn" style={{ background: "var(--navy-dark)", color: "#FFF", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft style={{ width: 16 }} /> Espace Client
          </Link>
          <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Home style={{ width: 16 }} /> Accueil CargoLink
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60 }}>Chargement...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}
