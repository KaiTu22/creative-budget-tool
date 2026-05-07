import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rfdlauitzantmthiqdbq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XzESHh3i7AfNfpYuuU3Yww_QlfM8pax'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)