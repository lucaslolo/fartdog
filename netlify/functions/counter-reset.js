import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabaseClient
      .from('farts')
      .update({ dailycount: 0, lastreset: new Date().toISOString() })
      .eq('date', today);
    if (error) throw new Error(error.message);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
}
