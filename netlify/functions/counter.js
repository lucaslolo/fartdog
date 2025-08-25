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
        .insert({ date: today, dailycount: 0, lastreset: new Date().toISOString() })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);
      data = inserted;
    }

    // Récupère la date de la dernière mise à jour et l'heure actuelle
    const lastUpdate = new Date(data.lastreset);
    const now = new Date();
    let newCount = data.dailycount;

    // Si plus de 1 seconde s'est écoulée depuis la dernière mise à jour, incrémente le compteur
    if (now - lastUpdate >= 1000) {
      newCount += 1;
      const { error: updateError } = await supabaseClient
        .from('farts')
        .update({ dailycount: newCount, lastreset: now.toISOString() })
        .eq('date', today);
      if (updateError) throw new Error(updateError.message);
      data.dailycount = newCount;
      data.lastreset = now.toISOString();
    }

    // Retourne le dailyCount actuel au client
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyCount: data.dailycount })
    };
  } catch (err) {
    // Gestion des erreurs : retourne le message d'erreur au client
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
}