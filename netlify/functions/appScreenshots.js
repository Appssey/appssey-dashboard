import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async (event) => {
  const appId = event.queryStringParameters?.appId;
  if (!appId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing appId' }) };
  }
  const { data, error } = await supabase
    .from('screenshots')
    .select('id, url, tags')
    .eq('app_id', appId);
  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
  return { statusCode: 200, body: JSON.stringify(data) };
};
