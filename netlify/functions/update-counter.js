import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Paliers
const MILESTONES = [100000, 500000, 1000000, 5000000, 10000000];

export async function handler() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Market cap depuis DexScreener Solana
    const tokenAddress = 'EmidmqwsaEHV2qunR3brnQTyvWS9q7BM8CXyW9NmPrd';
    const blockchain = 'solana';
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${blockchain}/${tokenAddress}`);
    const dataResp = await response.json();
    let marketCap = dataResp?.pairs?.[0]?.marketCap || 100000000; // valeur par défaut si aucune donnée

    // Calcul des clics
    const clicksToday = Math.floor(marketCap);

    // Vérification dans Supabase
    let { data: counter } = await supabase
      .from('counters')
      .select('*')
      .eq('date', today)
      .single();

    if (!counter) {
      await supabase.from('counters').insert({ date: today, clicks: clicksToday });
    } else if (marketCap > 0) {
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
        marketCap
      })
    };

  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}