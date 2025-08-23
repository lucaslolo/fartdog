import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Vérifie si une ligne existe pour aujourd'hui
    let { data, error } = await supabase
      .from('farts')
      .select('*')
      .eq('date', today);

    if (error) throw error;

    if (data.length === 0) {
      // Si pas encore de ligne, créer une entrée
      const { error: insertError } = await supabase
        .from('farts')
        .insert([{ date: today, count: 1 }]);
      if (insertError) throw insertError;
    } else {
      // Incrémenter le compteur
      const { error: updateError } = await supabase
        .from('farts')
        .update({ count: data[0].count + 1 })
        .eq('date', today);
      if (updateError) throw updateError;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Fart incremented successfully!' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
