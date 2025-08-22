import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch'; // Si Node 18+, fetch est natif

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Contract Dexscreener pour Fartdog
const CONTRACT = 'EmidmqwsaEHV2qunR3brnQTyvWS9q7BM8CXyW9NmPrd';

const MILESTONES = [100000, 500000, 1000000, 5000000, 10000000];

export async function handler() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Récupérer la ligne du jour
    let { data: counter, error } = await supabase
      .from('counters')
      .select('*')
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Récupérer market cap depuis Dexscreener
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONTRACT}`);
    const dexData = await res.json();

    let marketCap = 0;
    if (dexData.pairs && dexData.pairs.length > 0) {
      marketCap = Number(dexData.pairs[0].marketCapUsd) || 0;
    }

    const clicksToday = Math.floor(marketCap); // 1 click par USD du market cap

    if (!counter) {
      await supabase.from('counters').insert({ date: today, clicks: clicksToday });
    } else {
      await supabase
        .from('counters')
        .update({ clicks: clicksToday })
        .eq('date', today);
    }

    // Total cumulé
    const { data: allCounters } = await supabase.from('counters').select('clicks');
    const totalClicks = allCounters.reduce((acc, row) => acc + row.clicks, 0);

    // Prochain palier
    const nextMilestone = MILESTONES.find(m => m > totalClicks) || MILESTONES[MILESTONES.length - 1];

    return {
      statusCode: 200,
      body: JSON.stringify({
        todayClicks,
        totalClicks,
        nextMilestone
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
}
