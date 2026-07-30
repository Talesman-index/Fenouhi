import React from "react";
import { requireAdmin } from "@/lib/admin/auth-guard";
import AdminShell from "@/components/admin/AdminShell";

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

  return <AdminShell profile={profile}>{children}</AdminShell>;
}

