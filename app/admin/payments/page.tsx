"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Printer,
  Download,
  Clock,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import type { Payment, PaymentStatus } from "@/types/supabase";

export default function PaymentsManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Receipt & Verification Modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  async function fetchPayments() {
    try {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from("payments").select("*, profile:profiles(*)").order("created_at", { ascending: false });

      if (statusFilter !== "all") query = query.eq("status", statusFilter);

      const { data, error } = await query;
      if (error) throw error;
      setPayments(data as Payment[]);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }

  const openPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setAdminNote(payment.admin_note || "");
    setIsModalOpen(true);
  };

  const handleUpdatePaymentStatus = async (newStatus: PaymentStatus) => {
    if (!selectedPayment) return;
    try {
      setProcessing(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const updatePayload = {
        status: newStatus,
        admin_note: adminNote,
        verified_at: newStatus === "paid" ? new Date().toISOString() : selectedPayment.verified_at,
        verified_by: user?.id || null
      };

      const { error } = await supabase
        .from("payments")
        .update(updatePayload)
        .eq("id", selectedPayment.id);

      if (error) throw error;

      // Also update linked order payment status if paid!
      if (newStatus === "paid" && selectedPayment.order_id) {
        await supabase.from("orders").update({ payment_status: "paid", order_status: "confirmed" }).eq("id", selectedPayment.order_id);
      }

      await logAdminAction({
        action: newStatus === "paid" ? "CONFIRM_PAYMENT" : "REJECT_PAYMENT",
        entityType: "payments",
        entityId: selectedPayment.id,
        newValues: updatePayload
      });

      setPayments((prev) => prev.map((p) => p.id === selectedPayment.id ? { ...p, ...updatePayload } : p));
      setIsModalOpen(false);
      alert(`Paiement ${newStatus === "paid" ? "validé" : "mis à jour"} avec succès !`);
    } catch (err: any) {
      alert("Erreur lors de la validation du paiement : " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const ref = p.payment_ref.toLowerCase();
    const client = (p.profile ? `${p.profile.first_name} ${p.profile.last_name}` : "").toLowerCase();
    const method = p.payment_method.toLowerCase();
    const q = search.toLowerCase();
    return ref.includes(q) || client.includes(q) || method.includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green-success)", marginBottom: 4 }}>
            VÉRIFICATION FINANCIÈRE & REÇUS
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Gestion des Paiements & Transactions
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          Total : <strong>{filteredPayments.length}</strong> transactions
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par référence, nom client, moyen de paiement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Statut :</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Tous les paiements</option>
            <option value="pending">En attente de vérification</option>
            <option value="paid">Payé & Validé</option>
            <option value="failed">Échoué / Rejeté</option>
            <option value="refunded">Remboursé</option>
          </select>
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Réf Paiement</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Client</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Montant</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Méthode</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Date</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement des transactions financières...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucune transaction trouvée.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--navy-dark)" }}>
                      {p.payment_ref}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>
                        {p.profile ? `${p.profile.first_name} ${p.profile.last_name}` : "Client"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.profile?.email || ""}</div>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 900, color: "var(--green-success)", fontSize: 14 }}>
                      {Number(p.amount).toLocaleString()} {p.currency || "FCFA"}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <span className="badge" style={{ background: "var(--bg-main)", color: "var(--navy-dark)", border: "1px solid var(--border-light)" }}>
                        {p.payment_method}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={p.status} type="payment" />
                    </td>

                    <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => openPaymentModal(p)}
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                      >
                        <Eye style={{ width: 14 }} /> Vérifier Reçu
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT & RECEPT MODAL */}
      {isModalOpen && selectedPayment && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 550, width: "100%", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green-success)" }}>VÉRIFICATION PREUVE</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0 0" }}>
                  Réf: {selectedPayment.payment_ref}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ background: "var(--bg-main)", padding: 16, borderRadius: "var(--radius-sm)", marginBottom: 20, border: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>MONTANT DE LA TRANSACTION</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--green-success)" }}>
                {Number(selectedPayment.amount).toLocaleString()} {selectedPayment.currency || "FCFA"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy-dark)", marginTop: 4 }}>
                Méthode : {selectedPayment.payment_method}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>NOTE ADMINISTRATIVE</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ex: Preuve Mobile Money vérifiée auprès de l'opérateur MT..."
                style={{ width: "100%", height: 70, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => handleUpdatePaymentStatus("failed")}
                disabled={processing}
                className="btn"
                style={{ background: "#FEE2E2", color: "#991B1B", padding: "8px 14px", fontSize: 12 }}
              >
                Rejeter Preuve
              </button>

              <button
                onClick={() => handleUpdatePaymentStatus("paid")}
                disabled={processing}
                className="btn"
                style={{ background: "var(--green-success)", color: "#FFF", padding: "8px 18px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <CheckCircle2 style={{ width: 16 }} /> Confirmer & Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
