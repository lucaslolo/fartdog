import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement Netlify
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Clé service Supabase (privée)
);

export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1️⃣ Lire la ligne du jour
    let { data, error } = await supabase
      .from('farts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Select error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    // 2️⃣ Créer la ligne si elle n'existe pas
    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('farts')
        .insert({ date: today, dailyCount: 0 })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return { statusCode: 500, body: JSON.stringify({ error: insertError.message }) };
      }

      data = inserted;
    }

    // 3️⃣ Incrémenter le compteur global de 1
    const newCount = Number(data.dailyCount) + 1;
    const { error: updateError } = await supabase
      .from('farts')
      .update({ dailyCount: newCount })
      .eq('date', today);

    if (updateError) {
      console.error('Update error:', updateError);
      return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) };
    }

    // 4️⃣ Retourner le nouveau compteur
    return {
      statusCode: 200,
      body: JSON.stringify({ dailyCount: newCount })
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}