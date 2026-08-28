import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fenouhi — Logistique Chine-Afrique",
    short_name: "Fenouhi",
    description:
      "Achetez en Chine, livraison en Afrique. Fret aérien & maritime, devis transparents, Mobile Money.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D2B4D",
    theme_color: "#0D2B4D",
    orientation: "portrait-primary",
    categories: ["shopping", "logistics", "business"],
    lang: "fr",
    icons: [
      {
        src: "/icons/icon-96x96.png?v=3",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png?v=3",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png?v=3",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png?v=3",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png?v=3",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Demander un Devis",
        short_name: "Devis",
        description: "Obtenir un devis personnalisé pour fret aérien ou maritime",
        url: "/quote-request",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Catalogue Produits",
        short_name: "Catalogue",
        description: "Explorer les produits disponibles pour import de Chine",
        url: "/catalog",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Suivi de Commande",
        short_name: "Mes Colis",
        description: "Suivre vos expéditions et commandes en cours",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
    ],
    screenshots: [],
  };
}
