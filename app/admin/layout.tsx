import React from "react";
import { requireAdmin } from "@/lib/admin/auth-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

export const metadata = {
  title: "Espace Administrateur — CargoLink Africa",
  description: "Plateforme de gestion logistique Chine-Afrique par CargoLink Africa",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication and role guard
  const { profile } = await requireAdmin();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", display: "flex", flexDirection: "column" }}>
      {/* STICKY TOP HEADER */}
      <AdminHeader profile={profile} />

      {/* MAIN CONTAINER */}
      <div className="container" style={{ flex: 1, padding: "24px 16px 40px", maxWidth: 1440 }}>
        <Breadcrumbs />

        <div className="admin-layout-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
          {/* DESKTOP SIDEBAR */}
          <div className="admin-desktop-sidebar">
            <AdminSidebar profile={profile} />
          </div>

          {/* MAIN CONTENT AREA */}
          <main style={{ minWidth: 0 }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
