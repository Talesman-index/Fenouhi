"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  UserCheck,
  Building2,
  FileText,
  DollarSign,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Ban,
  Clock
} from "lucide-react";
import type { Order, OrderStatus, PaymentStatus, Profile, Supplier } from "@/types/supabase";

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Order Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit form state
  const [editingStatus, setEditingStatus] = useState<OrderStatus>("pending_payment");
  const [editingAgent, setEditingAgent] = useState<string>("");
  const [editingSupplier, setEditingSupplier] = useState<string>("");
  const [supplierRef, setSupplierRef] = useState<string>("");
  const [invoiceUrl, setInvoiceUrl] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrdersData();
  }, [statusFilter]);

  async function fetchOrdersData() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch Orders
      let query = supabase.from("orders").select("*, profile:profiles(*)").order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("order_status", statusFilter);

      const { data: ordersData, error } = await query;
      if (error) throw error;
      setOrders(ordersData as Order[]);

      // Fetch Agents
      const { data: agentsData } = await supabase.from("profiles").select("*").in("role", ["agent", "admin", "super_admin"]);
      if (agentsData) setAgents(agentsData as Profile[]);

      // Fetch Suppliers & Partners
      const { data: suppliersData } = await supabase.from("suppliers").select("*");
      if (suppliersData) setSuppliers(suppliersData as Supplier[]);

    } catch (err) {
      console.error("Error loading orders data:", err);
    } finally {
      setLoading(false);
    }
  }

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditingStatus(order.order_status);
    setEditingAgent(order.assigned_agent_id || "");
    setEditingSupplier(order.supplier_id || "");
    setSupplierRef(order.supplier_ref || "");
    setInvoiceUrl(order.invoice_url || "");
    setInternalNotes(order.internal_notes || "");
    setIsModalOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      setSaving(true);
      const supabase = createClient();

      const updatedFields = {
        order_status: editingStatus,
        assigned_agent_id: editingAgent || null,
        supplier_id: editingSupplier || null,
        supplier_ref: supplierRef || null,
        invoice_url: invoiceUrl || null,
        internal_notes: internalNotes || null,
      };

      const { error } = await supabase
        .from("orders")
        .update(updatedFields)
        .eq("id", selectedOrder.id);

      if (error) throw error;

      await logAdminAction({
        action: "UPDATE_ORDER_STATUS",
        entityType: "orders",
        entityId: selectedOrder.id,
        oldValues: { status: selectedOrder.order_status },
        newValues: updatedFields
      });

      setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, ...updatedFields } : o));
      setIsModalOpen(false);
      alert("Commande mise à jour avec succès !");
    } catch (err: any) {
      alert("Erreur lors de la mise à jour : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const num = o.order_number.toLowerCase();
    const client = (o.profile ? `${o.profile.first_name} ${o.profile.last_name}` : "").toLowerCase();
    const ref = (o.supplier_ref || "").toLowerCase();
    const query = search.toLowerCase();
    return num.includes(query) || client.includes(query) || ref.includes(query);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            SUIVI SUITE AUX COMMANDES ET TRANSIT
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Gestion des Commandes
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          Total : <strong>{filteredOrders.length}</strong> commandes enregistrées
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher N° commande, nom client, réf fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Statut Commande :</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Tous les statuts</option>
            <option value="pending_payment">Paiement en attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="product_purchased">Produit acheté en Chine</option>
            <option value="received_in_china">Reçu entrepôt Guangzhou</option>
            <option value="ready_to_ship">Prêt pour expédition</option>
            <option value="shipped">En transit international</option>
            <option value="customs_clearance">Dédouanement</option>
            <option value="available_for_pickup">Disponible en agence</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
            <option value="refunded">Remboursée</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>N° Commande</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Client</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Montant</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Paiement</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut Commande</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Mode & Destination</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement du registre des commandes...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucune commande ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--navy-dark)" }}>
                      {o.order_number}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>
                        {o.profile ? `${o.profile.first_name} ${o.profile.last_name}` : "Client CargoLink"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.profile?.email || ""}</div>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 900, color: "var(--navy-dark)" }}>
                      {Number(o.amount).toLocaleString()} {o.currency || "FCFA"}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={o.payment_status} type="payment" />
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={o.order_status} type="order" />
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{o.destination_city}, {o.destination_country}</div>
                      <div style={{ fontSize: 11, color: "var(--blue-primary)", fontWeight: 700 }}>
                        Fret {o.shipping_mode === "air" ? "Aérien ✈️" : "Maritime 🚢"}
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => openEditModal(o)}
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                      >
                        <RefreshCw style={{ width: 14 }} /> Gérer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ORDER MODAL */}
      {isModalOpen && selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 650, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)" }}>GESTION DE COMMANDE</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0 0" }}>
                  Mise à jour Commande #{selectedOrder.order_number}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {/* STATUS UPDATER */}
            <div style={{ background: "var(--bg-main)", padding: 16, borderRadius: "var(--radius-sm)", marginBottom: 20, border: "1px solid var(--border-light)" }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                CHANGER LE STATUT DE LA COMMANDE :
              </label>
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value as OrderStatus)}
                style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700, background: "#FFF" }}
              >
                <option value="pending_payment">1. Paiement en attente</option>
                <option value="confirmed">2. Commande confirmée</option>
                <option value="product_purchased">3. Produit acheté en Chine</option>
                <option value="received_in_china">4. Reçu à l'entrepôt de Guangzhou</option>
                <option value="ready_to_ship">5. Prêt pour l'expédition internationale</option>
                <option value="shipped">6. En transit international (Vol / Navire)</option>
                <option value="customs_clearance">7. Dédouanement local en cours</option>
                <option value="available_for_pickup">8. Arrivé & Disponible en agence</option>
                <option value="delivered">9. Commande livrée au client 🎉</option>
                <option value="cancelled">Annulée</option>
                <option value="refunded">Remboursée</option>
              </select>
            </div>

            {/* ASSIGNMENTS SECTION */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>ASSIGNER UN AGENT</label>
                <select value={editingAgent} onChange={(e) => setEditingAgent(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}>
                  <option value="">-- Aucun agent --</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>ASSIGNER FOURNISSEUR / PARTENAIRE</label>
                <select value={editingSupplier} onChange={(e) => setEditingSupplier(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}>
                  <option value="">-- Aucun partenaire --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.partner_type})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* REFERENCES & DOCUMENTS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>RÉFÉRENCE FOURNISSEUR / FACTURE CHINE</label>
                <input type="text" value={supplierRef} onChange={(e) => setSupplierRef(e.target.value)} placeholder="Ex: 1688-ORD-998822" style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>LIEN FACTURE / DOCUMENTATION (PDF)</label>
                <input type="text" value={invoiceUrl} onChange={(e) => setInvoiceUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>NOTES INTERNES ADMINISTRATEUR</label>
                <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Remarques confidentielles..." style={{ width: "100%", height: 70, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setIsModalOpen(false)} className="btn" style={{ padding: "8px 16px" }}>Annuler</button>
              <button onClick={handleUpdateOrder} disabled={saving} className="btn btn-primary" style={{ padding: "8px 20px" }}>
                {saving ? "Sauvegarde..." : "Enregistrer la Mise à Jour"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
