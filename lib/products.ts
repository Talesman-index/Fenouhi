// Catalogue centralisé des produits CargoLink Africa
// Ce fichier est la source de vérité partagée entre /catalog, /product/[id], et la homepage

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number; // prix unitaire FCFA
  oldPrice?: number;
  minQty: number;
  maxQty?: number;
  image: string;
  images: string[];
  category: string;
  badge?: string;
  origin: string;
  weight: string; // ex: "0.35 kg"
  volume: string; // ex: "0.002 CBM"
  rating: number;
  reviewsCount: number;
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
  reviews: { author: string; rating: number; comment: string; date: string }[];
  related: string[]; // IDs of related products
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Montre Connectée SmartFit Pro X GPS",
    subtitle: "Smartwatch haute performance — Direct Usine Shenzhen",
    price: 3500,
    oldPrice: 5500,
    minQty: 5,
    maxQty: 1000,
    image: "/images/assets/item_1.jpg",
    images: ["/images/assets/item_1.jpg", "/images/assets/item_2.jpg", "/images/assets/item_3.jpg"],
    category: "electronics",
    badge: "BEST SELLER",
    origin: "Shenzhen, Chine",
    weight: "0.35 kg",
    volume: "0.002 CBM",
    rating: 4.7,
    reviewsCount: 248,
    description:
      "La SmartFit Pro X GPS est une montre connectée de niveau premium, produite directement dans les usines de Shenzhen et disponible en lot grossiste à prix d'usine via CargoLink Africa. Écran AMOLED HD 1.85\", suivi cardiaque en temps réel, SpO2, GPS intégré, étanchéité IP68 et autonomie de 7 jours. Compatible iOS & Android. Emballage individuel renforcé inclus.",
    features: [
      "Écran AMOLED 1.85\" HD",
      "GPS intégré multipoints",
      "Suivi cardiaque + SpO2 24h/24",
      "Étanchéité IP68 (30m / 30min)",
      "Autonomie 7 jours",
      "Charge magnétique rapide",
      "Compatible iOS & Android",
      "Emballage individuel inclus",
    ],
    specifications: [
      { label: "Écran", value: "AMOLED 1.85\" — 240×286px" },
      { label: "Processeur", value: "Realtek RTL8762D" },
      { label: "Mémoire", value: "512KB RAM / 4MB Flash" },
      { label: "Connectivité", value: "Bluetooth 5.0 + GPS" },
      { label: "Batterie", value: "230 mAh Li-Po" },
      { label: "Autonomie", value: "7 jours usage normal" },
      { label: "Étanchéité", value: "IP68 (30m / 30 min)" },
      { label: "Compatibilité", value: "iOS 10+ / Android 5+" },
      { label: "Poids", value: "35g avec bracelet" },
      { label: "Coloris dispo.", value: "Noir, Argent, Or Rose" },
      { label: "Minimum commande", value: "5 unités" },
      { label: "Délai production", value: "7–12 jours ouvrés" },
    ],
    reviews: [
      { author: "Abdoulaye D.", rating: 5, comment: "Parfait pour la revente au marché. Qualité bien supérieure au prix. La montre tient vraiment 7 jours.", date: "15 Jan. 2025" },
      { author: "Aicha K.", rating: 4, comment: "Livraison rapide depuis Cotonou, produit conforme aux photos. Je recommande CargoLink !", date: "03 Mar. 2025" },
      { author: "Mamadou S.", rating: 5, comment: "Commande de 50 unités, zéro casse, emballage solide. Clientèle très satisfaite.", date: "22 Avr. 2025" },
    ],
    related: ["2", "3", "7"],
  },
  {
    id: "2",
    title: "Écouteurs Bluetooth ANC SoundBass Pro",
    subtitle: "TWS Active Noise Cancelling — Lot grossiste usine",
    price: 2200,
    oldPrice: 4000,
    minQty: 5,
    image: "/images/assets/item_2.jpg",
    images: ["/images/assets/item_2.jpg", "/images/assets/item_3.jpg", "/images/assets/item_1.jpg"],
    category: "electronics",
    badge: "PROMO",
    origin: "Guangzhou, Chine",
    weight: "0.08 kg",
    volume: "0.001 CBM",
    rating: 4.5,
    reviewsCount: 183,
    description:
      "Écouteurs intra-auriculaires True Wireless avec réduction de bruit active (ANC). Réduction de 35dB, bass boostée, autonomie de 6h + 24h avec boîtier de charge, latence jeu ultra-faible 50ms. Idéal pour revendeurs et boutiques d'électronique.",
    features: [
      "ANC — Réduction bruit active 35dB",
      "Autonomie 6h + 24h boîtier",
      "Latence gaming 50ms",
      "Bass boostée EQ premium",
      "Certification IPX5",
      "Charge USB-C",
      "3 tailles d'embouts silicone",
    ],
    specifications: [
      { label: "Connectivité", value: "Bluetooth 5.3" },
      { label: "ANC", value: "–35 dB actif" },
      { label: "Autonomie écouteur", value: "6 heures" },
      { label: "Autonomie boîtier", value: "+24 heures" },
      { label: "Charge", value: "USB-C — 60 min" },
      { label: "Étanchéité", value: "IPX5" },
      { label: "Latence", value: "50ms mode jeu" },
      { label: "Minimum commande", value: "5 unités" },
    ],
    reviews: [
      { author: "Fatou N.", rating: 5, comment: "Excellent rapport qualité-prix pour la revente. Les clients adorent la qualité audio.", date: "10 Fév. 2025" },
    ],
    related: ["1", "3", "2"],
  },
  {
    id: "3",
    title: "Casque Audio Over-Ear Wireless Hi-Fi",
    subtitle: "Casque supra-auriculaire premium — Direct Usine",
    price: 4500,
    oldPrice: 7000,
    minQty: 5,
    image: "/images/assets/item_3.jpg",
    images: ["/images/assets/item_3.jpg", "/images/assets/item_2.jpg", "/images/assets/item_1.jpg"],
    category: "electronics",
    origin: "Dongguan, Chine",
    weight: "0.28 kg",
    volume: "0.003 CBM",
    rating: 4.6,
    reviewsCount: 156,
    description: "Casque over-ear sans fil avec drivers 40mm, basses profondes, réduction bruit passive, coussinets mémoire de forme en similicuir premium. Autonomie 35h. Pliable pour transport.",
    features: ["Drivers 40mm haute résolution", "Autonomie 35h", "Pliable compact", "Coussinets mémoire de forme", "Charge USB-C"],
    specifications: [
      { label: "Drivers", value: "40mm HD" },
      { label: "Autonomie", value: "35 heures" },
      { label: "Charge", value: "USB-C 90 min" },
      { label: "Minimum commande", value: "5 unités" },
    ],
    reviews: [],
    related: ["1", "2"],
  },
  {
    id: "4",
    title: "Baskets Urban High-Top Sneaker Pro",
    subtitle: "Chaussures de sport urbaines — Collection 2025",
    price: 2800,
    oldPrice: 4500,
    minQty: 5,
    image: "/images/assets/item_4.jpg",
    images: ["/images/assets/item_4.jpg", "/images/assets/item_6.jpg", "/images/assets/item_8.jpg"],
    category: "fashion",
    origin: "Putian, Chine",
    weight: "0.55 kg",
    volume: "0.005 CBM",
    rating: 4.4,
    reviewsCount: 312,
    description: "Sneakers haute tige streetwear, semelle EVA anti-fatigue, tige en mesh respirant, renfort talonnière. Disponibles en 8 coloris. Tailles 36–45. Emballage boîte individuelle.",
    features: ["Semelle EVA cushion", "8 coloris disponibles", "Tailles 36 à 45", "Tige mesh respirante", "Boîte individuelle incluse"],
    specifications: [
      { label: "Matière tige", value: "Mesh PU respirant" },
      { label: "Semelle", value: "EVA antidérapant" },
      { label: "Tailles", value: "36 à 45 EU" },
      { label: "Minimum commande", value: "5 paires" },
    ],
    reviews: [],
    related: ["6", "8", "10"],
  },
  {
    id: "5",
    title: "Sérum Visage Vitamine C Éclat",
    subtitle: "Soin anti-tâches — Formule concentrée 30ml",
    price: 950,
    oldPrice: 1600,
    minQty: 10,
    image: "/images/assets/item_5.jpg",
    images: ["/images/assets/item_5.jpg"],
    category: "beauty",
    origin: "Shanghai, Chine",
    weight: "0.08 kg",
    volume: "0.0005 CBM",
    rating: 4.8,
    reviewsCount: 415,
    description: "Sérum concentré à la Vitamine C 20%, acide hyaluronique et niacinamide. Formule anti-tâches, unificatrice du teint. Conditionnement 30ml avec pipette de précision. Certification cosmétique ISO.",
    features: ["Vitamine C 20% stabilisée", "Acide hyaluronique", "Niacinamide 5%", "30ml + pipette", "Certification ISO cosmétique"],
    specifications: [
      { label: "Contenance", value: "30 ml" },
      { label: "Contenant", value: "Flacon verre ambré" },
      { label: "Certification", value: "ISO 22716" },
      { label: "Minimum commande", value: "10 unités" },
    ],
    reviews: [],
    related: [],
  },
  {
    id: "6",
    title: "T-Shirt Graphic Streetwear Red Edition",
    subtitle: "Collection capsule — 100% Coton Premium",
    price: 1200,
    oldPrice: 2000,
    minQty: 10,
    image: "/images/assets/item_6.jpg",
    images: ["/images/assets/item_6.jpg", "/images/assets/item_8.jpg"],
    category: "fashion",
    origin: "Guangzhou, Chine",
    weight: "0.20 kg",
    volume: "0.002 CBM",
    rating: 4.3,
    reviewsCount: 221,
    description: "T-shirt oversize en coton 100% ring-spun 180g/m². Sérigraphie haute définition résistante aux lavages. Coupe streetwear ample. Disponible en S à 3XL.",
    features: ["Coton 100% ring-spun 180g/m²", "Sérigraphie HD lavable", "Coupe oversize", "Tailles S à 3XL"],
    specifications: [
      { label: "Matière", value: "100% Coton 180g/m²" },
      { label: "Impression", value: "Sérigraphie HD" },
      { label: "Tailles", value: "S à 3XL" },
      { label: "Minimum commande", value: "10 pièces" },
    ],
    reviews: [],
    related: ["4", "8"],
  },
  {
    id: "7",
    title: "Coffret Bijoux Doré 24k Luxury",
    subtitle: "Coffret bijoux plaqué or — Édition cadeau premium",
    price: 1800,
    oldPrice: 3000,
    minQty: 5,
    image: "/images/assets/item_7.jpg",
    images: ["/images/assets/item_7.jpg"],
    category: "fashion",
    badge: "TENDANCE",
    origin: "Yiwu, Chine",
    weight: "0.18 kg",
    volume: "0.001 CBM",
    rating: 4.6,
    reviewsCount: 87,
    description: "Coffret 5 pièces (bague, boucles, bracelet, collier, pendentif) plaqué or 24k anti-allergique. Boîte cadeau velours avec ruban. Idéal fête des mères, mariages, boutiques cadeaux.",
    features: ["Plaquage or 24k", "5 pièces par coffret", "Boîte velours incluse", "Anti-allergique", "Certifié nickel-free"],
    specifications: [
      { label: "Matière", value: "Alliage plaqué or 24k" },
      { label: "Pièces", value: "5 (bague, boucles, bracelet, collier, pendentif)" },
      { label: "Certification", value: "Nickel-free EU" },
      { label: "Minimum commande", value: "5 coffrets" },
    ],
    reviews: [],
    related: ["1", "4"],
  },
  {
    id: "8",
    title: "Veste Blouson Imperméable Workwear",
    subtitle: "Vêtement de travail — Coupe cargo utilitaire",
    price: 3200,
    oldPrice: 5000,
    minQty: 5,
    image: "/images/assets/item_8.jpg",
    images: ["/images/assets/item_8.jpg", "/images/assets/item_6.jpg"],
    category: "fashion",
    origin: "Hangzhou, Chine",
    weight: "0.6 kg",
    volume: "0.006 CBM",
    rating: 4.4,
    reviewsCount: 134,
    description: "Blouson de travail imperméable en polyester 600D avec doublure polaire amovible. 6 poches multi-fonctions, fermetures éclair YKK. Logo personnalisable sur commande >100 pièces.",
    features: ["Imperméable polyester 600D", "Doublure polaire amovible", "6 poches", "Fermetures YKK", "Logo personnalisable >100u"],
    specifications: [
      { label: "Matière", value: "Polyester 600D imperméable" },
      { label: "Doublure", value: "Polaire amovible" },
      { label: "Fermetures", value: "YKK" },
      { label: "Minimum commande", value: "5 pièces" },
    ],
    reviews: [],
    related: ["4", "6"],
  },
  {
    id: "9",
    title: "Gants Protection & Travail Cuir",
    subtitle: "EPI industriel — Norme EN388 certifiés",
    price: 750,
    oldPrice: 1400,
    minQty: 10,
    image: "/images/assets/item_9.jpg",
    images: ["/images/assets/item_9.jpg"],
    category: "machinery",
    origin: "Zhejiang, Chine",
    weight: "0.12 kg",
    volume: "0.0008 CBM",
    rating: 4.5,
    reviewsCount: 298,
    description: "Gants de protection en cuir fleur bovin avec renforts anti-coupure. Poignet velcro réglable. Certification EN388 niveau 4. Conditionnement paire individuelle + étiquetage personnalisable.",
    features: ["Cuir fleur bovin", "Anti-coupure EN388 Niv.4", "Poignet velcro réglable", "Étiquetage personnalisable"],
    specifications: [
      { label: "Matière", value: "Cuir fleur bovin" },
      { label: "Certification", value: "EN388 niveau 4" },
      { label: "Tailles", value: "S, M, L, XL" },
      { label: "Minimum commande", value: "10 paires" },
    ],
    reviews: [],
    related: [],
  },
  {
    id: "10",
    title: "Parka Rembourrée Capuche Fourrure",
    subtitle: "Manteau d'hiver — Garnissage duvet synthétique",
    price: 4800,
    oldPrice: 7500,
    minQty: 5,
    image: "/images/assets/item_10.jpg",
    images: ["/images/assets/item_10.jpg", "/images/assets/item_8.jpg"],
    category: "fashion",
    origin: "Changsha, Chine",
    weight: "0.9 kg",
    volume: "0.008 CBM",
    rating: 4.7,
    reviewsCount: 67,
    description: "Parka longue rembourrée duvet synthétique 80g, capuche amovible à fausse fourrure, imperméable DWR. Idéal hivernage, zones climatisées. Tailles S à 2XL.",
    features: ["Garnissage duvet synthétique 80g", "Capuche fourrure amovible", "Imperméable DWR", "Tailles S à 2XL"],
    specifications: [
      { label: "Matière", value: "Polyester DWR imperméable" },
      { label: "Garnissage", value: "Duvet synthétique 80g/m²" },
      { label: "Capuche", value: "Amovible — fausse fourrure" },
      { label: "Minimum commande", value: "5 pièces" },
    ],
    reviews: [],
    related: ["6", "8"],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(ids: string[]): Product[] {
  return PRODUCTS.filter((p) => ids.includes(p.id)).slice(0, 4);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}
