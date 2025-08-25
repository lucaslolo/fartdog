// Importation du client Supabase
import { createClient } from '@supabase/supabase-js';

// Création du client Supabase avec les variables d'environnement Netlify
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);


// Fonction handler appelée par Netlify à chaque requête
export async function handler(event, context) {
  try {
    // Récupère la date du jour au format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Cherche la ligne du jour dans la table 'farts'
    let { data, error } = await supabaseClient
      .from('farts')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    // Si erreur lors de la récupération, on la remonte
    if (error) throw new Error(error.message);

    // Si aucune ligne pour aujourd'hui, on en crée une avec dailycount à 0
    if (!data) {
      const { data: inserted, error: insertError } = await supabaseClient
        .from('farts')
        .insert({ date: today, dailyCount: 0, lastReset: new Date().toISOString()})
        //.insert({ date: today, dailyCount: 0, lastReset: new Date().toISOString(), averageClickMarketcapPerMinute: 0 })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);
      data = inserted;
    }

    // Récupère la date de la dernière mise à jour et l'heure actuelle
    const lastUpdate = new Date(data.lastReset);
    const now = new Date();
    let newCount = data.dailyCount;
    //let averageClickMarketcapPerMinute = data.averageClickMarketcapPerMinute;

    // Si plus de 60 secondes se sont écoulées depuis la dernière mise à jour, incrémente le compteur
    if (now - lastUpdate >= 60000) {
      newCount += 1;
      //newCount += averageClickMarketcapPerMinute;
      const { error: updateError } = await supabaseClient
        .from('farts')
        .update({ dailyCount: newCount, lastReset: now.toISOString()})
        //.update({ dailyCount: newCount, lastReset: now.toISOString(), averageClickMarketcapPerMinute: 0 })
        .eq('date', today);
      if (updateError) throw new Error(updateError.message);
      data.dailyCount = newCount;
      data.lastReset = now.toISOString();
      //data.averageClickMarketcapPerMinute = 0;
    }

    // Retourne le dailyCount actuel au client
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyCount: data.dailycount })
    };
  } catch (err) {
    // Gestion des erreurs : retourne le message d'erreur au clientf
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
}
