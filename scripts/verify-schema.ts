import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ujxkxfsmbargtttoooam.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin.demo@cargolink.africa";
const ADMIN_PASS = process.env.DEMO_ADMIN_PASSWORD || process.env.ADMIN_DEMO_PASS || "";

const tablesToCheck = [
  "quotes",
  "orders",
  "order_items",
  "payments",
  "shipments",
  "shipment_events",
  "disputes",
  "dispute_messages",
  "notifications",
  "activity_logs"
];

async function verifySchema() {
  console.log("=================================================================");
  console.log("🔍 1. VÉRIFICATION DES COLONNES is_demo (SESSION ADMIN DÉMO)");
  console.log("=================================================================");

  if (!ADMIN_PASS) {
    console.error("❌ ERREUR SÉCURITÉ : La variable DEMO_ADMIN_PASSWORD est requise.");
    process.exit(1);
  }

  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS
  });

  if (authErr || !auth.user) {
    console.error("❌ Erreur Auth Admin :", authErr?.message);
    return;
  }

  console.log("✅ Authentifié en tant qu'Admin Démo (UUID:", auth.user.id, ")");

  const columnResults: Record<string, boolean> = {};

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select("is_demo").limit(1);
    if (error) {
      columnResults[table] = false;
      console.log(`❌ Table '${table}' : ${error.message}`);
    } else {
      columnResults[table] = true;
      console.log(`✅ Table '${table}' : Colonne 'is_demo' ACCESSIBLE et PRÉSENTE !`);
    }
  }

  console.log("\nSummary Columns:", columnResults);
}

verifySchema();
