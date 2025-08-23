// ---- DOM ----
const countdownEl = document.getElementById('countdown');
const countEl = document.getElementById('count');
const totalEl = document.getElementById('total-target');
const phaseTitle = document.querySelector('.phase-title');
const tracker = document.getElementById('tracker');
const resetBtn = document.getElementById('reset-btn');

if (!countdownEl || !countEl || !totalEl || !phaseTitle || !tracker || !resetBtn) {
  console.error('Missing DOM elements.');
}

// ---- LOGIQUE UI ----
const targets = [10, 50, 100, 250, 500, 1000, 1450];
const totalTarget = targets[targets.length - 1];
let clickSound = new Audio('sound/fart1.mp3');

// Progress bar
const progressContainer = document.createElement('div');
progressContainer.style.cssText = "width:100%; height:20px; background:#333; border-radius:10px; margin:10px 0; position:relative;";
const progressBar = document.createElement('div');
progressBar.style.cssText = "width:0%; height:100%; background:#ff0; border-radius:10px; text-align:center; color:#000; font-weight:bold; line-height:20px;";
progressContainer.appendChild(progressBar);
tracker.appendChild(progressContainer);

function renderTargets(currentValue) {
  const next = targets.find(t => currentValue < t) ?? totalTarget;
  totalEl.innerHTML = `<span style="color:#ffd700;font-weight:bold;">${next.toLocaleString()} Fart</span>`;
}

function setupClickSound(n) {
  clickSound.volume =
    n < targets[0] ? 0 :
    n < targets[1] ? 0.02 :
    n < targets[2] ? 0.09 :
    n < targets[3] ? 0.21 :
    n < targets[4] ? 0.37 :
    n < targets[5] ? 0.51 :
    n < targets[6] ? 0.69 : 1.0;
}

function updateProgress(n) {
  const pct = Math.min((n / totalTarget) * 100, 100);
  progressBar.style.width = pct + '%';
  progressBar.textContent = `${pct.toFixed(2)}%`;
  renderTargets(n);
  setupClickSound(n);
}

// Phase + countdown jusqu’à minuit
function updatePhaseAndCountdown() {
  const now = new Date();
  const startDate = new Date('2025-06-15');
  const diffDays = Math.floor((now - startDate) / (1000*60*60*24)) + 1;
  phaseTitle.textContent = `Phase 1 - Day ${diffDays}`;

  const nextDay = new Date();
  nextDay.setHours(24,0,0,0);
  const diff = nextDay - now;
  const h = Math.floor(diff / (1000*60*60));
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  countdownEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
setInterval(updatePhaseAndCountdown, 1000);
updatePhaseAndCountdown();

// ---- FONCTIONS ----

// Récupère le compteur global depuis la function Netlify
async function fetchGlobalCount() {
  try {
    const res = await fetch('/.netlify/functions/counter');
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data.dailyCount ?? 0;
  } catch (err) {
    console.error('fetchGlobalCount error:', err);
    return 0;
  }
}

// Incrément côté front (demande à la function)
async function incrementGlobalCount() {
  try {
    const res = await fetch('/.netlify/functions/counter');
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    const n = data.dailyCount ?? 0;
    countEl.textContent = n;
    updateProgress(n);
  } catch (err) {
    console.error('incrementGlobalCount error:', err);
  }
}

// Auto-incrément chaque seconde
setInterval(incrementGlobalCount, 1000);

// Reset bouton (remet à 0 pour aujourd’hui)
resetBtn.addEventListener('click', async () => {
  if (!confirm('Reset counter for today?')) return;
  try {
    const res = await fetch('/.netlify/functions/counter'); // créer une function reset séparée
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    countEl.textContent = data.dailyCount ?? 0;
    updateProgress(data.dailyCount ?? 0);
  } catch (err) {
    console.error('Reset error:', err);
  }
});
