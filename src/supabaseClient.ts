import { createClient } from '@supabase/supabase-js';

// En Next.js usamos NEXT_PUBLIC para que el cliente pueda acceder
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);