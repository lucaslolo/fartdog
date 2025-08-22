import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch'; // si Node 18+ sur Netlify, fetch est natif

// Variables d'environnement Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Contract Dexscreener pour Fartdog
const CONTRACT = '9jBxPfYJmaDuvpWT3b2J194NYrBWksxhNMZxvi31pump';

// Paliers
const MILESTONES = [100000, 500000, 1000000, 5000000, 10000000];

export async function handler() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Market cap depuis Dexscreener
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONTRACT}`);
    const dexData = await res.json();

    let marketCap = 0;
    if (dexData.pairs && dexData.pairs.length > 0) {
      marketCap = Number(dexData.pairs[0].marketCapUsd) || 0;
    }

    // Calcul des clics
    const clicksToday = Math.floor(marketCap);

    // Mise à jour Supabase
    let { data: counter } = await supabase
      .from('counters')
      .select('*')
      .eq('date', today)
      .single();

    if (!counter) {
      await supabase.from('counters').insert({ date: today, clicks: clicksToday });
    } else {
      await supabase.from('counters').update({ clicks: clicksToday }).eq('date', today);
    }

    // Total cumulé
    const { data: allCounters } = await supabase.from('counters').select('clicks');
    const totalClicks = allCounters.reduce((acc, row) => acc + row.clicks, 0);

    const nextMilestone = MILESTONES.find(m => m > totalClicks) || MILESTONES[MILESTONES.length - 1];

    return {
      statusCode: 200,
      body: JSON.stringify({
        todayClicks,
        totalClicks,
        nextMilestone,
        marketCap // affichage du market cap en direct
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
