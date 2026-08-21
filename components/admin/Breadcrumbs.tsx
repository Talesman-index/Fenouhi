"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  admin: "Dashboard Admin",
  users: "Utilisateurs",
  quotes: "Devis Logistiques",
  orders: "Commandes",
  shipments: "Expéditions & Suivi",
  payments: "Paiements & Reçus",
  suppliers: "Fournisseurs & Partenaires",
  disputes: "Litiges & Support",
  notifications: "Notifications",
  analytics: "Statistiques & Analytics",
  content: "Gestion du Contenu",
  settings: "Paramètres Plateforme",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1) return null;

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16, flexWrap: "wrap" }}>
      <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--navy-dark)", fontWeight: 700 }}>
        <Home style={{ width: 14, height: 14 }} /> Dashboard
      </Link>

      {pathSegments.slice(1).map((segment, idx) => {
        const url = `/admin/${pathSegments.slice(1, idx + 2).join("/")}`;
        const isLast = idx === pathSegments.length - 2;
        const label = ROUTE_LABELS[segment] || segment.toUpperCase();

        return (
          <React.Fragment key={url}>
            <ChevronRight style={{ width: 12, height: 12, color: "var(--text-muted)" }} />
            {isLast ? (
              <span style={{ color: "var(--orange-primary)", fontWeight: 600 }}>{label}</span>
            ) : (
              <Link href={url} style={{ color: "var(--navy-dark)", fontWeight: 700 }}>
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
