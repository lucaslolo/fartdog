import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Clé service Supabase (privée)
);

export async function handler() {
  const today = new Date().toISOString().split('T')[0];

  // Récupérer la ligne du jour
  let { data, error } = await supabase
    .from('farts')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (error) return { statusCode: 500, body: error.message };

  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from('farts')
      .insert({ date: today, dailyCount: 0 })
      .select()
      .single();
    data = inserted;
    if (insertError) return { statusCode: 500, body: insertError.message };
  }

  // Incrément global de 1
  const newCount = data.dailyCount + 1;
  const { error: updateError } = await supabase
    .from('farts')
    .update({ dailyCount: newCount })
    .eq('date', today);

  if (updateError) return { statusCode: 500, body: updateError.message };

  return { statusCode: 200, body: JSON.stringify({ dailyCount: newCount }) };
}