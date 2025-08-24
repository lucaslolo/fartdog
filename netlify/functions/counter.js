import { createClient } from '@supabase/supabase-js';

// Crée le client Supabase avec la clé service (privée, côté serveur)
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Récupère la ligne du jour, s'il y en a une
    let { data, error } = await supabaseClient
      .from('farts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Si aucune ligne du jour, créer une nouvelle
    if (!data) {
      const { data: inserted, error: insertError } = await supabaseClient
        .from('farts')
        .insert({ date: today, dailycount: 0, lastreset: new Date().toISOString() })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      data = inserted;
    }

    // Incrément toutes les minutes (si au moins 1 min depuis le dernier update)
    const lastUpdate = new Date(data.lastreset);
    const now = new Date();
    let newCount = data.dailycount;

    if (now - lastUpdate >= 60000) { // 1 min
      newCount += 1;
      const { error: updateError } = await supabaseClient
        .from('farts')
        .update({ dailycount: newCount, lastreset: now.toISOString() })
        .eq('date', today);

      if (updateError) throw new Error(updateError.message);
    }

    // Retour JSON correct
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyCount: newCount })
    };
  } catch (err) {
    console.error('Netlify function error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
}