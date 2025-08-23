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

let state = { date: todayStr(), dailyCount: 0, lastReset: new Date().toISOString() };
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
  const n = Math.floor(state.dailyCount);
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
  const n = Math.floor(state.dailyCount);
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

  // 1) read
  const { data, error } = await supa
    .from('farts')
    .select('*')
    .eq('date', d)
    .maybeSingle();

  if (error) {
    console.error('Select error:', error);
  }

  if (data) {
    state = {
      date: data.date,
      dailyCount: Number(data.dailycount ?? data.dailyCount ?? 0),
      lastReset: data.lastreset ?? data.lastReset ?? new Date().toISOString()
    };
    countEl.textContent = Math.floor(state.dailyCount);
    updateProgress();
    return;
  }

  // 2) create if missing
  const { data: inserted, error: insertError } = await supa
    .from('farts')
    .insert({ date: d, dailyCount: 0, lastReset: new Date().toISOString() })
    .select()
    .single();

  if (insertError) {
    console.error('Insert error:', insertError);
    return;
  }

  state = {
    date: inserted.date,
    dailyCount: Number(inserted.dailycount ?? inserted.dailyCount ?? 0),
    lastReset: inserted.lastreset ?? inserted.lastReset ?? new Date().toISOString()
  };
  countEl.textContent = 0;
  updateProgress();
}

// ---- Incrément local + DB ----
async function incrementFart(amount = 1) {
  state.dailyCount = Math.floor(Number(state.dailyCount) + amount);
  countEl.textContent = state.dailyCount;
  updateProgress();

  const { error } = await supa
    .from('farts')
    .upsert({
      date: todayStr(),
      dailyCount: state.dailyCount,
      lastReset: new Date().toISOString()
    }, { onConflict: 'date' });

  if (error) console.error('Upsert error:', error);
}

// Auto-incrément chaque seconde (tu peux changer la cadence ici)
const auto = setInterval(() => incrementFart(1), 1000);

// ---- Reset bouton (remet à 0 pour aujourd’hui) ----
if (resetBtn) {
  resetBtn.addEventListener('click', async () => {
    if (!confirm('Reset counter for today?')) return;
    state.dailyCount = 0;
    countEl.textContent = 0;
    updateProgress();

    const { error } = await supa
      .from('farts')
      .upsert({
        date: todayStr(),
        dailyCount: 0,
        lastReset: new Date().toISOString()
      }, { onConflict: 'date' });

    if (error) console.error('Reset upsert error:', error);
  });
}

// ---- Realtime: écoute INSERT + UPDATE sur la ligne du jour ----
function subscribeRealtime() {
  const filter = `date=eq.${todayStr()}`;

  // UPDATE
  supa
    .channel('farts-updates')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'farts', filter },
      (payload) => {
        const n = Number(payload.new.dailycount ?? payload.new.dailyCount ?? 0);
        // évite de re-déclencher un update si c'est nous
        if (n !== state.dailyCount) {
          state.dailyCount = n;
          countEl.textContent = n;
          updateProgress();
        }
      }
    )
    // INSERT (au cas où la ligne du jour vient d’être créée ailleurs)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'farts', filter },
      (payload) => {
        const n = Number(payload.new.dailycount ?? payload.new.dailyCount ?? 0);
        state.dailyCount = n;
        countEl.textContent = n;
        updateProgress();
      }
    )
    .subscribe((status) => {
      // console.log('Realtime status:', status);
    });
}

// ---- Init ----
(async function init() {
  await getOrCreateToday();
  subscribeRealtime();
})();
