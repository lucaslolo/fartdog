import { createClient } from '@supabase/supabase-js';

// --- Initialisation Supabase ---
const supabase = createClient(
  'https://sddctlzlqxcxsavtbmiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZGN0bHpscXhjeHNhdnRibWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDU1NjQsImV4cCI6MjA3MTQ4MTU2NH0.bPtQwnA84EjTNTtn4wySR2wBAvS0DHVmA-289wyxISU'
);

document.addEventListener('DOMContentLoaded', () => {
  const countdownEl = document.getElementById('countdown');
  const countEl = document.getElementById('count');
  const totalEl = document.getElementById('total-target');
  const phaseTitle = document.querySelector('.phase-title');
  const tracker = document.getElementById('tracker');

  const targets = [10, 50, 100, 250, 500, 1000, 1450];
  const totalTarget = targets[targets.length - 1];
  const secondsInDay = 86400;
  let marketcap = 1000000; // à remplacer par fetch réel si tu veux
  let clicksPerSecond = marketcap / secondsInDay;
  let clickSound = new Audio('sound/fart1.mp3');

  let data = { dailyCount: 0, lastReset: new Date() };
  let previousCount = 0;

  // --- Render targets ---
  function renderTargets(currentValue) {
    totalEl.innerHTML = '';
    const t = targets.find(t => currentValue < t);
    totalEl.innerHTML = `<span style="color:#ffd700;font-weight:bold;">${(t || totalTarget).toLocaleString()} Fart</span>`;
  }

  // --- Update Progress Bar ---
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = "width:100%; height:20px; background:#333; border-radius:10px; margin:10px 0; position:relative;";
  const progressBar = document.createElement('div');
  progressBar.style.cssText = "width:0%; height:100%; background:#ff0; border-radius:10px; text-align:center; color:#000; font-weight:bold; line-height:20px;";
  progressContainer.appendChild(progressBar);
  tracker.appendChild(progressContainer);
  tracker.appendChild(totalEl);

  function updateProgress() {
    const totalFart = Math.floor(data.dailyCount);
    const progress = Math.min((totalFart / totalTarget) * 100, 100);
    progressBar.style.width = progress + '%';
    progressBar.textContent = `${progress.toFixed(2)}%`;
    renderTargets(totalFart);
    setupClickSound();
  }

  // --- Configure le son selon le total ---
  function setupClickSound() {
    const totalFart = Math.floor(data.dailyCount);
    if (totalFart < targets[0]) clickSound.volume = 0;
    else if (totalFart < targets[1]) clickSound.volume = 0.02;
    else if (totalFart < targets[2]) clickSound.volume = 0.09;
    else if (totalFart < targets[3]) clickSound.volume = 0.21;
    else if (totalFart < targets[4]) clickSound.volume = 0.37;
    else if (totalFart < targets[5]) clickSound.volume = 0.51;
    else if (totalFart < targets[6]) clickSound.volume = 0.69;
    else clickSound.volume = 1.0;
  }

  // --- Phase et countdown ---
  function updatePhaseAndCountdown() {
    const now = new Date();
    const startDate = new Date('2025-06-15');
    const diffDays = Math.floor((now - startDate) / (1000*60*60*24)) + 1;
    phaseTitle.textContent = `Phase 1 - Day ${diffDays}`;

    const nextDay = new Date();
    nextDay.setHours(24,0,0,0);
    const diff = nextDay - now;
    const hours = Math.floor(diff / (1000*60*60));
    const minutes = Math.floor((diff / (1000*60)) % 60);
    const seconds = Math.floor((diff/1000) % 60);
    countdownEl.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }

  setInterval(updatePhaseAndCountdown, 1000);
  updatePhaseAndCountdown();

  // --- Supabase get data ---
  async function getDataFromDB() {
    const today = new Date().toISOString().split('T')[0];
    const { data: dbData } = await supabase
      .from('farts')
      .select('*')
      .eq('date', today)
      .single();
    if (dbData) data = dbData;
    countEl.textContent = data.dailyCount;
    previousCount = data.dailyCount;
    updateProgress();
  }

  getDataFromDB();

  // --- Incrémentation ---
  async function incrementFart(amount = clicksPerSecond) {
    data.dailyCount += amount;
    countEl.textContent = Math.floor(data.dailyCount);
    updateProgress();

    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('farts')
      .upsert({ date: today, dailyCount: data.dailyCount, lastReset: new Date() }, { onConflict: ['date'] });
  }

  // --- Auto-click toutes les secondes ---
  setInterval(() => incrementFart(), 1000);

  // --- Realtime Supabase pour mettre à jour tous les clients ---
  supabase
    .from('farts')
    .on('UPDATE', payload => {
      data.dailyCount = payload.new.dailyCount;
      countEl.textContent = Math.floor(data.dailyCount);
      updateProgress();
    })
    .subscribe();
});
