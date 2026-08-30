const fs = require('fs');
const path = require('path');

const customFilePath = path.join(__dirname, '..', 'data', 'custom-products.json');

const iphone15ProWithVariants = {
  id: "iphone-15-pro-max",
  name: "iPhone 15 Pro Max (Titane & Puce A17 Pro)",
  slug: "iphone-15-pro-max",
  short_description: "Design en titane de qualité aérospatiale, puce A17 Pro, bouton Action personnalisable et zoom optique 5x.",
  description: "L'iPhone 15 Pro Max est forgé dans un titane ultra-résistant et léger, avec des bordures profilées et un bouton Action révolutionnaire. Doté de la puce A17 Pro pour des performances graphiques de pointe et d'un système photo professionnel avec téléobjectif 5x.",
  category_id: "c1000000-0000-0000-0000-000000000001",
  subcategory: "Smartphones Apple",
  price: 420000,
  wholesale_price_5_units: 395000,
  cargolink_margin_percent: 5,
  air_freight_rate_per_kg: 0,
  sea_freight_rate_per_cbm: 0,
  currency: "FCFA",
  stock_quantity: 50,
  minimum_order_quantity: 1,
  country_of_origin: "Apple International (Certifié)",
  weight: 0.22,
  length: 16,
  width: 8,
  height: 2,
  available_shipping_modes: ["air", "sea"],
  estimated_delivery_time: "Livraison Directe Cotonou (24-48h)",
  status: "active",
  is_demo: false,
  is_featured: true,
  has_variants: true,
  attributes_definition: [
    {
      name: "Capacité",
      values: ["128 Go", "256 Go", "512 Go", "1 To"]
    },
    {
      name: "Grade & État",
      values: ["Grade A", "Grade B", "Scellé (Neuf)"]
    },
    {
      name: "Couleur",
      values: ["Titane Naturel", "Titane Noir", "Titane Blanc", "Bleu Titane"]
    }
  ],
  variants: [
    {
      id: "var_iph15p_128_gra_nat",
      sku: "IPH15P-128-GRA-NAT",
      title: "128 Go • Grade A • Titane Naturel",
      attributes: {
        "Capacité": "128 Go",
        "Grade & État": "Grade A",
        "Couleur": "Titane Naturel"
      },
      price: 420000,
      wholesale_price_5_units: 390000,
      stock_quantity: 12,
      is_active: true,
      image_url: "/images/assets/hero_iphone16.png"
    },
    {
      id: "var_iph15p_256_gra_nat",
      sku: "IPH15P-256-GRA-NAT",
      title: "256 Go • Grade A • Titane Naturel",
      attributes: {
        "Capacité": "256 Go",
        "Grade & État": "Grade A",
        "Couleur": "Titane Naturel"
      },
      price: 470000,
      wholesale_price_5_units: 440000,
      stock_quantity: 18,
      is_active: true,
      image_url: "/images/assets/hero_iphone16.png"
    },
    {
      id: "var_iph15p_256_grb_nat",
      sku: "IPH15P-256-GRB-NAT",
      title: "256 Go • Grade B • Titane Naturel",
      attributes: {
        "Capacité": "256 Go",
        "Grade & État": "Grade B",
        "Couleur": "Titane Naturel"
      },
      price: 395000,
      wholesale_price_5_units: 370000,
      stock_quantity: 9,
      is_active: true,
      image_url: "/images/assets/hero_iphone16.png"
    },
    {
      id: "var_iph15p_128_grb_nat",
      sku: "IPH15P-128-GRB-NAT",
      title: "128 Go • Grade B • Titane Naturel",
      attributes: {
        "Capacité": "128 Go",
        "Grade & État": "Grade B",
        "Couleur": "Titane Naturel"
      },
      price: 360000,
      wholesale_price_5_units: 335000,
      stock_quantity: 6,
      is_active: true,
      image_url: "/images/assets/hero_iphone16.png"
    },
    {
      id: "var_iph15p_512_gra_nat",
      sku: "IPH15P-512-GRA-NAT",
      title: "512 Go • Grade A • Titane Naturel",
      attributes: {
        "Capacité": "512 Go",
        "Grade & État": "Grade A",
        "Couleur": "Titane Naturel"
      },
      price: 540000,
      wholesale_price_5_units: 510000,
      stock_quantity: 5,
      is_active: true,
      image_url: "/images/assets/hero_iphone16.png"
    },
    {
      id: "var_iph15p_256_gra_blk",
      sku: "IPH15P-256-GRA-BLK",
      title: "256 Go • Grade A • Titane Noir",
      attributes: {
        "Capacité": "256 Go",
        "Grade & État": "Grade A",
        "Couleur": "Titane Noir"
      },
      price: 470000,
      wholesale_price_5_units: 440000,
      stock_quantity: 8,
      is_active: true,
      image_url: "/images/assets/hero_iphone16.png"
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: {
    id: "c1000000-0000-0000-0000-000000000001",
    icon: "Smartphone",
    name: "High-Tech & Smartphones",
    slug: "electronics",
    is_active: true
  },
  images: [
    {
      id: "img-iph15p-0",
      product_id: "iphone-15-pro-max",
      public_image_url: "/images/assets/hero_iphone16.png",
      position: 0,
      is_primary: true
    }
  ]
};

let list = [];
try {
  if (fs.existsSync(customFilePath)) {
    list = JSON.parse(fs.readFileSync(customFilePath, 'utf8'));
  }
} catch (e) {
  list = [];
}

list = list.filter(p => p.id !== iphone15ProWithVariants.id && p.slug !== iphone15ProWithVariants.slug);
list.unshift(iphone15ProWithVariants);
fs.writeFileSync(customFilePath, JSON.stringify(list, null, 2), 'utf8');
console.log("Seeded iPhone 15 Pro with variants! Total items:", list.length);
