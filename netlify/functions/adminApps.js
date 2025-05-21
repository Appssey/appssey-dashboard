import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      // List all apps with categories and screenshots
      const { data, error } = await supabase
        .from('apps')
        .select('id, name, description, tagline, logo_url, category_id, created_at');
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify(data) };
    }
    if (event.httpMethod === 'POST') {
      // Add new app
      const { name, description, tagline, logo_url, category_id, screenshots } = JSON.parse(event.body || '{}');
      if (!name || !logo_url) return { statusCode: 400, body: JSON.stringify({ error: 'Name and logo are required' }) };
      const { data, error } = await supabase.from('apps').insert([{ name, description, tagline, logo_url, category_id }]).select();
      if (error) throw error;
      const app = data[0];
      // Insert screenshots into 'screens' table if provided
      if (Array.isArray(screenshots) && app) {
        await supabase.from('screens').insert(
          screenshots.map(url => ({ app_id: app.id, url }))
        );
      }
      return { statusCode: 200, body: JSON.stringify(app) };
    }
    if (event.httpMethod === 'PATCH') {
      // Edit app
      const { id, name, description, tagline, logo_url, category_id, screenshots } = JSON.parse(event.body || '{}');
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing app id' }) };
      const { error } = await supabase.from('apps').update({ name, description, tagline, logo_url, category_id }).eq('id', id);
      if (error) throw error;
      // Optionally, add new screenshots if provided
      if (Array.isArray(screenshots) && screenshots.length > 0) {
        await supabase.from('screens').insert(
          screenshots.map(url => ({ app_id: id, url }))
        );
      }
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    if (event.httpMethod === 'DELETE') {
      // Delete app and its screenshots
      const { id } = JSON.parse(event.body || '{}');
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing app id' }) };
      await supabase.from('screens').delete().eq('app_id', id);
      const { error } = await supabase.from('apps').delete().eq('id', id);
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    console.error('adminApps error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Internal Server Error' }) };
  }
}; 