import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async () => {
  // Fetch all apps with description, logo_url, category_id, and tagline
  const { data: apps, error } = await supabase
    .from('apps')
    .select('id, name, description, logo_url, category_id, tagline');

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  // Fetch all categories
  const { data: categories } = await supabase.from('categories').select('id, name');

  // Fetch all screenshots
  const { data: screenshots } = await supabase.from('screens').select('id, app_id, url, alt');

  // Map screenshots and category name to each app
  const mapped = (apps || []).map(app => ({
    ...app,
    logo: app.logo_url,
    description: app.description,
    category: categories?.find(c => c.id === app.category_id)?.name || '',
    screens: (screenshots || []).filter(s => s.app_id === app.id)
  }));

  return { statusCode: 200, body: JSON.stringify(mapped) };
}; 