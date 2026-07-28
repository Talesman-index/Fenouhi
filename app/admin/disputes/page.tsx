"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  AlertTriangle,
  Search,
  Send,
  MessageSquare,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  Paperclip,
  Lock,
  DollarSign,
  Filter
} from "lucide-react";
import type { Dispute, DisputeMessage, DisputePriority, DisputeStatus, Profile } from "@/types/supabase";

export default function DisputesManagementPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Selected Dispute Modal
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [editingStatus, setEditingStatus] = useState<DisputeStatus>("open");
  const [editingAgent, setEditingAgent] = useState<string>("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter, priorityFilter]);

  async function fetchDisputes() {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("disputes")
        .select("*, profile:profiles(*)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (priorityFilter !== "all") query = query.eq("priority", priorityFilter);

      const { data, error } = await query;
      if (error) throw error;
      setDisputes(data as Dispute[]);

      const { data: agentsData } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["agent", "admin", "super_admin"]);
      if (agentsData) setAgents(agentsData as Profile[]);
    } catch (err) {
      console.error("Error fetching disputes:", err);
    } finally {
      setLoading(false);
    }
  }

  const openDisputeModal = async (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setEditingStatus(dispute.status);
    setEditingAgent(dispute.assigned_agent_id || "");
    setReplyMessage("");
    setIsInternalNote(false);
    setIsModalOpen(true);

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("dispute_messages")
        .select("*")
        .eq("dispute_id", dispute.id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as DisputeMessage[]);
    } catch (err) {
      console.error("Error fetching dispute messages:", err);
    }
  };

  const handleSendReply = async () => {
    if (!selectedDispute || !replyMessage.trim()) return;
    try {
      setSending(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const messagePayload = {
        dispute_id: selectedDispute.id,
        sender_id: user?.id,
        sender_name: "Équipe CargoLink Africa",
        message: replyMessage,
        is_internal_note: isInternalNote,
      };

      const { data: newMsg, error } = await supabase
        .from("dispute_messages")
        .insert(messagePayload)
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, newMsg as DisputeMessage]);
      setReplyMessage("");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateDispute = async () => {
    if (!selectedDispute) return;
    try {
      const supabase = createClient();
      const updatePayload = {
        status: editingStatus,
        assigned_agent_id: editingAgent || null,
      };

      const { error } = await supabase
        .from("disputes")
        .update(updatePayload)
        .eq("id", selectedDispute.id);

      if (error) throw error;

      await logAdminAction({
        action: "UPDATE_DISPUTE",
        entityType: "disputes",
        entityId: selectedDispute.id,
        oldValues: { status: selectedDispute.status },
        newValues: updatePayload
      });

      setDisputes((prev) =>
        prev.map((d) => d.id === selectedDispute.id ? { ...d, ...updatePayload } : d)
      );
      setSelectedDispute((prev) => prev ? { ...prev, ...updatePayload } : null);
      alert("Ticket mis à jour !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const getPriorityColor = (priority: DisputePriority) => {
    switch (priority) {
      case "urgent": return { bg: "#FEE2E2", color: "#991B1B" };
      case "high": return { bg: "#FEF3C7", color: "#B45309" };
      case "medium": return { bg: "#DBEAFE", color: "#1D4ED8" };
      default: return { bg: "#F3F4F6", color: "#4B5563" };
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const num = d.ticket_number.toLowerCase();
    const subject = d.subject.toLowerCase();
    const client = (d.profile ? `${d.profile.first_name} ${d.profile.last_name}` : "").toLowerCase();
    const q = search.toLowerCase();
    return num.includes(q) || subject.includes(q) || client.includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "#FEE2E2", color: "#991B1B", marginBottom: 4 }}>
            SUPPORT & RÉCLAMATIONS CLIENT
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Litiges & Centre de Support
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          <strong>{filteredDisputes.filter((d) => d.status === "open" || d.status === "in_progress").length}</strong> tickets actifs en attente
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par N° ticket, sujet, nom client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Toutes priorités</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 Haute</option>
            <option value="medium">🔵 Moyenne</option>
            <option value="low">⚪ Faible</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Tous les statuts</option>
            <option value="open">Ouvert (Nouveau)</option>
            <option value="in_progress">En cours</option>
            <option value="waiting_for_customer">En attente client</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Clôturé</option>
          </select>
        </div>
      </div>

      {/* DISPUTES TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>N° Ticket</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Client & Sujet</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Priorité</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Date Création</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Chargement des tickets...</td></tr>
              ) : filteredDisputes.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Aucun litige trouvé.</td></tr>
              ) : (
                filteredDisputes.map((d) => {
                  const priorityStyle = getPriorityColor(d.priority as DisputePriority);
                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 900, color: "var(--navy-dark)" }}>
                        {d.ticket_number}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>
                          {d.profile ? `${d.profile.first_name} ${d.profile.last_name}` : "Client"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.subject}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: priorityStyle.bg, color: priorityStyle.color, borderRadius: 9999, padding: "4px 10px", fontSize: 11, fontWeight: 800 }}>
                          {d.priority.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <StatusBadge status={d.status} type="dispute" />
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                        {new Date(d.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => openDisputeModal(d)}
                          className="btn"
                          style={{ padding: "6px 12px", fontSize: 12, background: "#FEE2E2", color: "#991B1B" }}
                        >
                          <MessageSquare style={{ width: 14 }} /> Traiter
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPUTE DETAIL & MESSAGING MODAL */}
      {isModalOpen && selectedDispute && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 700, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <span className="badge" style={{ background: "#FEE2E2", color: "#991B1B" }}>TICKET #{selectedDispute.ticket_number}</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0 0" }}>
                  {selectedDispute.subject}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {/* DISPUTE DESCRIPTION */}
            <div style={{ background: "var(--bg-main)", padding: 14, borderRadius: "var(--radius-sm)", marginBottom: 16, border: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 4 }}>DESCRIPTION DU CLIENT</div>
              <div style={{ fontSize: 13, color: "var(--navy-dark)" }}>{selectedDispute.description}</div>
            </div>

            {/* STATUS & AGENT MANAGEMENT */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>CHANGER LE STATUT DU TICKET :</label>
                <select value={editingStatus} onChange={(e) => setEditingStatus(e.target.value as DisputeStatus)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}>
                  <option value="open">Ouvert (Nouveau)</option>
                  <option value="in_progress">En cours de traitement</option>
                  <option value="waiting_for_customer">En attente réponse client</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Clôturé</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>ASSIGNER UN AGENT :</label>
                <select value={editingAgent} onChange={(e) => setEditingAgent(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}>
                  <option value="">-- Non assigné --</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={handleUpdateDispute} className="btn btn-primary" style={{ fontSize: 12, marginBottom: 20, padding: "8px 16px" }}>
              Mettre à jour le Ticket
            </button>

            {/* MESSAGES THREAD */}
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--navy-dark)", marginBottom: 12 }}>
                Fil de Discussion ({messages.length} messages)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 16, fontSize: 13 }}>
                    Aucun message dans ce fil. Répondez ci-dessous pour démarrer.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        padding: 12,
                        borderRadius: "var(--radius-sm)",
                        background: msg.is_internal_note ? "#FFFBEB" : (msg.sender_name?.includes("CargoLink") ? "var(--blue-light)" : "var(--bg-main)"),
                        border: `1px solid ${msg.is_internal_note ? "#FCD34D" : "var(--border-light)"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)" }}>
                          {msg.is_internal_note ? "🔒 Note Interne — " : ""}{msg.sender_name || "Client"}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(msg.created_at).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--navy-dark)" }}>{msg.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* REPLY FORM */}
            <div style={{ background: "var(--bg-main)", padding: 14, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)" }}>Répondre :</label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                  />
                  <Lock style={{ width: 14, color: "#D97706" }} /> Note interne (non visible par le client)
                </label>
              </div>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Saisissez votre message ou note interne..."
                style={{ width: "100%", height: 80, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, marginBottom: 8 }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setIsModalOpen(false)} className="btn" style={{ padding: "7px 14px", fontSize: 12 }}>Fermer</button>
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyMessage.trim()}
                  className="btn btn-orange"
                  style={{ padding: "7px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Send style={{ width: 14 }} /> {sending ? "Envoi..." : "Envoyer la Réponse"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
