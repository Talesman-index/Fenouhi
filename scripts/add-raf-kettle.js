const fs = require('fs');
const path = require('path');

const customFilePath = path.join(__dirname, '..', 'data', 'custom-products.json');

const newProduct = {
  id: "raf-electric-kettle-r7928",
  name: "Chauffe-eau Électrique RAF R.7928 (2.3L - 1800W Inox)",
  slug: "chauffe-eau-electrique-raf-r7928-2-3l-1800w",
  short_description: "Bouilloire électrique rapide 2.3L 1800W en acier inoxydable avec arrêt automatique, socle 360° et intérieur sans BPA.",
  description: "Découvrez le Chauffe-eau Électrique / Bouilloire Inox RAF R.7928 haute performance 1800W. Doté d'une grande capacité de 2.3 Litres et d'un corps robuste en acier inoxydable brossé de qualité alimentaire (sans BPA), il assure une ébullition ultra-rapide de votre eau en quelques minutes seulement. Équipé d'un système de sécurité avancé avec arrêt automatique après ébullition, protection anti-chauffe à sec, témoin lumineux LED et socle pivotant 360° sans fil avec poignée ergonomique anti-brûlure.",
  category_id: "c1000000-0000-0000-0000-000000000002",
  subcategory: "Électroménager & Cuisine",
  price: 7000,
  wholesale_price_5_units: 5500,
  cargolink_margin_percent: 5,
  air_freight_rate_per_kg: 0,
  sea_freight_rate_per_cbm: 0,
  currency: "FCFA",
  stock_quantity: 150,
  minimum_order_quantity: 1,
  country_of_origin: "Direct Usine RAF International",
  weight: 0.9,
  length: 22,
  width: 18,
  height: 25,
  available_shipping_modes: ["air", "sea"],
  estimated_delivery_time: "Livraison Directe Cotonou & Envois Régionaux",
  status: "active",
  is_demo: false,
  is_featured: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: {
    id: "c1000000-0000-0000-0000-000000000002",
    icon: "Home",
    name: "Maison & Électroménager",
    slug: "home",
    is_active: true,
    description: "Appareils électroménagers, cuisine et maison."
  },
  images: [
    {
      id: "img-raf-kettle-0",
      product_id: "raf-electric-kettle-r7928",
      public_image_url: "/images/assets/chauffe_eau_raf_r7928.png",
      position: 0,
      is_primary: true
    }
  ]
};

let list = [];
try {
  if (fs.existsSync(customFilePath)) {
    const raw = fs.readFileSync(customFilePath, 'utf8');
    list = JSON.parse(raw);
  }
} catch (e) {
  list = [];
}

// Remove any existing with same id or slug
list = list.filter(p => p.id !== newProduct.id && p.slug !== newProduct.slug);
// Add to beginning
list.unshift(newProduct);

fs.writeFileSync(customFilePath, JSON.stringify(list, null, 2), 'utf8');
console.log("Successfully added RAF kettle to custom-products.json! Total items:", list.length);
