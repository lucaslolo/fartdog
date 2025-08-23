import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function handler(event) {
  const { action, count } = JSON.parse(event.body || '{}');
  const today = new Date().toISOString().split('T')[0];

  if(action === 'get') {
    const { data } = await supabase.from('farts').select('*').eq('date', today).single();
    return { statusCode: 200, body: JSON.stringify(data || { date: today, dailyCount: 0, lastReset: new Date() }) };
  }

  if(action === 'increment') {
    const { data } = await supabase.from('farts').upsert({
      date: today,
      dailyCount: count,
      lastReset: new Date()
    }, { onConflict: ['date'] }).select().single();
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  return { statusCode: 400, body: 'Invalid action' };
}
