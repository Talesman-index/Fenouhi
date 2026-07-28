"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
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
  Edit
} from "lucide-react";
import type { Supplier, PartnerType } from "@/types/supabase";

const DEMO_SUPPLIERS: Supplier[] = [
  { id: "sp1", name: "Guangzhou Electronics Ltd", partner_type: "supplier", company_name: "Guangzhou Electronics Co., Ltd", email: "contact@gzelectronics.cn", phone: "+86 20 8822 1100", country: "Chine", city: "Guangzhou", address: "Tianhe District, Guangzhou", rating: 4.8, is_verified: true, status: "active", category: "Électronique & High-Tech", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sp2", name: "Yiwu Commodities Trading", partner_type: "supplier", company_name: "Yiwu International Import & Export", email: "sales@yiwutrading.cn", phone: "+86 579 8555 4321", country: "Chine", city: "Yiwu", address: "Chouzhou North Rd, Yiwu", rating: 4.6, is_verified: true, status: "active", category: "Accessoires & Gadgets", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "sp3", name: "Shenzhen Logistics & Express", partner_type: "freight_forwarder", company_name: "Shenzhen Global Cargo Co.", email: "dispatch@szcargo.cn", phone: "+86 755 2399 8877", country: "Chine", city: "Shenzhen", address: "Baoan International Airport Zone", rating: 4.9, is_verified: true, status: "active", category: "Fret Aérien Express", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export default function SuppliersManagementPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setSuppliers(DEMO_SUPPLIERS);
        setLoading(false);
      }
    }, 1500);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
      completed = true;
      clearTimeout(timer);

      if (error || !data || data.length === 0) {
        setSuppliers(DEMO_SUPPLIERS);
      } else {
        setSuppliers(data as Supplier[]);
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      setSuppliers(DEMO_SUPPLIERS);
    } finally {
      setLoading(false);
    }
  }

  const filteredSuppliers = suppliers.filter((s) => {
    const name = (s.name || "").toLowerCase();
    const city = (s.city || "").toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || city.includes(query);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            PARTENAIRES EN CHINE
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Fournisseurs & Transitaires Chine
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          Total : <strong>{filteredSuppliers.length}</strong> partenaires
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="card" style={{ padding: 18, display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher un fournisseur ou transitaire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>
      </div>

      {/* SUPPLIERS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {loading ? (
          <div style={{ gridColumn: "1 / -1", padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
            Chargement du répertoire fournisseurs...
          </div>
        ) : filteredSuppliers.map((sp) => (
          <div key={sp.id} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span className="badge" style={{ background: "var(--bg-main)", color: "var(--navy-dark)", border: "1px solid var(--border-light)", fontSize: 10 }}>
                  {sp.partner_type === "supplier" ? "🏬 Usine / Fournisseur" : "🚚 Transitaire Fret"}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--orange-primary)", display: "flex", alignItems: "center", gap: 3 }}>
                  <Star style={{ width: 13, fill: "var(--orange-primary)" }} /> {sp.rating}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0" }}>
                {sp.name}
              </h3>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sp.company_name}</div>
            </div>

            <div style={{ fontSize: 12.5, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 6, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin style={{ width: 14, color: "var(--blue-primary)" }} /> {sp.city}, {sp.country}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail style={{ width: 14, color: "var(--text-muted)" }} /> {sp.email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone style={{ width: 14, color: "var(--text-muted)" }} /> {sp.phone}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
