import { createClient } from '@supabase/supabase-js';

// ⚠️ Ces variables doivent être définies dans Netlify → Site Settings → Build & Deploy → Environment

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Fonction Netlifyhf
export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1) Récupérer la ligne du jour
    let { data, error } = await supabase
      .from('farts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // 2) Si la ligne n'existe pas, créer
    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('farts')
        .insert({ date: today, dailyCount: 0, lastReset: new Date().toISOString() })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      data = inserted;
    }

    // 3) Incrément global de 1
    const newCount = (data.dailyCount ?? 0) + 1;

    const { error: updateError } = await supabase
      .from('farts')
      .update({ dailyCount: newCount })
      .eq('date', today);

    if (updateError) throw new Error(updateError.message);

    return {
      statusCode: 200,
      body: JSON.stringify({ dailyCount: newCount }),
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}
