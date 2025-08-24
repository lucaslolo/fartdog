import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // clé service Supabase (privée)
);

export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];

    let { data, error } = await supabase
      .from('farts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('farts')
        .insert({ date: today, dailyCount: 0, lastReset: new Date().toISOString() })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);
      data = inserted;
    }

    // Incrément de 1 toutes les minutes côté Netlify
    const lastUpdate = new Date(data.lastReset);
    const now = new Date();
    let newCount = data.dailyCount;
    if (now - lastUpdate >= 60000) { // 1 min
      newCount += 1;
      await supabase
        .from('farts')
        .update({ dailyCount: newCount, lastReset: now.toISOString() })
        .eq('date', today);
    }

    return { statusCode: 200, body: JSON.stringify({ dailyCount: newCount }) };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}
