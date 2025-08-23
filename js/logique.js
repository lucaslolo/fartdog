import { createClient } from '@supabase/supabase-js';

document.addEventListener('DOMContentLoaded', async () => {
  // ----- DOM Elements -----
  const countdownEl = document.getElementById('countdown');
  const countEl = document.getElementById('count');
  const totalEl = document.getElementById('total-target');
  const phaseTitle = document.querySelector('.phase-title');
  const tracker = document.getElementById('tracker');
  const resetBtn = document.getElementById('reset-btn');

  if (!countdownEl || !countEl || !totalEl || !phaseTitle || !tracker) return;

  // ----- Supabase -----
  const supabase = createClient(
    'https://sddctlzlqxcxsavtbmiy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZGN0bHpscXhjeHNhdnRibWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDU1NjQsImV4cCI6MjA3MTQ4MTU2NH0.bPtQwnA84EjTNTtn4wySR2wBAvS0DHVmA-289wyxISU'
  );

  // ----- Variables -----
  const targets = [10, 50, 100, 250, 500, 1000, 1450];
  const totalTarget = targets[targets.length - 1];
  let data = { dailyCount: 0, lastReset: new Date() };
  let previousCount = 0;
  let clicksPerSecond = 1;
  const clickSound = new Audio('sound/fart1.mp3');

  // ----- Progress Bar -----
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = "width:100%; height:20px; background:#333; border-radius:10px; margin:10px 0; position:relative;";
  const progressBar = document.createElement('div');
  progressBar.style.cssText = "width:0%; height:100%; background:#ff0; border-radius:10px; text-align:center; color:#000; font-weight:bold; line-height:20px;";
  progressContainer.appendChild(progressBar);
  tracker.appendChild(progressContainer);

  function renderTargets(currentValue) {
    const t = targets.find(t => currentValue < t);
    totalEl.innerHTML = `<span style="color:#ffd700;font-weight:bold;">${(t || totalTarget).toLocaleString()} Fart</span>`;
  }

  function updateProgress() {
    const totalFart = Math.floor(data.dailyCount);
    let progress = Math.min((totalFart / totalTarget) * 100, 100);
    progressBar.style.width = progress + '%';
    progressBar.textContent = `${progress.toFixed(2)}%`;
    renderTargets(totalFart);
  }

  // ----- Countdown & Phase Day -----
  function updatePhaseAndCountdown() {
    const now = new Date();
    const startDate = new Date('2025-06-15');
    const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
    phaseTitle.textContent = `Phase 1 - Day ${diffDays}`;

    const nextDay = new Date();
    nextDay.setHours(24, 0, 0, 0);
    const remainingTime = nextDay - now;
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);
    countdownEl.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }
  setInterval(updatePhaseAndCountdown, 1000);
  updatePhaseAndCountdown();

  // ----- Supabase Fetch & Increment -----
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

  // ----- Auto Click -----
  window.autoClickInterval = setInterval(() => incrementFart(clicksPerSecond), 1000);

  // ----- Reset Button -----
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Do you really want to reset your Fart data?')) {
        data = { dailyCount: 0, lastReset: new Date() };
        countEl.textContent = 0;
        updateProgress();
        await fetch('/.netlify/functions/updateFarts', {
          method: 'POST',
          body: JSON.stringify({ action: 'increment', count: 0 })
        });
      }
    });
  }

  // ----- Supabase Realtime -----
  const supabaseRealtime = createClient(
    'https://sddctlzlqxcxsavtbmiy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZGN0bHpscXhjeHNhdnRibWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDU1NjQsImV4cCI6MjA3MTQ4MTU2NH0.bPtQwnA84EjTNTtn4wySR2wBAvS0DHVmA-289wyxISU'
  );

  supabaseRealtime
    .from('farts')
    .on('UPDATE', payload => {
      data.dailyCount = payload.new.dailyCount;
      countEl.textContent = data.dailyCount;
      updateProgress();
    })
    .subscribe();

  // ----- Initial Load -----
  getDataFromDB();
});