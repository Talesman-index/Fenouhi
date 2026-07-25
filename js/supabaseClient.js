/**
 * CargoLink Africa - Supabase Client Setup (Browser JS)
 */
const SUPABASE_URL = "https://ujxkxfsmbargtttoooam.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ANc4XjBnSsp3i97FSbn2oA_lD3-NrsS";

let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase Client Initialized for CargoLink Africa");
  }
  return supabaseClient;
}

// Auto-initialize if script loaded
if (window.supabase) {
  getSupabase();
}
