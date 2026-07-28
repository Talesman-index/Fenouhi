"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import TrackingTimeline from "@/components/TrackingTimeline";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  Truck,
  Plus,
  Search,
  MapPin,
  Calendar,
  Package,
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import type { Shipment, ShipmentEvent, ShippingMode } from "@/types/supabase";

export default function ShipmentsManagementPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [shipmentEvents, setShipmentEvents] = useState<ShipmentEvent[]>([]);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // New Event Form State
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);

  // New Shipment Form State
  const [orderId, setOrderId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState(`EXP-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  const [carrier, setCarrier] = useState("CargoLink Air Express");
  const [shippingMode, setShippingMode] = useState<ShippingMode>("air");
  const [weight, setWeight] = useState(5.5);
  const [volume, setVolume] = useState(0.04);
  const [destCountry, setDestCountry] = useState("Bénin");
  const [destCity, setDestCity] = useState("Cotonou");
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  async function fetchShipments() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("shipments")
        .select("*, order:orders(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShipments(data as Shipment[]);
    } catch (err) {
      console.error("Error fetching shipments:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const supabase = createClient();

      const newShipmentPayload = {
        tracking_number: trackingNumber,
        carrier,
        shipping_mode: shippingMode,
        weight,
        volume,
        destination_country: destCountry,
        destination_city: destCity,
        estimated_arrival: estimatedArrival ? new Date(estimatedArrival).toISOString() : null,
        current_location: "Entrepôt Guangzhou",
        status: "in_transit"
      };

      const { data, error } = await supabase
        .from("shipments")
        .insert(newShipmentPayload)
        .select()
        .single();

      if (error) throw error;

      // Create initial timeline event
      await supabase.from("shipment_events").insert({
        shipment_id: data.id,
        location: "Guangzhou, Chine",
        description: "Colis enregistré et étiqueté à l'entrepôt principal CargoLink Guangzhou",
        status: "in_transit"
      });

      await logAdminAction({
        action: "CREATE_SHIPMENT",
        entityType: "shipments",
        entityId: data.id,
        newValues: newShipmentPayload
      });

      fetchShipments();
      setIsCreateModalOpen(false);
      alert("Nouvelle expédition créée avec succès !");
    } catch (err: any) {
      alert("Erreur lors de la création de l'expédition : " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const openTimelineModal = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsTimelineModalOpen(true);

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("shipment_events")
        .select("*")
        .eq("shipment_id", shipment.id)
        .order("event_time", { ascending: true });

      if (data) setShipmentEvents(data as ShipmentEvent[]);
    } catch (err) {
      console.error("Error fetching shipment events:", err);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedShipment || !newEventLocation || !newEventDescription) return;
    try {
      setAddingEvent(true);
      const supabase = createClient();

      const { data: newEv, error } = await supabase
        .from("shipment_events")
        .insert({
          shipment_id: selectedShipment.id,
          location: newEventLocation,
          description: newEventDescription,
        })
        .select()
        .single();

      if (error) throw error;

      // Update current location in shipment table
      await supabase
        .from("shipments")
        .update({ current_location: newEventLocation })
        .eq("id", selectedShipment.id);

      setShipmentEvents((prev) => [...prev, newEv as ShipmentEvent]);
      setNewEventLocation("");
      setNewEventDescription("");
      alert("Nouvel événement logistique ajouté !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setAddingEvent(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    const num = s.tracking_number.toLowerCase();
    const loc = (s.current_location || "").toLowerCase();
    const carrierName = s.carrier.toLowerCase();
    const q = search.toLowerCase();
    return num.includes(q) || loc.includes(q) || carrierName.includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>
            TRANSIT INTERNATIONAL CHINE-AFRIQUE
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Expéditions & Suivi Logistique
          </h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-orange"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}
        >
          <Plus style={{ width: 16 }} /> Nouvelle Expédition
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par N° de suivi, localisation, transporteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>
      </div>

      {/* SHIPMENTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>N° Suivi</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Mode & Transporteur</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Poids / Volume</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Localisation Actuelle</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Destination</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement du registre de transit...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucune expédition enregistrée.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 900, color: "var(--navy-dark)" }}>
                      {s.tracking_number}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>{s.carrier}</div>
                      <span className="badge" style={{ background: s.shipping_mode === "air" ? "var(--orange-light)" : "var(--blue-light)", color: s.shipping_mode === "air" ? "var(--orange-hover)" : "var(--blue-primary)", fontSize: 10 }}>
                        {s.shipping_mode === "air" ? "Aérien ✈️" : "Maritime 🚢"}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                      {s.weight} kg • {s.volume} m³
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--orange-primary)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <MapPin style={{ width: 14 }} /> {s.current_location || "Guangzhou"}
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{s.destination_city}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.destination_country}</div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={s.status} type="order" />
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => openTimelineModal(s)}
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                      >
                        Timeline & Événements ➔
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE SHIPMENT MODAL */}
      {isCreateModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 550, width: "100%", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>Créer une Nouvelle Expédition</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleCreateShipment} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>NUMÉRO DE SUIVI (TRACKING)</label>
                <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} required style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>TRANSPORTEUR</label>
                <input type="text" value={carrier} onChange={(e) => setCarrier(e.target.value)} required style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>MODE D'EXPÉDITION</label>
                  <select value={shippingMode} onChange={(e) => setShippingMode(e.target.value as ShippingMode)} style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}>
                    <option value="air">Aérien (Express)</option>
                    <option value="sea">Maritime (Conteneur)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>POIDS (KG)</label>
                  <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} required style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>PAYS DESTINATION</label>
                  <input type="text" value={destCountry} onChange={(e) => setDestCountry(e.target.value)} required style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>VILLE DESTINATION</label>
                  <input type="text" value={destCity} onChange={(e) => setDestCity(e.target.value)} required style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn" style={{ padding: "8px 16px" }}>Annuler</button>
                <button type="submit" disabled={creating} className="btn btn-orange" style={{ padding: "8px 20px" }}>{creating ? "Création..." : "Enregistrer Expédition"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMELINE & EVENTS MODAL */}
      {isTimelineModalOpen && selectedShipment && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 650, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)" }}>TIMELINE EN TEMPS RÉEL</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0 0" }}>
                  Suivi #{selectedShipment.tracking_number}
                </h2>
              </div>
              <button onClick={() => setIsTimelineModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {/* ADD EVENT FORM */}
            <div style={{ background: "var(--bg-main)", padding: 16, borderRadius: "var(--radius-sm)", marginBottom: 20, border: "1px solid var(--border-light)" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 8 }}>
                AJOUTER UN NOUVEL ÉVÉNEMENT LOGISTIQUE :
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Localisation (ex: Aéroport d'Abidjan, Douanes Cotonou...)"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                />
                <textarea
                  placeholder="Description de l'événement (ex: Dédouanement terminé, colis chargé dans la navette...)"
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  style={{ width: "100%", height: 60, padding: 8, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
                />
                <button
                  onClick={handleAddEvent}
                  disabled={addingEvent}
                  className="btn btn-primary"
                  style={{ alignSelf: "flex-end", fontSize: 12, padding: "6px 14px" }}
                >
                  Publier l'événement
                </button>
              </div>
            </div>

            {/* EVENTS LIST */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--navy-dark)", marginBottom: 12 }}>Historique des Événements ({shipmentEvents.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {shipmentEvents.map((ev) => (
                  <div key={ev.id} style={{ display: "flex", gap: 12, padding: 12, borderRadius: "var(--radius-sm)", background: "#FFF", border: "1px solid var(--border-light)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--orange-light)", color: "var(--orange-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin style={{ width: 14 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--navy-dark)" }}>{ev.location}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{ev.description}</div>
                      <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 4 }}>
                        {new Date(ev.event_time).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setIsTimelineModalOpen(false)} className="btn" style={{ padding: "8px 16px" }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
