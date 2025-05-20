import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const handler = async () => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 29); // 30 days including today

  // Query users created in the last 30 days
  const { data, error } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', startDate.toISOString());

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  // Count users per day
  const counts = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    counts[d.toISOString().slice(0, 10)] = 0;
  }
  data.forEach(user => {
    const day = user.created_at.slice(0, 10);
    if (counts[day] !== undefined) counts[day]++;
  });

  // Format for chart
  const result = Object.entries(counts).map(([date, count]) => ({ date, count }));

  return { statusCode: 200, body: JSON.stringify(result) };
}; 