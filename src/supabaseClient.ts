import { supabase as libSupabase, getSupabaseConfig } from './lib/supabase';
import { createClient } from '@supabase/supabase-js';

const config = getSupabaseConfig();
export const supabase = libSupabase || createClient(config.url || 'https://placeholder.supabase.co', config.anonKey || 'placeholder');
