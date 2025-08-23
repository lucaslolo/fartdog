import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sddctlzlqxcxsavtbmiy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZGN0bHpscXhjeHNhdnRibWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDU1NjQsImV4cCI6MjA3MTQ4MTU2NH0.bPtQwnA84EjTNTtn4wySR2wBAvS0DHVmA-289wyxISU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const countdownEl = document.getElementById('countdown');
  const countEl = document.getElementById('count');
  const totalEl = document.getElementById('total-target');
  const phaseTitle = document.querySelector('.phase-title');
  const tracker = document.getElementById('tracker');

  const targets = [10, 50, 100, 250, 500, 1000, 1450];
  const totalTarget = targets[targets.length - 1];
  const secondsInDay = 86400;
  let marketcap = 1000000;
  let clicksPerSecond = marketcap / secondsInDay;
  let data = { dailyCount: 0 };
  let previousCount = 0;
  const clickSound = new Audio('sound/fart1.mp3');

  // Progress Bar
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = "width:100%; height:20px; background:#333; border-radius:10px; margin:10px 0; position:relative;";
  const progressBar = document.createElement('div');
  progressBar.style.cssText = "width:0%; height:100%; background:#ff0; border-radius:10px; text-align:center; color:#000; font-weight:bold; line-height:20px;";
  progressContainer.appendChild(progressBar);
  tracker.appendChild(progressContainer);
  tracker.appendChild(totalEl);

  function updateProgress() {
    const totalFart = Math.floor(data.dailyCount);
    let progress = Math.min((totalFart / totalTarget) * 100, 100);
    progressBar.style.width = progress + '%';
    progressBar.textContent = `${progress.toFixed(2)}%`;
    let t = targets.find(t => totalFart < t);
    totalEl.innerHTML = `<span style="color:#ffd700;font-weight:bold;">${(t || totalTarget).toLocaleString()} Fart</span>`;
  }

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

  async function incrementFart(amount = 1) {
    data.dailyCount += amount;
    countEl.textContent = Math.floor(data.dailyCount);
    updateProgress();
    await fetch('/.netlify/functions/updateFarts', {
      method: 'POST',
      body: JSON.stringify({ action: 'increment', count: Math.floor(data.dailyCount) })
    });
  }

  // Auto-click toutes les secondes
  setInterval(() => incrementFart(1), 1000);

  // Countdown
  function updateCountdown() {
    const now = new Date();
    const nextDay = new Date();
    nextDay.setHours(24,0,0,0);
    const diff = nextDay - now;
    const hours = Math.floor(diff / (1000*60*60));
    const minutes = Math.floor((diff/1000/60)%60);
    const seconds = Math.floor((diff/1000)%60);
    countdownEl.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }
  setInterval(updateCountdown, 1000);

  getDataFromDB();

  // Realtime Sync
  const today = new Date().toISOString().split('T')[0];
  supabase.from(`farts:date=eq.${today}`)
    .on('UPDATE', payload => {
      data.dailyCount = payload.new.dailyCount;
      countEl.textContent = Math.floor(data.dailyCount);
      updateProgress();
    }).subscribe();
});
