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
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", display: "flex", flexDirection: "column", width: "100%" }}>
      {/* STICKY TOP ADMIN HEADER */}
      <AdminHeader profile={profile} />

      {/* FULL-WIDTH DASHBOARD CONTENT AREA */}
      <div style={{ flex: 1, padding: "20px 32px 40px", width: "100%", boxSizing: "border-box" }}>
        <Breadcrumbs />

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start", width: "100%" }}>
          {/* DESKTOP SIDEBAR */}
          <aside style={{ width: 260, position: "sticky", top: 80 }}>
            <AdminSidebar profile={profile} />
          </aside>

          {/* MAIN CONTENT AREA */}
          <main style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
