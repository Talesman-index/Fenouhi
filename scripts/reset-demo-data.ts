import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ujxkxfsmbargtttoooam.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const CLIENT_DEMO_EMAIL = process.env.DEMO_CLIENT_EMAIL || "client.demo@cargolink.africa";
const ADMIN_DEMO_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin.demo@cargolink.africa";
const ADMIN_DEMO_PASS = process.env.DEMO_ADMIN_PASSWORD || process.env.ADMIN_DEMO_PASS || "";

async function runResetDemoData() {
  console.log("=================================================================");
  console.log("🚀 Réinitialisation Sécurisée des Données de Démonstration CargoLink");
  console.log("=================================================================");

  if (!ADMIN_DEMO_PASS) {
    console.error("❌ ERREUR SÉCURITÉ : La variable DEMO_ADMIN_PASSWORD est requise pour réinitialiser l'environnement.");
    process.exit(1);
  }

  // 1. AUTHENTICATE AS ADMIN DEMO TO GET JWT TOKEN
  const baseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log("🔑 Authentification en tant qu'Administrateur Démo...");
  const { data: authData, error: authErr } = await baseClient.auth.signInWithPassword({
    email: ADMIN_DEMO_EMAIL,
    password: ADMIN_DEMO_PASS
  });

  if (authErr || !authData.session) {
    console.error("❌ Erreur de connexion Admin Démo:", authErr?.message);
    process.exit(1);
  }

  const token = authData.session.access_token;
  console.log("  ✓ Session Admin établie avec succès ! UUID Admin:", authData.user.id);

  // Authenticated client with JWT token in headers
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  async function safeUpsert(table: string, records: any[]) {
    const { error } = await supabase.from(table).upsert(records);
    if (error && error.message.includes("is_demo")) {
      const sanitized = records.map(({ is_demo, ...rest }) => rest);
      const { error: retryErr } = await supabase.from(table).upsert(sanitized);
      if (retryErr) {
        console.warn(`  ⚠️ Table ${table} upsert error:`, retryErr.message);
      } else {
        console.log(`  ✓ Table ${table}: ${records.length} enregistrements insérés (compatibilité).`);
      }
    } else if (error) {
      console.warn(`  ⚠️ Table ${table} upsert error:`, error.message);
    } else {
      console.log(`  ✓ Table ${table}: ${records.length} enregistrements de démonstration insérés.`);
    }
  }

  const clientUserId = "04a36ffb-c2e3-4407-aa52-8c45c52a9695";
  const adminUserId = authData.user.id;

  // 2. ENSURE PROFILES
  console.log("\n👤 Synchronisation des profils...");
  await safeUpsert("profiles", [
    {
      id: clientUserId,
      email: CLIENT_DEMO_EMAIL,
      first_name: "Client",
      last_name: "Démo",
      role: "customer",
      status: "active",
      account_type: "business",
      phone: "+229 97 00 00 01",
      city: "Cotonou",
      country: "Bénin",
      updated_at: new Date().toISOString()
    },
    {
      id: adminUserId,
      email: ADMIN_DEMO_EMAIL,
      first_name: "Admin",
      last_name: "CargoLink",
      role: "admin",
      status: "active",
      phone: "+229 97 00 00 00",
      city: "Cotonou",
      country: "Bénin",
      updated_at: new Date().toISOString()
    }
  ]);

  // 3. CLEAR OLD DEMO ROWS
  console.log("\n🧹 Nettoyage des anciennes données de démonstration (is_demo = TRUE)...");
  const tablesToClear = [
    "dispute_messages",
    "disputes",
    "shipment_events",
    "shipments",
    "payments",
    "order_items",
    "orders",
    "quotes",
    "notifications",
    "activity_logs"
  ];

  for (const table of tablesToClear) {
    try {
      const { error, count } = await supabase.from(table).delete({ count: "exact" }).eq("is_demo", true);
      if (!error) console.log(`  ✓ Table ${table}: ${count ?? 0} anciennes lignes démo nettoyées.`);
    } catch {}
  }

  // 4. QUOTES (Standard UUID hex format)
  console.log("\n📄 Génération des Devis de Démonstration (quotes)...");
  const quote1Id = "a1000000-0000-4000-a000-000000000001";
  const quote2Id = "a1000000-0000-4000-a000-000000000002";
  const quote3Id = "a1000000-0000-4000-a000-000000000003";

  await safeUpsert("quotes", [
    {
      id: quote1Id,
      quote_number: "DEV-DEMO-001",
      user_id: clientUserId,
      user_name: "Client Démo",
      user_email: CLIENT_DEMO_EMAIL,
      product_name: "Lot de 100 Écouteurs Bluetooth ANC SoundBass",
      product_link: "https://cargolink.africa/product/p1000000-0000-0000-0000-000000000002",
      quantity: 100,
      estimated_price: 2200,
      estimated_weight: 15,
      shipping_mode: "air",
      destination_country: "Bénin",
      destination_city: "Cotonou",
      status: "new",
      product_cost: 0,
      service_fee: 0,
      shipping_fee: 0,
      extra_fee: 0,
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: quote2Id,
      quote_number: "DEV-DEMO-002",
      user_id: clientUserId,
      user_name: "Client Démo",
      user_email: CLIENT_DEMO_EMAIL,
      product_name: "50 Montres Connectées SmartFit Pro X",
      product_link: "https://cargolink.africa/product/p1000000-0000-0000-0000-000000000001",
      quantity: 50,
      estimated_price: 3500,
      estimated_weight: 12.5,
      shipping_mode: "air",
      destination_country: "Bénin",
      destination_city: "Cotonou",
      status: "quote_sent",
      product_cost: 175000,
      service_fee: 8750,
      shipping_fee: 12500,
      extra_fee: 0,
      expiration_date: new Date(Date.now() + 86400000 * 14).toISOString(),
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: quote3Id,
      quote_number: "DEV-DEMO-003",
      user_id: clientUserId,
      user_name: "Client Démo",
      user_email: CLIENT_DEMO_EMAIL,
      product_name: "100 Gants de Protection & Travail Cuir",
      product_link: "https://cargolink.africa/product/p1000000-0000-0000-0000-000000000009",
      quantity: 100,
      estimated_price: 750,
      estimated_weight: 22,
      shipping_mode: "sea",
      destination_country: "Bénin",
      destination_city: "Cotonou",
      status: "accepted",
      product_cost: 75000,
      service_fee: 3750,
      shipping_fee: 15000,
      extra_fee: 0,
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ]);

  // 5. ORDERS
  console.log("\n📦 Génération des Commandes (orders)...");
  const order1Id = "b1000000-0000-4000-a000-000000000001";
  const order2Id = "b1000000-0000-4000-a000-000000000002";

  await safeUpsert("orders", [
    {
      id: order1Id,
      order_number: "CMD-DEMO-001",
      user_id: clientUserId,
      quote_id: quote2Id,
      amount: 196250,
      currency: "FCFA",
      order_status: "shipped",
      payment_status: "paid",
      shipping_mode: "air",
      destination_country: "Bénin",
      destination_city: "Cotonou",
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: order2Id,
      order_number: "CMD-DEMO-002",
      user_id: clientUserId,
      quote_id: quote3Id,
      amount: 93750,
      currency: "FCFA",
      order_status: "delivered",
      payment_status: "paid",
      shipping_mode: "sea",
      destination_country: "Bénin",
      destination_city: "Cotonou",
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 120).toISOString()
    }
  ]);

  // 6. ORDER ITEMS
  console.log("\n🛒 Génération des Articles de Commandes (order_items)...");
  await safeUpsert("order_items", [
    {
      id: "c1000000-0000-4000-a000-000000000001",
      order_id: order1Id,
      product_name: "Montre Connectée SmartFit Pro X",
      product_url: "https://cargolink.africa/product/p1000000-0000-0000-0000-000000000001",
      quantity: 50,
      unit_price: 3500,
      total_price: 175000,
      is_demo: true
    },
    {
      id: "c1000000-0000-4000-a000-000000000002",
      order_id: order2Id,
      product_name: "Gants de Protection & Travail Cuir",
      product_url: "https://cargolink.africa/product/p1000000-0000-0000-0000-000000000009",
      quantity: 100,
      unit_price: 750,
      total_price: 75000,
      is_demo: true
    }
  ]);

  // 7. PAYMENTS
  console.log("\n💳 Génération des Paiements (payments)...");
  await safeUpsert("payments", [
    {
      id: "d1000000-0000-4000-a000-000000000001",
      payment_ref: "PAY-DEMO-001",
      order_id: order1Id,
      user_id: clientUserId,
      amount: 196250,
      currency: "FCFA",
      payment_method: "Mobile Money",
      status: "paid",
      proof_of_payment_url: "https://cargolink.africa/images/demo/proof_mobile_money.png",
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 46).toISOString()
    },
    {
      id: "d1000000-0000-4000-a000-000000000002",
      payment_ref: "PAY-DEMO-002",
      order_id: order2Id,
      user_id: clientUserId,
      amount: 93750,
      currency: "FCFA",
      payment_method: "Virement Bancaire",
      status: "pending",
      proof_of_payment_url: "https://cargolink.africa/images/demo/proof_bank_transfer.png",
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 10).toISOString()
    }
  ]);

  // 8. SHIPMENTS & TIMELINE EVENTS
  console.log("\n🚚 Génération de l'Expédition & Suivi (shipments & shipment_events)...");
  const shipmentId = "e1000000-0000-4000-a000-000000000001";
  await safeUpsert("shipments", [
    {
      id: shipmentId,
      order_id: order1Id,
      tracking_number: "CL-DEMO-982410-BJ",
      carrier: "CargoLink Express",
      shipping_mode: "air",
      destination_country: "Bénin",
      destination_city: "Cotonou",
      status: "in_transit",
      current_location: "Aéroport International de Guangzhou Baiyun",
      estimated_arrival: new Date(Date.now() + 86400000 * 5).toISOString(),
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 40).toISOString()
    }
  ]);

  await safeUpsert("shipment_events", [
    {
      id: "f1000000-0000-4000-a000-000000000001",
      shipment_id: shipmentId,
      location: "Cotonou, Bénin",
      description: "Commande confirmée et paiement validé",
      status: "confirmed",
      event_time: new Date(Date.now() - 3600000 * 46).toISOString(),
      is_demo: true
    },
    {
      id: "f1000000-0000-4000-a000-000000000002",
      shipment_id: shipmentId,
      location: "Guangzhou, Chine",
      description: "Produits achetés auprès de l'usine partenaire",
      status: "purchased",
      event_time: new Date(Date.now() - 3600000 * 36).toISOString(),
      is_demo: true
    },
    {
      id: "f1000000-0000-4000-a000-000000000003",
      shipment_id: shipmentId,
      location: "Entrepôt Guangzhou",
      description: "Articles inspectés, pesés et emballés pour le transit",
      status: "warehoused",
      event_time: new Date(Date.now() - 3600000 * 24).toISOString(),
      is_demo: true
    },
    {
      id: "f1000000-0000-4000-a000-000000000004",
      shipment_id: shipmentId,
      location: "Aéroport Guangzhou Baiyun",
      description: "Colis dédouané en Chine et chargé dans le vol cargo Air France",
      status: "shipped",
      event_time: new Date(Date.now() - 3600000 * 12).toISOString(),
      is_demo: true
    },
    {
      id: "f1000000-0000-4000-a000-000000000005",
      shipment_id: shipmentId,
      location: "Vol International Cargo",
      description: "Vol en transit à destination de l'Aéroport de Cotonou Cadjehoun",
      status: "in_transit",
      event_time: new Date(Date.now() - 3600000 * 2).toISOString(),
      is_demo: true
    }
  ]);

  // 9. NOTIFICATIONS
  console.log("\n🔔 Génération des Notifications (notifications)...");
  await safeUpsert("notifications", [
    {
      id: "11000000-0000-4000-a000-000000000001",
      user_id: clientUserId,
      title: "Nouveau Devis Émis !",
      message: "Votre devis #DEV-DEMO-002 pour 50 Montres Connectées SmartFit Pro X est disponible à la validation.",
      type: "quote",
      is_read: false,
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "11000000-0000-4000-a000-000000000002",
      user_id: clientUserId,
      title: "Paiement Validé",
      message: "Votre règlement de 196.250 FCFA pour la commande #CMD-DEMO-001 a été validé avec succès.",
      type: "payment",
      is_read: false,
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 46).toISOString()
    },
    {
      id: "11000000-0000-4000-a000-000000000003",
      user_id: clientUserId,
      title: "Colis Expédié depuis la Chine",
      message: "L'expédition #CL-DEMO-982410-BJ est en cours de vol vers Cotonou.",
      type: "shipment",
      is_read: true,
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ]);

  // 10. DISPUTES & MESSAGES
  console.log("\n💬 Génération du Litige / Support (disputes & dispute_messages)...");
  const disputeId = "21000000-0000-4000-a000-000000000001";
  await safeUpsert("disputes", [
    {
      id: disputeId,
      ticket_number: "TKT-DEMO-001",
      order_id: order1Id,
      user_id: clientUserId,
      subject: "Vérification du délai d'arrivée du vol à Cotonou",
      description: "Bonjour, je souhaite confirmation de l'heure exacte d'atterrissage du vol cargo pour l'enlèvement.",
      priority: "medium",
      status: "in_progress",
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    }
  ]);

  await safeUpsert("dispute_messages", [
    {
      id: "31000000-0000-4000-a000-000000000001",
      dispute_id: disputeId,
      sender_id: clientUserId,
      sender_name: "Client Démo",
      message: "Bonjour, pouvez-vous me donner le numéro du vol d'acheminement ?",
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: "31000000-0000-4000-a000-000000000002",
      dispute_id: disputeId,
      sender_id: adminUserId,
      sender_name: "Admin CargoLink",
      message: "Bonjour Client Démo. Le vol Cargo AF-772 atterrira à l'Aéroport de Cotonou. Notre agent logistique effectue la sortie de douane.",
      is_demo: true,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ]);

  // 11. ACTIVITY LOGS
  console.log("\n📝 Enregistrement des Activity Logs de Démonstration...");
  await safeUpsert("activity_logs", [
    {
      id: "41000000-0000-4000-a000-000000000001",
      admin_id: adminUserId,
      admin_email: ADMIN_DEMO_EMAIL,
      action: "RESET_DEMO_ENVIRONMENT",
      entity_type: "system",
      entity_id: "demo-environment",
      new_values: { status: "success", demo_records_created: 25 },
      is_demo: true,
      created_at: new Date().toISOString()
    }
  ]);

  console.log("\n=================================================================");
  console.log("✅ Réinitialisation de l'environnement de démonstration terminée !");
  console.log("=================================================================");
}

runResetDemoData().catch((err) => {
  console.error("❌ Erreur lors de la réinitialisation des données de démo:", err);
  process.exit(1);
});
