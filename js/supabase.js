const SUPABASE_URL = "https://rkttoazvynfglojrymte.supabase.co";
const SUPABASE_KEY = "sb_publishable_MyyoMhPNCsmEaY1oJkV1vg_i3Vgkl_q";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Supabase library failed to load. Check the CDN URL or network connection.");
} else {
    window.camusSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}