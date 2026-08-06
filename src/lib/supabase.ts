import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkwbkbnipetgthhcmwin.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GfmTBqaQKtsm69jEc0y16Q_k9ken_B1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
