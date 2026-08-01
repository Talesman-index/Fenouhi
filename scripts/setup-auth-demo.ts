import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ujxkxfsmbargtttoooam.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupAuth() {
  console.log("=================================================================");
  console.log("🔑 Initialisation des Comptes Auth Supabase de Démonstration");
  console.log("=================================================================");

  const clientEmail = process.env.DEMO_CLIENT_EMAIL || "client.demo@cargolink.africa";
  const tempPassClient = process.env.DEMO_CLIENT_PASSWORD || process.env.CLIENT_DEMO_PASS || "";

  const adminEmail = process.env.DEMO_ADMIN_EMAIL || "admin.demo@cargolink.africa";
  const tempPassAdmin = process.env.DEMO_ADMIN_PASSWORD || process.env.ADMIN_DEMO_PASS || "";

  if (!tempPassClient || !tempPassAdmin) {
    console.error("❌ ERREUR SÉCURITÉ : DEMO_CLIENT_PASSWORD et DEMO_ADMIN_PASSWORD sont requis.");
    process.exit(1);
  }

  // 1. CLIENT DEMO
  let clientUUID: string | null = null;
  const { data: clientAuth, error: clientErr } = await supabase.auth.signUp({
    email: clientEmail,
    password: tempPassClient,
    options: {
      data: {
        first_name: "Client",
        last_name: "Démo",
        role: "customer"
      }
    }
  });

  if (clientErr) {
    console.log(`  ℹ️ Compte Client Démo existant (${clientErr.message}). Tentative de connexion...`);
    const loginRes = await supabase.auth.signInWithPassword({
      email: clientEmail,
      password: tempPassClient
    });

    if (loginRes.data.user) {
      clientUUID = loginRes.data.user.id;
      console.log(`  ✓ Connexion réétablie avec succès. UUID Client : ${clientUUID}`);
    } else {
      console.log(`  ⚠️ Erreur de connexion client : ${loginRes.error?.message}`);
    }
  } else {
    clientUUID = clientAuth.user?.id || null;
    console.log(`  ✓ Création réussie du compte Client Démo. UUID Client : ${clientUUID}`);
  }

  // 2. ADMIN DEMO
  let adminUUID: string | null = null;
  const { data: adminAuth, error: adminErr } = await supabase.auth.signUp({
    email: adminEmail,
    password: tempPassAdmin,
    options: {
      data: {
        first_name: "Admin",
        last_name: "CargoLink",
        role: "admin"
      }
    }
  });

  if (adminErr) {
    console.log(`  ℹ️ Compte Admin Démo existant (${adminErr.message}). Tentative de connexion...`);
    const loginRes = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: tempPassAdmin
    });

    if (loginRes.data.user) {
      adminUUID = loginRes.data.user.id;
      console.log(`  ✓ Connexion réétablie avec succès. UUID Admin : ${adminUUID}`);
    } else {
      console.log(`  ⚠️ Erreur de connexion admin : ${loginRes.error?.message}`);
    }
  } else {
    adminUUID = adminAuth.user?.id || null;
    console.log(`  ✓ Création réussie du compte Admin Démo. UUID Admin : ${adminUUID}`);
  }

  // Update profiles table if UUIDs obtained
  if (clientUUID) {
    await supabase.from("profiles").upsert({
      id: clientUUID,
      email: clientEmail,
      first_name: "Client",
      last_name: "Démo",
      role: "customer",
      status: "active",
      account_type: "business",
      company_name: "Démo Import West Africa",
      phone: "+229 97 00 00 01",
      city: "Cotonou",
      country: "Bénin",
      updated_at: new Date().toISOString()
    });
  }

  if (adminUUID) {
    await supabase.from("profiles").upsert({
      id: adminUUID,
      email: adminEmail,
      first_name: "Admin",
      last_name: "CargoLink",
      role: "admin",
      status: "active",
      phone: "+229 97 00 00 00",
      city: "Cotonou",
      country: "Bénin",
      updated_at: new Date().toISOString()
    });
  }

  console.log("\n=================================================================");
  console.log("✅ Initialisation Auth Démo terminée avec succès !");
  console.log("=================================================================");
}

setupAuth();
