import { createClient } from '@supabase/supabase-js'

// 🔑 REEMPLAZA CON TUS CREDENCIALES REALES DE SUPABASE
const SUPABASE_URL = 'https://rkphmriwjqkzsgqspdpp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_f5h0R-FNg2ubK70Zz65k5w_VhrtIwr4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);