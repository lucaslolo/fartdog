const SUPABASE_URL = 'https://sddctlzlqxcxsavtbmiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZGN0bHpscXhjeHNhdnRibWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDU1NjQsImV4cCI6MjA3MTQ4MTU2NH0.bPtQwnA84EjTNTtn4wySR2wBAvS0DHVmA-289wyxISU';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const countEl = document.getElementById('count');
const totalEl = document.getElementById('total-target');

let currentCount = 0;

// Fonction pour récupérer le compteur depuis le backend
async function fetchCount() {
  try {
    const res = await fetch('/.netlify/functions/counter');
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data.dailyCount;
  } catch (err) {
    console.error('fetchCount error:', err);
    return currentCount;
  }
}

// Smooth counter vers la valeur backend
function animateCount(target) {
  const step = () => {
    if (currentCount < target) {
      currentCount += 1;
      countEl.textContent = currentCount;
      requestAnimationFrame(step);
    } else if (currentCount > target) {
      currentCount = target;
      countEl.textContent = currentCount;
    }
  };
  step();
}

// Initialisation et sync toutes les 30 secondes
async function initCounter() {
  const backendCount = await fetchCount();
  animateCount(backendCount);
  setInterval(async () => {
    const newCount = await fetchCount();
    animateCount(newCount);
  }, 30000); // toutes les 30 secondes
}

// Reset manuel (optionnel)
document.getElementById('reset-btn').addEventListener('click', async () => {
  try {
    await fetch('/.netlify/functions/counter-reset');
    currentCount = 0;
    countEl.textContent = 0;
  } catch (err) {
    console.error(err);
  }
});

initCounter();
