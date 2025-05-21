const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify(data) };
    }
    if (event.httpMethod === 'POST') {
      const { name } = JSON.parse(event.body || '{}');
      if (!name) return { statusCode: 400, body: JSON.stringify({ error: 'Name is required' }) };
      const { data, error } = await supabase.from('categories').insert([{ name }]).select();
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify(data[0]) };
    }
    if (event.httpMethod === 'PATCH') {
      const { id, name } = JSON.parse(event.body || '{}');
      if (!id || !name) return { statusCode: 400, body: JSON.stringify({ error: 'ID and name are required' }) };
      const { error } = await supabase.from('categories').update({ name }).eq('id', id);
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body || '{}');
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'ID is required' }) };
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    console.error('adminCategories error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Internal Server Error' }) };
  }
}; 