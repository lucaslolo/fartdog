import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];

    let { data, error } = await supabaseClient
      .from('farts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      const { data: inserted, error: insertError } = await supabaseClient
        .from('farts')
        .insert({ date: today, dailycount: 0, lastreset: new Date().toISOString() })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);
      data = inserted;
    }

    const lastUpdate = new Date(data.lastreset);
    const now = new Date();
    let newCount = data.dailycount;

    if (now - lastUpdate >= 60000) {
      newCount += 1;
      const { error: updateError } = await supabaseClient
        .from('farts')
        .update({ dailycount: newCount, lastreset: now.toISOString() })
        .eq('date', today);
      if (updateError) throw new Error(updateError.message);
      data.dailycount = newCount;
      data.lastreset = now.toISOString();
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyCount: data.dailycount })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
}
