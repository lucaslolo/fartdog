import { createClient } from '@supabase/supabase-js';

// ------------------ Supabase ------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ DOM Elements ------------------
const countEl = document.getElementById('count');
const countdownEl = document.getElementById('countdown');
const phaseTitle = document.querySelector('.phase-title');
const tracker = document.getElementById('tracker');

// ------------------ Progress Bar ------------------
const progressContainer = document.createElement('div');
progressContainer.style.cssText = "width:100%; height:20px; background:#333; border-radius:10px; margin:10px 0; position:relative;";
const progressBar = document.createElement('div');
progressBar.style.cssText = "width:0%; height:100%; background:#ff0; border-radius:10px; text-align:center; color:#000; font-weight:bold; line-height:20px;";
progressContainer.appendChild(progressBar);
tracker.appendChild(progressContainer);

// ------------------ Variables ------------------
let data = { dailyCount: 0, lastReset: new Date() };
let previousCount = 0;
const targets = [100, 500, 1000, 5000, 10000, 1450000]; // paliers
const totalTarget = targets[targets.length - 1];
const secondsInDay = 86400;

// ------------------ Progress Update ------------------
function updateProgress() {
  const totalFart = Math.floor(data.dailyCount);
  let progress = Math.min((totalFart / totalTarget) * 100, 100);
  progressBar.style.width = progress + '%';
  progressBar.textContent = `${progress.toFixed(2)}%`;
}

// ------------------ Countdown & Phase Day ------------------
function updatePhaseAndCountdown() {
  const now = new Date();

  // Phase day
  const startDate = new Date('2025-06-15');
  const diffDays = Math.floor((now - startDate) / (1000*60*60*24)) + 1;
  phaseTitle.textContent = `Phase 1 - Day ${diffDays}`;

  // Countdown jusqu'à minuit
  const nextDay = new Date();
  nextDay.setHours(24,0,0,0);
  const remaining = nextDay - now;
  const hours = String(Math.floor((remaining / (1000*60*60)) % 24)).padStart(2,'0');
  const minutes = String(Math.floor((remaining / (1000*60)) % 60)).padStart(2,'0');
  const seconds = String(Math.floor((remaining / 1000) % 60)).padStart(2,'0');
  countdownEl.textContent = `${hours}:${minutes}:${seconds}`;

  // Reset dailyCount au début du jour
  if (remaining < 1000) {
    data.dailyCount = 0;
    previousCount = 0;
    countEl.textContent = 0;
    updateProgress();
    incrementFart(0); // sync DB
  }
}
setInterval(updatePhaseAndCountdown, 1000);

// ------------------ Fetch DB ------------------
async function getDataFromDB() {
  const res = await fetch('/.netlify/functions/updateFarts', {
    method: 'POST',
    body: JSON.stringify({ action: 'get' })
  });
  data = await res.json();
  previousCount = data.dailyCount;
  countEl.textContent = data.dailyCount;
  updateProgress();
}

// ------------------ Increment ------------------
async function incrementFart(amount=1) {
  data.dailyCount += amount;
  countEl.textContent = Math.floor(data.dailyCount);
  updateProgress();

  await fetch('/.netlify/functions/updateFarts', {
    method: 'POST',
    body: JSON.stringify({ action:'increment', count: data.dailyCount })
  });
}

// ------------------ Auto Click ------------------
setInterval(() => incrementFart(1), 1000);

// ------------------ Supabase Realtime ------------------
supabase
  .channel('farts-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'farts' }, payload => {
    if(payload.new) {
      data.dailyCount = payload.new.dailyCount;
      countEl.textContent = Math.floor(data.dailyCount);
      updateProgress();
    }
  })
  .subscribe();

// ------------------ Init ------------------
getDataFromDB();
updatePhaseAndCountdown();