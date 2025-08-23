// ---- CONFIG SUPABASE (front-only) ----
const SUPABASE_URL = "https://sddctlzlqxcxsavtbmiy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZGN0bHpscXhjeHNhdnRibWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDU1NjQsImV4cCI6MjA3MTQ4MTU2NH0.bPtQwnA84EjTNTtn4wySR2wBAvS0DHVmA-289wyxISU";

const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- UTIL ----
const todayStr = () => new Date().toISOString().split('T')[0];

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

let data = { date: todayStr(), dailyCount: 0, lastReset: new Date().toISOString() };
let clickSound = new Audio('sound/fart1.mp3');

// Progress bar
const progressContainer = document.createElement('div');
progressContainer.style.cssText = "width:100%; height:20px; background:#333; border-radius:10px; margin:10px 0; position:relative;";
const progressBar = document.createElement('div');
progressBar.style.cssText = "width:0%; height:100%; background:#ff0; border-radius:10px; text-align:center; color:#000; font-weight:bold; line-height:20px;";
progressContainer.appendChild(progressBar);
tracker.appendChild(progressContainer);

// Render cibles
function renderTargets(currentValue) {
  const next = targets.find(t => currentValue < t) ?? totalTarget;
  totalEl.innerHTML = `<span style="color:#ffd700;font-weight:bold;">${next.toLocaleString()} Fart</span>`;
}

// Son en fonction des paliers
function setupClickSound() {
  const n = Math.floor(data.dailyCount);
  clickSound.volume =
    n < targets[0] ? 0 :
    n < targets[1] ? 0.02 :
    n < targets[2] ? 0.09 :
    n < targets[3] ? 0.21 :
    n < targets[4] ? 0.37 :
    n < targets[5] ? 0.51 :
    n < targets[6] ? 0.69 : 1.0;
}

// Maj barre + cibles
function updateProgress() {
  const n = Math.floor(data.dailyCount);
  const pct = Math.min((n / totalTarget) * 100, 100);
  progressBar.style.width = pct + '%';
  progressBar.textContent = `${pct.toFixed(2)}%`;
  renderTargets(n);
  setupClickSound();
}

// Phase (jour) + countdown jusqu’à minuit
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

// ---- SUPABASE: get or create today's row ----
async function getOrCreateToday() {
  const d = todayStr();
  const { data: existing, error } = await supa
    .from('farts')
    .select('*')
    .eq('date', d)
    .maybeSingle();

  if (error) { console.error('Select error:', error); return; }

  if (existing) {
    data = {
      date: existing.date,
      dailyCount: Number(existing.dailycount ?? existing.dailyCount ?? 0),
      lastReset: existing.lastreset ?? existing.lastReset ?? new Date().toISOString()
    };
    countEl.textContent = Math.floor(data.dailyCount);
    updateProgress();
    return;
  }

  // Create row if missing
  const { data: inserted, error: insertError } = await supa
    .from('farts')
    .insert({ date: d, dailyCount: 0, lastReset: new Date().toISOString() })
    .select()
    .single();

  if (insertError) { console.error('Insert error:', insertError); return; }

  data = {
    date: inserted.date,
    dailyCount: Number(inserted.dailycount ?? inserted.dailyCount ?? 0),
    lastReset: inserted.lastreset ?? inserted.lastReset ?? new Date().toISOString()
  };
  countEl.textContent = 0;
  updateProgress();
}

// ---- Incrément global partagé ----
async function incrementGlobalCount(amount = 1) {
  try {
    data.dailyCount = (data.dailyCount || 0) + amount;
    countEl.textContent = Math.floor(data.dailyCount);
    updateProgress();

    const res = await fetch('/.netlify/functions/updateFarts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'increment', count: data.dailyCount })
    });

    const text = await res.text();
    let result;
    try { result = JSON.parse(text); } catch(e) { return; }

    if (result && typeof result.dailyCount === 'number') {
      data.dailyCount = result.dailyCount;
      countEl.textContent = Math.floor(data.dailyCount);
      updateProgress();
    }

  } catch (err) {
    console.error('Increment error:', err);
  }
}

// Auto-incrément de 1 par seconde
setInterval(() => incrementGlobalCount(1), 1000);

// ---- Reset bouton ----
resetBtn.addEventListener('click', async () => {
  if (!confirm('Reset counter for today?')) return;
  data.dailyCount = 0;
  countEl.textContent = 0;
  updateProgress();

  const { error } = await supa
    .from('farts')
    .upsert({ date: todayStr(), dailyCount: 0, lastReset: new Date().toISOString() }, { onConflict: 'date' });
  if (error) console.error('Reset upsert error:', error);
});

// ---- Realtime: écoute INSERT + UPDATE sur la ligne du jour ----
function subscribeRealtime() {
  const filter = `date=eq.${todayStr()}`;

  supa.channel('farts-updates')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'farts', filter }, (payload) => {
      const n = Number(payload.new.dailycount ?? payload.new.dailyCount ?? 0);
      if (n !== data.dailyCount) {
        data.dailyCount = n;
        countEl.textContent = n;
        updateProgress();
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'farts', filter }, (payload) => {
      const n = Number(payload.new.dailycount ?? payload.new.dailyCount ?? 0);
      data.dailyCount = n;
      countEl.textContent = n;
      updateProgress();
    })
    .subscribe();
}

// ---- Init ----
(async function init() {
  await getOrCreateToday();
  subscribeRealtime();
})();