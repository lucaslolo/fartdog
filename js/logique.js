// ---- DOM ----
const countEl = document.getElementById('count');
const progressContainer = document.createElement('div');
const progressBar = document.createElement('div');
const totalTarget = 1450;

// Progress bar
progressContainer.style.cssText = "width:100%; height:20px; background:#333; border-radius:10px; margin:10px 0; position:relative;";
progressBar.style.cssText = "width:0%; height:100%; background:#ff0; border-radius:10px; text-align:center; color:#000; font-weight:bold; line-height:20px;";
progressContainer.appendChild(progressBar);
document.getElementById('tracker').appendChild(progressContainer);

let state = { dailyCount: 0 };

// Met à jour l’UI
function updateProgress() {
  countEl.textContent = state.dailyCount;
  const pct = Math.min((state.dailyCount / totalTarget) * 100, 100);
  progressBar.style.width = pct + '%';
  progressBar.textContent = `${pct.toFixed(2)}%`;
}

// ---- Incrément via Netlify Function ----
async function incrementGlobalCount() {
  try {
    const res = await fetch('/.netlify/functions/counter');
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    state.dailyCount = data.dailyCount;
    updateProgress();
  } catch (err) {
    console.error('incrementGlobalCount error:', err);
  }
}

// Auto-incrément chaque secondeff 
setInterval(() => incrementGlobalCount(), 1000);

// Initialisation : récupère le compteur actuel
async function initCounter() {
  await incrementGlobalCount();
}
initCounter();