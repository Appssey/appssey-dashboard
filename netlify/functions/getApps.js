import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async () => {
  // Fetch all apps with related screens in a single query
  const { data: apps, error } = await supabase
    .from('apps')
    .select('*, screens(*)');

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  // Fetch all categories
  const { data: categories } = await supabase.from('categories').select('id, name');

  // Map category name to each app
  const mapped = (apps || []).map(app => ({
    ...app,
    logo: app.logo_url,
    description: app.description,
    category: categories?.find(c => c.id === app.category_id)?.name || '',
    screens: app.screens || []
  }));

  return { statusCode: 200, body: JSON.stringify(mapped) };
}; 