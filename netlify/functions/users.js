import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // List/search users
    const search = event.queryStringParameters?.search || '';
    let query = supabase
      .from('users')
      .select('id, email, created_at, name, status')
      .order('created_at', { ascending: false });
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }
    const { data, error } = await query;
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  if (event.httpMethod === 'PATCH') {
    // Deactivate or Reactivate user
    const { id, action } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing user id' }) };
    let newStatus = null;
    if (action === 'reactivate') newStatus = 'active';
    if (action === 'deactivate' || !action) newStatus = 'inactive';
    if (!newStatus) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (event.httpMethod === 'DELETE') {
    // Soft delete user (set status to 'deleted')
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing user id' }) };
    const { error } = await supabase
      .from('users')
      .update({ status: 'deleted' })
      .eq('id', id);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (event.httpMethod === 'POST') {
    // Add user (admin)
    const { email, name, status } = JSON.parse(event.body || '{}');
    if (!email || !name) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and name are required' }) };
    }
    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, status')
      .eq('email', email);
    if (existing && existing.length > 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User with this email already exists' }) };
    }
    // Insert new user
    const { error } = await supabase.from('users').insert([
      {
        email,
        name,
        status: status || 'active',
      }
    ]);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
}; 