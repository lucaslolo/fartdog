import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function handler(event, context) {
  console.log('Scheduled function triggered at:', new Date().toISOString());

  try {
    // Exemple : incrémenter le compteur global
    const { data, error } = await supabase
      .from('counter')
      .update({ dailyCount: supabase.rpc('increment_counter') }) // Si tu as une fonction RPC
      .eq('id', 1); // Ou ta condition pour identifier la ligne

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Compteur mis à jour avec succès', data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
