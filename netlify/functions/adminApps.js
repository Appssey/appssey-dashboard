import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // List all apps with categories and screenshots
    const { data, error } = await supabase
      .from('apps')
      .select('id, name, description, logo_url, category_ids, created_at');
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    // Optionally join categories and screenshots here if needed
    return { statusCode: 200, body: JSON.stringify(data) };
  }
  if (event.httpMethod === 'POST') {
    // Add new app
    const { name, description, logo_url, category_ids, screenshots } = JSON.parse(event.body || '{}');
    if (!name || !logo_url) return { statusCode: 400, body: JSON.stringify({ error: 'Name and logo are required' }) };
    const { data, error } = await supabase.from('apps').insert([{ name, description, logo_url, category_ids }]).select();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    const app = data[0];
    // Insert screenshots if provided
    if (Array.isArray(screenshots) && app) {
      await supabase.from('screenshots').insert(screenshots.map(url => ({ app_id: app.id, url })));
    }
    return { statusCode: 200, body: JSON.stringify(app) };
  }
  if (event.httpMethod === 'PATCH') {
    // Edit app
    const { id, name, description, logo_url, category_ids } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing app id' }) };
    const { error } = await supabase.from('apps').update({ name, description, logo_url, category_ids }).eq('id', id);
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }
  if (event.httpMethod === 'DELETE') {
    // Delete app and its screenshots
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing app id' }) };
    await supabase.from('screenshots').delete().eq('app_id', id);
    const { error } = await supabase.from('apps').delete().eq('id', id);
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }
  return { statusCode: 405, body: 'Method Not Allowed' };
}; 