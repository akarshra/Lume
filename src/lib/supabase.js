import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mhgwiaxyjposlxeyexzg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MtVGSSTEdgSVGEfbgACC3A_3zL7C0x_';

export const supabase = createClient(supabaseUrl, supabaseKey);
