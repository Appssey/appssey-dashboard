import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async () => {
  const { data, error } = await supabase.from('apps').select('id, name, logo_url');
  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
  // Map logo_url to logo for frontend compatibility
  const mapped = (data || []).map(app => ({ ...app, logo: app.logo_url }));
  return { statusCode: 200, body: JSON.stringify(mapped) };
}; 