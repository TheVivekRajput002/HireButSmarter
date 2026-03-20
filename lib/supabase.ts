// lib/supabase.ts — Supabase client setup

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Browser client — safe to use in client components
export const supabase = supabaseUrl && anonKey ? createClient(supabaseUrl, anonKey) : null;

// Server client — API routes only, never expose to client
export const supabaseServer = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;
