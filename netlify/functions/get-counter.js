import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function handler() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('farts')
      .select('dailyCount')
      .eq('date', today)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return {
      statusCode: 200,
      body: JSON.stringify({ value: data?.dailyCount ?? 0 })
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}
