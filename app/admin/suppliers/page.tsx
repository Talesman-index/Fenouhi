"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  Building2,
  Plus,
  Search,
  Star,
  Globe,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit,
  UserX,
  UserCheck
} from "lucide-react";
import type { Supplier, PartnerType } from "@/types/supabase";

export default function SuppliersManagementPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [partnerType, setPartnerType] = useState<PartnerType>("supplier");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Chine");
  const [services, setServices] = useState("");
  const [reliabilityRating, setReliabilityRating] = useState(5.0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [typeFilter]);

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from("suppliers").select("*").order("created_at", { ascending: false });

      if (typeFilter !== "all") query = query.eq("partner_type", typeFilter);

      const { data, error } = await query;
      if (error) throw error;
      setSuppliers(data as Supplier[]);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingSupplier(null);
    setName("");
    setPartnerType("supplier");
    setCompanyName("");
    setEmail("");
    setPhone("");
    setCountry("Chine");
    setServices("");
    setReliabilityRating(5.0);
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setPartnerType(supplier.partner_type);
    setCompanyName(supplier.company_name || "");
    setEmail(supplier.email || "");
    setPhone(supplier.phone || "");
    setCountry(supplier.country || "Chine");
    setServices(supplier.services || "");
    setReliabilityRating(supplier.reliability_rating || 5.0);
    setNotes(supplier.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const supabase = createClient();

      const payload = {
        name,
        partner_type: partnerType,
        company_name: companyName || null,
        email: email || null,
        phone: phone || null,
        country,
        services: services || null,
        reliability_rating: reliabilityRating,
        notes: notes || null,
        status: "active"
      };

      if (editingSupplier) {
        const { error } = await supabase.from("suppliers").update(payload).eq("id", editingSupplier.id);
        if (error) throw error;

        await logAdminAction({
          action: "UPDATE_SUPPLIER",
          entityType: "suppliers",
          entityId: editingSupplier.id,
          newValues: payload
        });
      } else {
        const { error } = await supabase.from("suppliers").insert(payload);
        if (error) throw error;

        await logAdminAction({
          action: "CREATE_SUPPLIER",
          entityType: "suppliers",
          newValues: payload
        });
      }

      fetchSuppliers();
      setIsModalOpen(false);
      alert("Partenaire enregistré avec succès !");
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    const nextStatus = supplier.status === "suspended" ? "active" : "suspended";
    if (!confirm(`Voulez-vous ${nextStatus === "suspended" ? "suspendre" : "réactiver"} le partenaire ${supplier.name} ?`)) return;

    try {
      const supabase = createClient();
      await supabase.from("suppliers").update({ status: nextStatus }).eq("id", supplier.id);

      await logAdminAction({
        action: nextStatus === "suspended" ? "SUSPEND_SUPPLIER" : "REACTIVATE_SUPPLIER",
        entityType: "suppliers",
        entityId: supplier.id,
        newValues: { status: nextStatus }
      });

      fetchSuppliers();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const nameMatch = s.name.toLowerCase();
    const companyMatch = (s.company_name || "").toLowerCase();
    const q = search.toLowerCase();
    return nameMatch.includes(q) || companyMatch.includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            RÉSEAU LOGISTIQUE CHINE & AFRIQUE
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Fournisseurs & Partenaires
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-orange"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}
        >
          <Plus style={{ width: 16 }} /> Ajouter un Partenaire
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par nom de partenaire, entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Type Partenaire :</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Tous les types</option>
            <option value="supplier">Fournisseur Usine Chine</option>
            <option value="shipping_partner">Partenaire Transitaire</option>
            <option value="agent">Agent d'Achat Chine</option>
            <option value="warehouse">Entrepôt Logistique</option>
          </select>
        </div>
      </div>

      {/* SUPPLIERS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {loading ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            Chargement des partenaires logistiques...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            Aucun partenaire enregistré.
          </div>
        ) : (
          filteredSuppliers.map((s) => (
            <div key={s.id} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", fontSize: 10 }}>
                    {s.partner_type.toUpperCase()}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 2, color: "#D97706", fontWeight: 800, fontSize: 13 }}>
                    <Star style={{ width: 14, fill: "#D97706" }} /> {s.reliability_rating || 5.0}
                  </div>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--navy-dark)", margin: "0 0 4px" }}>
                  {s.name}
                </h3>
                {s.company_name && (
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>
                    Entreprise : {s.company_name}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "var(--navy-dark)", marginBottom: 16 }}>
                  {s.email && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail style={{ width: 14, color: "var(--text-muted)" }} /> {s.email}</div>}
                  {s.phone && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone style={{ width: 14, color: "var(--text-muted)" }} /> {s.phone}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Globe style={{ width: 14, color: "var(--text-muted)" }} /> {s.country}</div>
                </div>

                {s.services && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg-main)", padding: 8, borderRadius: "var(--radius-sm)", marginBottom: 16 }}>
                    Services : {s.services}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                <StatusBadge status={s.status} type="user_status" />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEditModal(s)} className="btn" style={{ padding: "6px 10px", fontSize: 12, background: "var(--blue-light)", color: "var(--blue-primary)" }}>
                    <Edit style={{ width: 14 }} /> Éditer
                  </button>
                  <button onClick={() => handleToggleStatus(s)} className="btn" style={{ padding: "6px 10px", fontSize: 12, background: s.status === "suspended" ? "#DCFCE7" : "#FEE2E2", color: s.status === "suspended" ? "#166534" : "#991B1B" }}>
                    {s.status === "suspended" ? <UserCheck style={{ width: 14 }} /> : <UserX style={{ width: 14 }} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 550, width: "100%", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
                {editingSupplier ? "Modifier le Partenaire" : "Ajouter un Partenaire"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSaveSupplier} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>NOM DE L'AGENT OU ENTERPRISE</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>TYPE DE PARTENAIRE</label>
                  <select value={partnerType} onChange={(e) => setPartnerType(e.target.value as PartnerType)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}>
                    <option value="supplier">Fournisseur Usine Chine</option>
                    <option value="shipping_partner">Partenaire Transitaire</option>
                    <option value="agent">Agent d'Achat Chine</option>
                    <option value="warehouse">Entrepôt Logistique</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>PAYS D'ORIGINE</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>EMAIL</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>TÉLÉPHONE / WHATSAPP</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>SERVICES PROPOSÉS</label>
                <input type="text" value={services} onChange={(e) => setServices(e.target.value)} placeholder="Ex: Inspection qualité, stockage gratuit 15 jours..." style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ padding: "8px 16px" }}>Annuler</button>
                <button type="submit" disabled={saving} className="btn btn-orange" style={{ padding: "8px 20px" }}>{saving ? "Sauvegarde..." : "Enregistrer Partenaire"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
