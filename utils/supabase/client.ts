import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ujxkxfsmbargtttoooam.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ANc4XjBnSsp3i97FSbn2oA_lD3-NrsS";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
