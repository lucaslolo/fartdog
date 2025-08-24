import { createClient } from '@supabase/supabase-js';

// Vérifie que les variables d'environnement existent
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'MISSING');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'OK' : 'MISSING');

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function handler(event, context) {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Today:', today);

    // Récupérer la ligne du jour
    console.log('Fetching today row from farts...');
    let { data, error } = await supabaseClient
      .from('farts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching today row:', error);
      throw new Error(error.message);
    }
    console.log('Data fetched:', data);

    // Si aucune ligne, créer une nouvelle
    if (!data) {
      console.log('No row for today, inserting new row...');
      const { data: inserted, error: insertError } = await supabaseClient
        .from('farts')
        .insert({
          date: today,
          dailycount: 0,              // correspond à ta table
          lastreset: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message);
      }
      data = inserted;
      console.log('Inserted data:', data);
    }

    // Incrément toutes les minutes
    const lastUpdate = new Date(data.lastreset);
    const now = new Date();
    let newCount = data.dailycount;
    console.log('Last update:', lastUpdate, 'Now:', now, 'Current count:', newCount);

    if (now - lastUpdate >= 60000) { // 1 min
      newCount += 1;
      console.log('Incrementing count to:', newCount);

      const { error: updateError } = await supabaseClient
        .from('farts')
        .update({ dailycount: newCount, lastreset: now.toISOString() })
        .eq('date', today);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(updateError.message);
      }
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
