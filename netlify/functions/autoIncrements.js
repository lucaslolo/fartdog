import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Récupérer la ligne du jour
    let { data, error } = await supabase
      .from('farts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Si pas de ligne, créer
    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('farts')
        .insert({ date: today, dailyCount: 0, lastReset: new Date().toISOString() })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      data = inserted;
    }

    // Incrémentation
    const newCount = (data.dailyCount ?? 0) + 1;

    const { error: updateError } = await supabase
      .from('farts')
      .update({ dailyCount: newCount })
      .eq('date', today);

    if (updateError) throw new Error(updateError.message);

    console.log(`Auto increment done: ${newCount}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ dailyCount: newCount }),
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}
