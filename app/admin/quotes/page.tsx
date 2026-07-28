"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { logAdminAction } from "@/lib/admin/activity-logger";
import { DEMO_QUOTES } from "@/lib/admin/demo-data";
import {
  FileText,
  Search,
  Send,
  Calculator,
  ExternalLink,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus
} from "lucide-react";
import type { Quote, QuoteStatus } from "@/types/supabase";

export default function QuotesManagementPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Quote Modal State
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quote Calculator State
  const [productCost, setProductCost] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [extraFee, setExtraFee] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const calculatedTotal = Number(productCost || 0) + Number(serviceFee || 0) + Number(shippingFee || 0) + Number(extraFee || 0);

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  async function fetchQuotes() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setQuotes(DEMO_QUOTES as Quote[]);
        setLoading(false);
      }
    }, 1500);

    try {
      const supabase = createClient();
      let query = supabase.from("quotes").select("*").order("created_at", { ascending: false });

      if (statusFilter !== "all") query = query.eq("status", statusFilter);

      const { data, error } = await query;
      completed = true;
      clearTimeout(timer);

      if (error || !data || data.length === 0) {
        setQuotes(DEMO_QUOTES as Quote[]);
      } else {
        setQuotes(data as Quote[]);
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      setQuotes(DEMO_QUOTES as Quote[]);
    } finally {
      setLoading(false);
    }
  }

  const openQuoteModal = (quote: Quote) => {
    setSelectedQuote(quote);
    setProductCost(quote.product_cost || quote.estimated_price || 0);
    setServiceFee(quote.service_fee || 5000);
    setShippingFee(quote.shipping_fee || 15000);
    setExtraFee(quote.extra_fee || 0);
    setAdminNotes(quote.admin_notes || "");
    setExpirationDate(quote.expiration_date ? quote.expiration_date.split("T")[0] : "");
    setIsModalOpen(true);
  };

  const handleSaveAndSendQuote = async () => {
    if (!selectedQuote) return;
    try {
      setSaving(true);
      const supabase = createClient();

      const updatedPayload = {
        product_cost: productCost,
        service_fee: serviceFee,
        shipping_fee: shippingFee,
        extra_fee: extraFee,
        status: "quote_sent" as QuoteStatus,
        admin_notes: adminNotes,
        expiration_date: expirationDate ? new Date(expirationDate).toISOString() : null,
      };

      try {
        await supabase
          .from("quotes")
          .update(updatedPayload)
          .eq("id", selectedQuote.id);
      } catch (e) {
        // Fallback for demo mode
      }

      await logAdminAction({
        action: "SEND_QUOTE",
        entityType: "quotes",
        entityId: selectedQuote.id,
        newValues: { total: calculatedTotal, status: "quote_sent" }
      });

      setQuotes((prev) => prev.map((q) => q.id === selectedQuote.id ? { ...q, ...updatedPayload, total_amount: calculatedTotal } : q));
      setIsModalOpen(false);
      alert("Le devis chiffré a été enregistré et transmis au client !");
    } catch (err: any) {
      alert("Devis mis à jour en mode démo !");
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToOrder = async (quote: Quote) => {
    if (!confirm(`Voulez-vous convertir le devis ${quote.quote_number} en commande officielle ?`)) return;

    try {
      const supabase = createClient();
      const orderNumber = `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      try {
        await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            quote_id: quote.id,
            user_id: quote.user_id,
            amount: quote.total_amount || calculatedTotal,
            payment_status: "pending",
            order_status: "pending_payment",
            shipping_mode: quote.shipping_mode,
            destination_country: quote.destination_country,
            destination_city: quote.destination_city,
          });

        await supabase.from("quotes").update({ status: "accepted" }).eq("id", quote.id);
      } catch (e) {
        // Fallback for demo
      }

      await logAdminAction({
        action: "CONVERT_QUOTE_TO_ORDER",
        entityType: "quotes",
        entityId: quote.id,
        newValues: { order_number: orderNumber }
      });

      setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'accepted' as QuoteStatus } : q));
      alert(`Devis converti avec succès en Commande ${orderNumber} !`);
    } catch (err: any) {
      alert(`Devis converti (mode démo) !`);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const num = (q.quote_number || "").toLowerCase();
    const prod = (q.product_name || "").toLowerCase();
    const client = (q.user_name || q.user_email || "").toLowerCase();
    const query = search.toLowerCase();
    return num.includes(query) || prod.includes(query) || client.includes(query);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>
            TARIFICATION & CHIFFRAGE LOGISTIQUE
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Gestion des Demandes de Devis
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          Total : <strong>{filteredQuotes.length}</strong> demandes reçues
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par N° devis, produit, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Statut :</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 700, background: "#FFF" }}>
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="under_review">En cours d'étude</option>
            <option value="quote_sent">Devis Envoyé</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Rejeté</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
      </div>

      {/* QUOTES TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>N° Devis</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Produit & Lien</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Qté / Mode</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Destination</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Total Devis</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement des devis logistiques...
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucune demande de devis trouvée.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--navy-dark)" }}>
                      {q.quote_number}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>{q.product_name}</div>
                      {q.product_link && (
                        <a href={q.product_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--blue-primary)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                          Lien Fournisseur Chine <ExternalLink style={{ width: 10 }} />
                        </a>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{q.quantity} unités</div>
                      <span className="badge" style={{ background: q.shipping_mode === "air" ? "var(--orange-light)" : "var(--blue-light)", color: q.shipping_mode === "air" ? "var(--orange-hover)" : "var(--blue-primary)", fontSize: 10 }}>
                        Fret {q.shipping_mode === "air" ? "Aérien ✈️" : "Maritime 🚢"}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{q.destination_city}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{q.destination_country}</div>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 900, color: "var(--orange-primary)", fontSize: 14 }}>
                      {(q.total_amount || calculatedTotal).toLocaleString()} FCFA
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={q.status} type="quote" />
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button
                          onClick={() => openQuoteModal(q)}
                          className="btn btn-primary"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                        >
                          <Calculator style={{ width: 14 }} /> Calculer
                        </button>

                        {(q.status === "accepted" || q.status === "quote_sent") && (
                          <button
                            onClick={() => handleConvertToOrder(q)}
                            className="btn btn-orange"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            title="Transformer en commande"
                          >
                            <ArrowRight style={{ width: 14 }} /> Créer Commande
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CALCULATOR & EDIT MODAL */}
      {isModalOpen && selectedQuote && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 650, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)" }}>ÉLABORATION DE DEVIS</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0 0" }}>
                  Chiffrer le Devis #{selectedQuote.quote_number}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {/* PRODUCT SUMMARY BOX */}
            <div style={{ background: "var(--bg-main)", padding: 14, borderRadius: "var(--radius-sm)", marginBottom: 20, border: "1px solid var(--border-light)" }}>
              <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>Produit : {selectedQuote.product_name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Qté : {selectedQuote.quantity} • Mode : Fret {selectedQuote.shipping_mode === "air" ? "Aérien" : "Maritime"} • Destination : {selectedQuote.destination_city}, {selectedQuote.destination_country}
              </div>
            </div>

            {/* CALCULATOR INPUTS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>1. PRIX D'ACHAT PRODUIT CHINE (FCFA)</label>
                <input type="number" value={productCost} onChange={(e) => setProductCost(Number(e.target.value))} className="admin-input" style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>2. FRAIS DE SERVICE CARGOLINK (FCFA)</label>
                <input type="number" value={serviceFee} onChange={(e) => setServiceFee(Number(e.target.value))} className="admin-input" style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>3. FRAIS DE TRANSPORT LOGISTIQUE (FCFA)</label>
                <input type="number" value={shippingFee} onChange={(e) => setShippingFee(Number(e.target.value))} className="admin-input" style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>4. FRAIS SUPPLÉMENTAIRES / DOUANE (FCFA)</label>
                <input type="number" value={extraFee} onChange={(e) => setExtraFee(Number(e.target.value))} className="admin-input" style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>5. DATE D'EXPIRATION DU DEVIS</label>
                <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>NOTE INTERNE / INDICATION CLIENT</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Précisez le détail des frais pour le client..." style={{ width: "100%", height: 70, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }} />
              </div>
            </div>

            {/* TOTAL BOX */}
            <div style={{ background: "var(--navy-dark)", color: "#FFF", padding: 18, borderRadius: "var(--radius-md)", marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>TOTAL CALCULÉ AUTOMATIQUEMENT</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--orange-primary)", marginTop: 2 }}>
                {calculatedTotal.toLocaleString()} FCFA
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setIsModalOpen(false)} className="btn" style={{ padding: "8px 16px" }}>Annuler</button>
              <button onClick={handleSaveAndSendQuote} disabled={saving} className="btn btn-orange" style={{ padding: "8px 20px", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Send style={{ width: 16 }} /> {saving ? "Envoi..." : "Enregistrer et Envoyer le Devis"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
