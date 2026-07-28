"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  Search,
  Filter,
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
  const [countryFilter, setCountryFilter] = useState<string>("all");

  // Selected User Modal States
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole>("customer");
  const [internalNotes, setInternalNotes] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, countryFilter]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

      if (roleFilter !== "all") query = query.eq("role", roleFilter);
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (countryFilter !== "all") query = query.eq("country", countryFilter);

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data as Profile[]);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter users by client-side search query
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();
    const q = search.toLowerCase();
    return fullName.includes(q) || email.includes(q) || phone.includes(q);
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // User Actions
  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const supabase = createClient();
      const oldUser = users.find((u) => u.id === userId);
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      await logAdminAction({
        action: "UPDATE_USER_ROLE",
        entityType: "profiles",
        entityId: userId,
        oldValues: { role: oldUser?.role },
        newValues: { role: newRole }
      });

      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) setSelectedUser((prev) => prev ? { ...prev, role: newRole } : null);
      alert("Rôle mis à jour avec succès !");
    } catch (err: any) {
      alert("Erreur lors de la mise à jour du rôle : " + err.message);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus: UserStatus = currentStatus === "suspended" ? "active" : "suspended";
    const confirmMsg = currentStatus === "suspended"
      ? "Voulez-vous réactiver ce compte utilisateur ?"
      : "Voulez-vous suspendre cet utilisateur ? Il ne pourra plus accéder aux services CargoLink.";

    if (!confirm(confirmMsg)) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ status: nextStatus })
        .eq("id", userId);

      if (error) throw error;

      await logAdminAction({
        action: nextStatus === "suspended" ? "SUSPEND_USER" : "REACTIVATE_USER",
        entityType: "profiles",
        entityId: userId,
        newValues: { status: nextStatus }
      });

      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: nextStatus } : u));
      if (selectedUser?.id === userId) setSelectedUser((prev) => prev ? { ...prev, status: nextStatus } : null);
    } catch (err: any) {
      alert("Erreur lors du changement de statut : " + err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    try {
      setSavingNote(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ notes: internalNotes })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, notes: internalNotes } : u));
      setSelectedUser((prev) => prev ? { ...prev, notes: internalNotes } : null);
      alert("Note interne enregistrée !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            RÉPERTOIRE CLIENTS & AGENTS
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Gestion des Utilisateurs
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          Total : <strong>{filteredUsers.length}</strong> comptes inscrits
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        {/* SEARCH INPUT */}
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

        {/* ROLE FILTER */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Rôle :</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Tous les rôles</option>
            <option value="customer">Client (Customer)</option>
            <option value="agent">Agent Logistique</option>
            <option value="partner">Partenaire Transitaire</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        {/* STATUS FILTER */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Statut :</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="pending_verification">En attente</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Utilisateur</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Contact</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Localisation</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Rôle</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Inscription</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement du répertoire utilisateurs...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun utilisateur ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    {/* NAME & AVATAR */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--navy-dark)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                          {(u.first_name?.[0] || "U").toUpperCase()}{(u.last_name?.[0] || "").toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>{u.first_name} {u.last_name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.account_type || "individual"}</div>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, color: "var(--navy-dark)" }}>{u.email}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.phone || "Non renseigné"}</div>
                    </td>

                    {/* LOCATION */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{u.city || "Cotonou"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.country || "Bénin"}</div>
                    </td>

                    {/* ROLE */}
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={u.role} type="user_role" />
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={u.status || "active"} type="user_status" />
                    </td>

                    {/* DATE */}
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 12 }}>
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setEditingRole(u.role);
                            setInternalNotes(u.notes || "");
                            setIsDetailModalOpen(true);
                          }}
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, background: "var(--blue-light)", color: "var(--blue-primary)" }}
                          title="Fiche profil complète"
                        >
                          <Eye style={{ width: 14 }} /> Détails
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u.id, u.status || "active")}
                          className="btn"
                          style={{
                            padding: "6px 10px",
                            fontSize: 12,
                            background: u.status === "suspended" ? "#DCFCE7" : "#FEE2E2",
                            color: u.status === "suspended" ? "#166534" : "#991B1B"
                          }}
                          title={u.status === "suspended" ? "Réactiver compte" : "Suspendre compte"}
                        >
                          {u.status === "suspended" ? <UserCheck style={{ width: 14 }} /> : <UserX style={{ width: 14 }} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div style={{ padding: 16, background: "var(--bg-main)", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)" }}>
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            Page {page} sur {totalPages}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="btn"
              style={{ padding: "6px 12px", fontSize: 12, opacity: page === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft style={{ width: 14 }} /> Précédent
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="btn"
              style={{ padding: "6px 12px", fontSize: 12, opacity: page >= totalPages ? 0.5 : 1 }}
            >
              Suivant <ChevronRight style={{ width: 14 }} />
            </button>
          </div>
        </div>
      </div>

      {/* USER DETAIL MODAL */}
      {isDetailModalOpen && selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)" }}>FICHE CLIENT ADMIN</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0 0" }}>
                  {selectedUser.first_name} {selectedUser.last_name}
                </h2>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>EMAIL</label>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy-dark)" }}>{selectedUser.email}</div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>TÉLÉPHONE</label>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy-dark)" }}>{selectedUser.phone || "Non spécifié"}</div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>PAYS & VILLE</label>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy-dark)" }}>{selectedUser.city || "Cotonou"}, {selectedUser.country || "Bénin"}</div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>STATUT COMPTE</label>
                <div><StatusBadge status={selectedUser.status || "active"} type="user_status" /></div>
              </div>
            </div>

            {/* EDIT ROLE SECTION */}
            <div style={{ background: "var(--bg-main)", padding: 16, borderRadius: "var(--radius-sm)", marginBottom: 20, border: "1px solid var(--border-light)" }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                MODIFIER LE RÔLE DE L'UTILISATEUR :
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <select
                  value={editingRole}
                  onChange={(e) => setEditingRole(e.target.value as UserRole)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
                >
                  <option value="customer">Client (Customer)</option>
                  <option value="agent">Agent Logistique</option>
                  <option value="partner">Partenaire Transitaire</option>
                  <option value="admin">Administrateur</option>
                </select>
                <button
                  onClick={() => handleUpdateRole(selectedUser.id, editingRole)}
                  className="btn btn-primary"
                  style={{ fontSize: 12 }}
                >
                  Changer Rôle
                </button>
              </div>
            </div>

            {/* INTERNAL ADMIN NOTES */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                NOTES INTERNES ADMINISTRATEUR :
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Remarques confidentielles sur ce client (ex: historique de paiement, statut de vérification pièces...)"
                style={{ width: "100%", height: 90, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNote}
                className="btn btn-orange"
                style={{ marginTop: 8, fontSize: 12 }}
              >
                {savingNote ? "Enregistrement..." : "Sauvegarder Note Internes"}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setIsDetailModalOpen(false)} className="btn" style={{ padding: "8px 16px" }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
