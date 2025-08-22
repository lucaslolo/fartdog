const titleEl = document.getElementById('title');
const todayEl = document.getElementById('today');
const totalEl = document.getElementById('total');
const milestoneEl = document.getElementById('milestone');

function daySinceJune15() {
  const base = new Date('2025-06-15T00:00:00Z');
  const today = new Date();
  const diff = Math.floor((today - base) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
}

async function fetchCounter() {
  try {
    const res = await fetch('/.netlify/functions/update-counter');
    const data = await res.json();

    titleEl.textContent = `Phase 1 - Day ${daySinceJune15()}`;
    todayEl.textContent = data.todayClicks.toLocaleString();
    totalEl.textContent = data.totalClicks.toLocaleString();
    milestoneEl.textContent = data.nextMilestone.toLocaleString();
  } catch (e) {
    console.error('Erreur fetch compteur:', e);
  }
}

// Rafraîchissement toutes les 30 secondes
fetchCounter();
setInterval(fetchCounter, 30000);
