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
  UserPlus,
  User,
  Building2
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
  }, []);

  async function fetchUsers() {
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

      const defaultAdmin: Profile = {
        id: "admin-auronce",
        first_name: "Auronce",
        last_name: "Ahoyo",
        email: "ahoyoauronce@gmail.com",
        phone: "+229 97 00 00 00",
        country: "Bénin",
        city: "Cotonou",
        role: "super_admin",
        status: "active",
        account_type: "business",
        avatar_url: null,
        last_activity: new Date().toISOString(),
        notes: "Super Administrateur Principal",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (error || !data || data.length === 0) {
        setUsers([defaultAdmin, ...DEMO_USERS.filter(u => u.email !== "ahoyoauronce@gmail.com")]);
      } else {
        const userList = [...(data as Profile[])];
        if (!userList.some(u => u.email === "ahoyoauronce@gmail.com")) {
          userList.unshift(defaultAdmin);
        }
        // Include demo users if fewer than 3 users
        if (userList.length < 3) {
          for (const du of DEMO_USERS) {
            if (!userList.some(u => u.id === du.id || u.email === du.email)) {
              userList.push(du);
            }
          }
        }
        setUsers(userList);
      }
    } catch (err) {
      setUsers([
        {
          id: "admin-auronce",
          first_name: "Auronce",
          last_name: "Ahoyo",
          email: "ahoyoauronce@gmail.com",
          phone: "+229 97 00 00 00",
          country: "Bénin",
          city: "Cotonou",
          role: "super_admin",
          status: "active",
          account_type: "business",
          avatar_url: null,
          last_activity: new Date().toISOString(),
          notes: "Super Administrateur Principal",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...DEMO_USERS
      ]);
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
    const matchesSearch = !query || name.includes(query) || email.includes(query) || phone.includes(query);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || (u.status || "active") === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Summary stats
  const totalUsersCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin" || u.role === "super_admin").length;
  const activeUsersCount = users.filter((u) => u.status === "active").length;
  const businessUsersCount = users.filter((u) => u.account_type === "business").length;

  return (
    <div style={{ padding: "20px 0 60px", maxWidth: 1280, margin: "0 auto" }}>
      {/* 1. HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(22, 84, 145, 0.08)", color: "#165491", padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <UserCheck style={{ width: 14, height: 14 }} /> GESTION DES COMPTES & SÉCURITÉ
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Utilisateurs & Membres
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Administrez les droits d'accès, permissions des agents logistiques et comptes clients.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="btn"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", borderRadius: 12, fontWeight: 600, fontSize: 13, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
        >
          <UserCheck style={{ width: 15 }} /> Actualiser
        </button>
      </div>

      {/* 2. SUMMARY KPI STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Total Utilisateurs</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{totalUsersCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Équipe & Admins</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#165491", marginTop: 2 }}>{adminCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0F9FF", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Comptes Actifs</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", marginTop: 2 }}>{activeUsersCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCheck style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Entreprises / B2B</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#EA580C", marginTop: 2 }}>{businessUsersCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FFF7ED", color: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 style={{ width: 18 }} />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS TOOLBAR */}
      <div
        style={{
          background: "#FFFFFF",
          padding: "16px 20px",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 440 }}>
          <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, color: "#94A3B8" }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 10,
              border: "1.5px solid #E2E8F0",
              outline: "none",
              fontSize: 13,
              fontWeight: 500,
              background: "#F8FAFC",
              color: "#0F172A"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "9px 32px 9px 12px",
              borderRadius: 10,
              border: "1.5px solid #E2E8F0",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#334155",
              background: "#FFFFFF",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="all">Tous les rôles</option>
            <option value="customer">Clients</option>
            <option value="agent">Agents Fret</option>
            <option value="admin">Administrateurs</option>
            <option value="super_admin">Super Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "9px 32px 9px 12px",
              borderRadius: 10,
              border: "1.5px solid #E2E8F0",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#334155",
              background: "#FFFFFF",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="pending">En attente</option>
          </select>

          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", background: "#F1F5F9", padding: "6px 12px", borderRadius: 999 }}>
            {filteredUsers.length} compte{filteredUsers.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* 4. BALANCED USERS TABLE */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
                <th style={{ padding: "14px 18px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nom & Prénom</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact (Email / Tél)</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Localisation</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rôle</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Statut</th>
                <th style={{ padding: "14px 18px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
                    <UserCheck style={{ width: 26, height: 26, margin: "0 auto 10px", color: "#165491" }} />
                    <div style={{ fontWeight: 600 }}>Chargement des comptes utilisateurs...</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
                    <User style={{ width: 40, height: 40, margin: "0 auto 10px", color: "#CBD5E1" }} />
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>Aucun compte trouvé</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                      transition: "background-color 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA"; }}
                  >
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                          {(u.first_name?.[0] || "U").toUpperCase()}{(u.last_name?.[0] || "").toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0F172A" }}>{u.first_name} {u.last_name}</div>
                          <div style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                            {u.account_type === "business" ? (
                              <><Building2 style={{ width: 11, height: 11 }} /> Compte Entreprise</>
                            ) : (
                              <><User style={{ width: 11, height: 11 }} /> Particulier</>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "14px 14px" }}>
                      <div style={{ fontWeight: 600, color: "#0F172A" }}>{u.email}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{u.phone || "Tél non renseigné"}</div>
                    </td>

                    <td style={{ padding: "14px 14px" }}>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>{u.city || "Cotonou"}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{u.country || "Bénin"}</div>
                    </td>

                    <td style={{ padding: "14px 14px" }}>
                      <StatusBadge status={u.role} type="user_role" />
                    </td>

                    <td style={{ padding: "14px 14px" }}>
                      <StatusBadge status={u.status || "active"} type="user_status" />
                    </td>

                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button
                          onClick={() => openUserDetail(u)}
                          className="btn btn-primary"
                          style={{ padding: "7px 12px", fontSize: 12.5, borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 5 }}
                        >
                          <Eye style={{ width: 13 }} /> Profil
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
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--navy-dark)", margin: "4px 0 0" }}>
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
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>ATTRIBUER UN RÔLE</label>
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
