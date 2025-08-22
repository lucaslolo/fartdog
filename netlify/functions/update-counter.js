import { createClient } from '@supabase/supabase-js';


  const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
  );


  const MILESTONES = [100000, 500000, 1000000, 5000000, 10000000];


  export async function handler() {
  try {
  // 1) Récupérer compteur global
  const { data: counter } = await supabase.from('counters').select('*').order('date', { ascending: false }).limit(1).single();


  const today = new Date().toISOString().split('T')[0];


  let todayClicks = 0;
  let totalClicks = 0;


  if (!counter || counter.date !== today) {
  // Nouveau jour, on insère une nouvelle ligne pour aujourd'hui
  await supabase.from('counters').insert({ date: today, clicks: 0 });
  todayClicks = 0;
  totalClicks = counter ? counter.clicks : 0;
  } else {
  todayClicks = counter.clicks;
  totalClicks = counter.clicks + (counter.total || 0);
  }


  // 2) Trouver prochain palier
  const nextMilestone = MILESTONES.find(m => m > totalClicks) || MILESTONES[MILESTONES.length-1];


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