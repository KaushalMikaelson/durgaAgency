import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://kaqzewmqeenytdmaekwc.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_suyC5aRbXF3kFX_kczYMnA_c_UVX3db';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
