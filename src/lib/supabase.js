import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Don't throw — let app load and show the error visibly
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey)
export const supabaseUrl_debug = supabaseUrl ?? 'MISSING'
