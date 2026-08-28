"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  Users,
  FileText,
  ShoppingBag,
  Truck,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Package
} from "lucide-react";
import type { Order, Quote, ActivityLog } from "@/types/supabase";
import type { Product } from "@/types/catalog";
import { PRODUCTS } from "@/lib/products";
import { getPublicProducts, getProductImageUrl } from "@/lib/supabase/catalog";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalUsers: 1,
    newUsersMonth: 1,
    totalQuotes: 0,
    pendingQuotes: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    parcelsInTransit: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    openDisputes: 0,
    totalCatalogProducts: PRODUCTS.length,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      const timeoutId = setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 2500);

      try {
        setLoading(true);
        const supabase = createClient();

        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        const [
          { count: usersCount },
          { count: newUsersCount },
          { count: quotesCount },
          { count: pendingQuotesCount },
          { count: activeOrdersCount },
          { count: deliveredOrdersCount },
          { count: transitCount },
          { data: paidPayments },
          { count: pendingPaymentsCount },
          { count: openDisputesCount },
          { data: orders },
          { data: quotes },
          { data: logs }
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", firstDayOfMonth),
          supabase.from("quotes").select("*", { count: "exact", head: true }),
          supabase.from("quotes").select("*", { count: "exact", head: true }).in("status", ["new", "under_review"]),
          supabase.from("orders").select("*", { count: "exact", head: true }).not("order_status", "in", '("delivered","cancelled","refunded")'),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "delivered"),
          supabase.from("shipments").select("*", { count: "exact", head: true }).eq("status", "in_transit"),
          supabase.from("payments").select("amount").eq("status", "paid"),
          supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("disputes").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress", "waiting_for_customer"]),
          supabase.from("orders").select("*, profile:profiles(*)").order("created_at", { ascending: false }).limit(5),
          supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(5)
        ]);

        const totalRevenueCalculated = paidPayments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

        let dynamicProductCount = PRODUCTS.length;
        let fetchedProds: Product[] = [];
        try {
          const prods = await getPublicProducts();
          if (prods && prods.length > 0) {
            dynamicProductCount = prods.length;
            fetchedProds = prods.slice(0, 5);
          }
        } catch {
          try {
            const prodsRes = await fetch("/api/products", { cache: "no-store" });
            if (prodsRes.ok) {
              const prodsJson = await prodsRes.json();
              if (typeof prodsJson.count === "number") {
                dynamicProductCount = prodsJson.count;
              }
              if (prodsJson.products && Array.isArray(prodsJson.products)) {
                fetchedProds = prodsJson.products.slice(0, 5);
              }
            }
          } catch {}
        }

        if (isMounted) {
          setKpis({
            totalUsers: typeof usersCount === "number" ? Math.max(usersCount, 1) : 1,
            newUsersMonth: typeof newUsersCount === "number" ? Math.max(newUsersCount, 1) : 1,
            totalQuotes: quotesCount ?? 0,
            pendingQuotes: pendingQuotesCount ?? 0,
            activeOrders: activeOrdersCount ?? 0,
            deliveredOrders: deliveredOrdersCount ?? 0,
            parcelsInTransit: transitCount ?? 0,
            totalRevenue: totalRevenueCalculated,
            pendingPayments: pendingPaymentsCount ?? 0,
            openDisputes: openDisputesCount ?? 0,
            totalCatalogProducts: dynamicProductCount,
          });

          setRecentOrders(orders && orders.length > 0 ? (orders as Order[]) : []);
          setRecentQuotes(quotes && quotes.length > 0 ? (quotes as Quote[]) : []);
          setRecentActivities(logs && logs.length > 0 ? (logs as ActivityLog[]) : []);
          setRecentProducts(fetchedProds);
        }
      } catch (err) {
        console.warn("Notice: using fallback dashboard metrics", err);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* PAGE TITLE BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>
            VUE D'ENSEMBLE PLATEFORME
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>
            Dashboard Administrateur
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/products" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Package style={{ width: 16 }} /> Articles & Catalogue ({kpis.totalCatalogProducts})
          </Link>
          <Link href="/admin/quotes" className="btn btn-orange" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Plus style={{ width: 16 }} /> Nouveau Devis
          </Link>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {/* KPI 0: CATALOG PRODUCTS */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Articles en Boutique</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package style={{ width: 16 }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--navy-dark)" }}>{kpis.totalCatalogProducts}</div>
          <div style={{ fontSize: 11, color: "var(--green-success)", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <CheckCircle2 style={{ width: 12 }} /> Produits actifs au catalogue
          </div>
        </div>

        {/* KPI 1: USERS */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Utilisateurs Inscrits</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users style={{ width: 16 }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--navy-dark)" }}>{kpis.totalUsers}</div>
          <div style={{ fontSize: 11, color: "var(--green-success)", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp style={{ width: 12 }} /> +{kpis.newUsersMonth} ce mois-ci
          </div>
        </div>

        {/* KPI 2: DEVIS */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Devis en Attente</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText style={{ width: 16 }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--navy-dark)" }}>{kpis.pendingQuotes}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginTop: 4 }}>
            Sur {kpis.totalQuotes} devis soumis au total
          </div>
        </div>

        {/* KPI 3: COMMANDES */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Commandes en Cours</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag style={{ width: 16 }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--navy-dark)" }}>{kpis.activeOrders}</div>
          <div style={{ fontSize: 11, color: "var(--green-success)", fontWeight: 700, marginTop: 4 }}>
            {kpis.deliveredOrders} livrées avec succès
          </div>
        </div>

        {/* KPI 4: COLIS TRANSIT */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Colis en Transit</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--orange-light)", color: "var(--orange-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck style={{ width: 16 }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--orange-primary)" }}>{kpis.parcelsInTransit}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginTop: 4 }}>
            Hub International ➔ Afrique
          </div>
        </div>

        {/* KPI 5: CHIFFRE D'AFFAIRES */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Chiffre d'Affaires</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard style={{ width: 16 }} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--navy-dark)" }}>{kpis.totalRevenue.toLocaleString()} FCFA</div>
          <div style={{ fontSize: 11, color: "#D97706", fontWeight: 700, marginTop: 4 }}>
            Sur commandes payées · {kpis.pendingPayments} en attente
          </div>
        </div>

        {/* KPI 6: LITIGES */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Litiges Ouverts</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle style={{ width: 16 }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: kpis.openDisputes > 0 ? "#DC2626" : "var(--navy-dark)" }}>{kpis.openDisputes}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginTop: 4 }}>
            Tickets client prioritaires
          </div>
        </div>
      </div>

      {/* ISSUES NEEDING ATTENTION BANNER */}
      {(kpis.pendingQuotes > 0 || kpis.pendingPayments > 0 || kpis.openDisputes > 0) && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "var(--radius-md)", padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle style={{ width: 22 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#92400E" }}>Interventions Administrateur Requises</div>
              <div style={{ fontSize: 13, color: "#B45309" }}>
                Vous avez {kpis.pendingQuotes} devis à chiffrer, {kpis.pendingPayments} preuves de paiement à vérifier et {kpis.openDisputes} réclamations client ouvertes.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/quotes" className="btn" style={{ background: "#D97706", color: "#FFF", fontSize: 12, padding: "8px 14px" }}>
              Traiter les devis ➔
            </Link>
            <Link href="/admin/payments" className="btn" style={{ background: "#92400E", color: "#FFF", fontSize: 12, padding: "8px 14px" }}>
              Vérifier paiements ➔
            </Link>
          </div>
        </div>
      )}

      {/* TABLES ROW: RECENT ORDERS & RECENT QUOTES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {/* RECENT ORDERS TABLE */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--navy-dark)", margin: 0 }}>Dernières Commandes</h3>
            <Link href="/admin/orders" style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-primary)" }}>Voir tout ➔</Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)", textAlign: "left" }}>
                  <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>N° Commande</th>
                  <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Client</th>
                  <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Montant</th>
                  <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "10px 4px", fontWeight: 600, color: "var(--navy-dark)" }}>{o.order_number}</td>
                      <td style={{ padding: "10px 4px" }}>{o.profile ? `${o.profile.first_name} ${o.profile.last_name}` : "Client"}</td>
                      <td style={{ padding: "10px 4px", fontWeight: 700 }}>{Number(o.amount).toLocaleString()} FCFA</td>
                      <td style={{ padding: "10px 4px" }}><StatusBadge status={o.order_status} type="order" /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "28px 12px", color: "#64748B" }}>
                      <ShoppingBag style={{ width: 28, height: 28, margin: "0 auto 8px", opacity: 0.4 }} />
                      <div>Aucune commande enregistrée pour le moment.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT QUOTES TABLE */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--navy-dark)", margin: 0 }}>Dernières Demandes de Devis</h3>
            <Link href="/admin/quotes" style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-primary)" }}>Voir tout ➔</Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)", textAlign: "left" }}>
                  <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>N° Devis</th>
                  <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Produit</th>
                  <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Qté</th>
                  <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.length > 0 ? (
                  recentQuotes.map((q) => (
                    <tr key={q.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "10px 4px", fontWeight: 600, color: "var(--navy-dark)" }}>{q.quote_number}</td>
                      <td style={{ padding: "10px 4px", maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.product_name}</td>
                      <td style={{ padding: "10px 4px", fontWeight: 700 }}>{q.quantity}</td>
                      <td style={{ padding: "10px 4px" }}><StatusBadge status={q.status} type="quote" /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "28px 12px", color: "#64748B" }}>
                      <FileText style={{ width: 28, height: 28, margin: "0 auto 8px", opacity: 0.4 }} />
                      <div>Aucune demande de devis en attente.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECENT CATALOG PRODUCTS ROW */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--navy-dark)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Package style={{ width: 18, height: 18, color: "var(--orange-primary)" }} />
              Derniers Articles Ajoutés au Catalogue ({kpis.totalCatalogProducts})
            </h3>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Produits récemment créés ou mis à jour dans la boutique</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/catalog" target="_blank" className="btn" style={{ fontSize: 12, padding: "6px 12px", background: "#F1F5F9", color: "#334155" }}>
              Voir la Boutique ➔
            </Link>
            <Link href="/admin/products" className="btn btn-primary" style={{ fontSize: 12, padding: "6px 12px" }}>
              Gérer les Articles ➔
            </Link>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)", textAlign: "left" }}>
                <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Article</th>
                <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Catégorie</th>
                <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Prix Unitaire</th>
                <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Stock</th>
                <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11 }}>Statut</th>
                <th style={{ padding: "8px 4px", color: "var(--text-muted)", fontSize: 11, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.length > 0 ? (
                recentProducts.map((p) => {
                  const img = getProductImageUrl(p);
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "10px 4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img
                            src={img}
                            alt={p.name}
                            style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", border: "1px solid var(--border-light)" }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--navy-dark)" }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 4px", color: "var(--text-muted)" }}>
                        {p.category?.name || "Général"}
                      </td>
                      <td style={{ padding: "10px 4px", fontWeight: 700, color: "var(--navy-dark)" }}>
                        {Number(p.price).toLocaleString()} {p.currency || "FCFA"}
                      </td>
                      <td style={{ padding: "10px 4px" }}>
                        <span style={{ fontWeight: 600, color: (p.stock_quantity ?? 0) > 10 ? "var(--green-success)" : "#EA580C" }}>
                          {p.stock_quantity ?? 100} en stock
                        </span>
                      </td>
                      <td style={{ padding: "10px 4px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            background: p.status === "active" ? "#DCFCE7" : "#F1F5F9",
                            color: p.status === "active" ? "#166534" : "#64748B"
                          }}
                        >
                          {p.status === "active" ? "Actif (Visible)" : "Inactif"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 4px", textAlign: "right" }}>
                        <Link
                          href={`/product/${p.slug || p.id}`}
                          target="_blank"
                          style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-primary)", textDecoration: "none" }}
                        >
                          Aperçu ↗
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "28px 12px", color: "#64748B" }}>
                    <Package style={{ width: 28, height: 28, margin: "0 auto 8px", opacity: 0.4 }} />
                    <div>Chargement des articles...</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
