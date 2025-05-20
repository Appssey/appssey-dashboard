import { createClient } from '@supabase/supabase-js';

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export const handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Query the custom users table
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ count }),
  };
};
