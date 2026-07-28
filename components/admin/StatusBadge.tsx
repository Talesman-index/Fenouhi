import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "user_role" | "user_status" | "quote" | "order" | "payment" | "dispute" | "shipping";
}

export default function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    const key = (status || "").toLowerCase();

    // User Roles
    if (type === "user_role") {
      switch (key) {
        case "super_admin":
        case "admin":
          return { bg: "#EFF6FF", color: "#1D4ED8", label: key === "super_admin" ? "Super Admin" : "Administrateur" };
        case "agent":
          return { bg: "#F0FDF4", color: "#15803D", label: "Agent Logistique" };
        case "partner":
        case "logistics":
          return { bg: "#FEF3C7", color: "#B45309", label: "Partenaire Transitaire" };
        default:
          return { bg: "#F3F4F6", color: "#374151", label: "Client" };
      }
    }

    // User Status
    if (type === "user_status") {
      switch (key) {
        case "active":
          return { bg: "#DCFCE7", color: "#166534", label: "Actif" };
        case "suspended":
          return { bg: "#FEE2E2", color: "#991B1B", label: "Suspendu" };
        case "pending_verification":
          return { bg: "#FEF3C7", color: "#92400E", label: "Vérification en attente" };
        default:
          return { bg: "#F3F4F6", color: "#4B5563", label: status };
      }
    }

    // Quote Status
    if (type === "quote") {
      switch (key) {
        case "new":
          return { bg: "#E0F2FE", color: "#0369A1", label: "Nouveau devis" };
        case "under_review":
          return { bg: "#FEF3C7", color: "#B45309", label: "En cours d'étude" };
        case "quote_sent":
          return { bg: "#F0FDF4", color: "#15803D", label: "Devis Envoyé" };
        case "accepted":
          return { bg: "#DCFCE7", color: "#166534", label: "Accepté par le client" };
        case "rejected":
          return { bg: "#FEE2E2", color: "#991B1B", label: "Rejeté" };
        case "expired":
          return { bg: "#F3F4F6", color: "#6B7280", label: "Expiré" };
        default:
          return { bg: "#F3F4F6", color: "#4B5563", label: status };
      }
    }

    // Order Status
    if (type === "order") {
      switch (key) {
        case "pending_payment":
          return { bg: "#FEF3C7", color: "#B45309", label: "Paiement en attente" };
        case "confirmed":
          return { bg: "#E0F2FE", color: "#0369A1", label: "Commande confirmée" };
        case "product_purchased":
          return { bg: "#DBEAFE", color: "#1E40AF", label: "Produit acheté en Chine" };
        case "received_in_china":
          return { bg: "#F0FDF4", color: "#166534", label: "Reçu entrepôt Guangzhou" };
        case "ready_to_ship":
          return { bg: "#DCFCE7", color: "#15803D", label: "Prêt pour expédition" };
        case "shipped":
          return { bg: "#FFF7ED", color: "#C2410C", label: "En transit international" };
        case "customs_clearance":
          return { bg: "#FDF4FF", color: "#86198F", label: "Dédouanement en cours" };
        case "available_for_pickup":
          return { bg: "#ECFDF5", color: "#047857", label: "Disponible en agence" };
        case "delivered":
          return { bg: "#DCFCE7", color: "#14532D", label: "Livrée au client" };
        case "cancelled":
          return { bg: "#FEE2E2", color: "#991B1B", label: "Annulée" };
        case "refunded":
          return { bg: "#F3F4F6", color: "#4B5563", label: "Remboursée" };
        default:
          return { bg: "#F3F4F6", color: "#4B5563", label: status };
      }
    }

    // Payment Status
    if (type === "payment") {
      switch (key) {
        case "paid":
          return { bg: "#DCFCE7", color: "#15803D", label: "Payé & Validé" };
        case "pending":
          return { bg: "#FEF3C7", color: "#B45309", label: "Vérification en attente" };
        case "failed":
        case "cancelled":
          return { bg: "#FEE2E2", color: "#991B1B", label: key === "failed" ? "Échoué" : "Annulé" };
        case "refunded":
        case "partially_refunded":
          return { bg: "#F3F4F6", color: "#4B5563", label: key === "refunded" ? "Remboursé" : "Partiellement remboursé" };
        default:
          return { bg: "#F3F4F6", color: "#4B5563", label: status };
      }
    }

    // Dispute Status
    if (type === "dispute") {
      switch (key) {
        case "open":
          return { bg: "#FEE2E2", color: "#991B1B", label: "Ouvert (Nouveau)" };
        case "in_progress":
          return { bg: "#FEF3C7", color: "#B45309", label: "En cours de traitement" };
        case "waiting_for_customer":
          return { bg: "#E0F2FE", color: "#0369A1", label: "En attente du client" };
        case "resolved":
          return { bg: "#DCFCE7", color: "#15803D", label: "Résolu" };
        case "closed":
          return { bg: "#F3F4F6", color: "#6B7280", label: "Clôturé" };
        default:
          return { bg: "#F3F4F6", color: "#4B5563", label: status };
      }
    }

    // Default Fallback
    return { bg: "#F3F4F6", color: "#374151", label: status };
  };

  const badge = getBadgeStyle();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: 11.5,
        fontWeight: 800,
        backgroundColor: badge.bg,
        color: badge.color,
        whiteSpace: "nowrap"
      }}
    >
      {badge.label}
    </span>
  );
}
