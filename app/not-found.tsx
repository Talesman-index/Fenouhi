import Link from "next/link";
import Logo from "@/components/Logo";
import { PackageX, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
        background: "var(--bg-main)",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Logo href="/" size={44} />
      </div>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: "#FEE2E2",
          color: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <PackageX style={{ width: 44, height: 44 }} />
      </div>

      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "var(--navy-dark)",
          margin: "0 0 10px",
        }}
      >
        404 — Page Introuvable
      </h1>

      <p
        style={{
          fontSize: 15,
          color: "var(--text-muted)",
          maxWidth: 440,
          lineHeight: 1.6,
          margin: "0 0 28px",
        }}
      >
        La page ou le produit que vous recherchez n&apos;existe pas ou a été déplacé.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          className="btn btn-orange"
          style={{
            padding: "12px 24px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Home style={{ width: 18 }} />
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/catalog"
          className="btn"
          style={{
            padding: "12px 24px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "2px solid var(--navy-dark)",
            color: "var(--navy-dark)",
            background: "transparent",
          }}
        >
          <ArrowLeft style={{ width: 18 }} />
          Voir le Catalogue
        </Link>
      </div>
    </div>
  );
}
