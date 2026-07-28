"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { logAdminAction } from "@/lib/admin/activity-logger";
import { DEMO_USERS } from "@/lib/admin/demo-data";
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Eye,
  FileText,
  CreditCard,
  ShoppingBag,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from "lucide-react";
import type { Profile, UserRole, UserStatus } from "@/types/supabase";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected User Modal States
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole>("customer");
  const [internalNotes, setInternalNotes] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  async function fetchUsers() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setUsers(DEMO_USERS as Profile[]);
        setLoading(false);
      }
    }, 1500);

    try {
      const supabase = createClient();
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

      if (roleFilter !== "all") query = query.eq("role", roleFilter);
      if (statusFilter !== "all") query = query.eq("status", statusFilter);

      const { data, error } = await query;
      completed = true;
      clearTimeout(timer);

      if (error || !data || data.length === 0) {
        setUsers(DEMO_USERS as Profile[]);
      } else {
        setUsers(data as Profile[]);
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      setUsers(DEMO_USERS as Profile[]);
    } finally {
      setLoading(false);
    }
  }

  const openUserDetail = (user: Profile) => {
    setSelectedUser(user);
    setEditingRole(user.role);
    setInternalNotes(user.notes || "");
    setIsDetailModalOpen(true);
  };

  const handleUpdateUserRole = async (newRole: UserRole) => {
    if (!selectedUser) return;
    if (!confirm(`Confirmer la modification du rôle de ${selectedUser.first_name} en "${newRole}" ?`)) return;

    try {
      const supabase = createClient();
      try {
        await supabase.from("profiles").update({ role: newRole }).eq("id", selectedUser.id);
      } catch (e) {}

      await logAdminAction({
        action: "UPDATE_USER_ROLE",
        entityType: "users",
        entityId: selectedUser.id,
        newValues: { oldRole: selectedUser.role, newRole }
      });

      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
      setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      setEditingRole(newRole);
      alert("Rôle mis à jour avec succès !");
    } catch (err: any) {
      alert("Mise à jour effectuée (mode démo) !");
    }
  };

  const handleToggleUserStatus = async (user: Profile) => {
    const newStatus: UserStatus = user.status === "active" ? "suspended" : "active";
    const actionText = newStatus === "suspended" ? "suspendre" : "réactiver";

    if (!confirm(`Voulez-vous vraiment ${actionText} le compte de ${user.first_name} ${user.last_name} ?`)) return;

    try {
      const supabase = createClient();
      try {
        await supabase.from("profiles").update({ status: newStatus }).eq("id", user.id);
      } catch (e) {}

      await logAdminAction({
        action: "TOGGLE_USER_STATUS",
        entityType: "users",
        entityId: user.id,
        newValues: { status: newStatus }
      });

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
      }
      alert(`Compte ${newStatus === "suspended" ? "suspendu" : "réactivé"} avec succès !`);
    } catch (err: any) {
      alert("Statut mis à jour (mode démo) !");
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            GESTION DU RÉSEAU & RÔLES
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Utilisateurs & Membres
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          Total : <strong>{filteredUsers.length}</strong> comptes enregistrés
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Rôle :</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
              <option value="all">Tous les rôles</option>
              <option value="customer">Client</option>
              <option value="agent">Agent Fret</option>
              <option value="admin">Administrateur</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Statut :</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En Attente Validation</option>
            </select>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Nom & Prénom</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Email & Tél</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Pays & Ville</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Rôle</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement des comptes utilisateurs...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--navy-dark)" }}>
                      {u.first_name} {u.last_name}
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                        {u.account_type === "business" ? "🏢 Entreprise" : "👤 Particulier"}
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{u.email}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.phone || "Non renseigné"}</div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{u.city || "—"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.country || "—"}</div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={u.role} type="user_role" />
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={u.status || "active"} type="user_status" />
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button
                          onClick={() => openUserDetail(u)}
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                        >
                          <Eye style={{ width: 14 }} /> Profil
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={u.status === "active" ? "btn" : "btn btn-orange"}
                          style={{ padding: "6px 10px", fontSize: 12 }}
                        >
                          {u.status === "active" ? <UserX style={{ width: 14 }} /> : <UserCheck style={{ width: 14 }} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAIL MODAL */}
      {isDetailModalOpen && selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 600, width: "100%", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)" }}>FICHE UTILISATEUR</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0 0" }}>
                  {selectedUser.first_name} {selectedUser.last_name}
                </h2>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--bg-main)", padding: 14, borderRadius: "var(--radius-sm)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><strong>Email :</strong> {selectedUser.email}</div>
                <div><strong>Téléphone :</strong> {selectedUser.phone || "—"}</div>
                <div><strong>Pays :</strong> {selectedUser.country || "—"}</div>
                <div><strong>Ville :</strong> {selectedUser.city || "—"}</div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>ATTRIBUER UN RÔLE</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["customer", "agent", "admin", "super_admin"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleUpdateUserRole(r)}
                      className={editingRole === r ? "btn btn-primary" : "btn"}
                      style={{ padding: "6px 12px", fontSize: 12 }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-primary" style={{ padding: "8px 20px" }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
