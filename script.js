const titleEl = document.getElementById('title');
const todayEl = document.getElementById('today');
const totalEl = document.getElementById('total');
const milestoneEl = document.getElementById('milestone');


// Calcule Day XX depuis 15 juin
function daySinceJune15() {
const base = new Date('2025-06-15T00:00:00Z');
const today = new Date();
const diff = Math.floor((today - base)/(1000*60*60*24)) + 1;
return diff;
}


async function fetchCounter() {
try {
const res = await fetch('/.netlify/functions/update-counter');
const data = await res.json();


titleEl.textContent = `Phase 1 - Day ${daySinceJune15()}`;
todayEl.textContent = data.todayClicks;
totalEl.textContent = data.totalClicks;
milestoneEl.textContent = data.nextMilestone;
} catch (e) {
console.error(e);
}
}


fetchCounter();
setInterval(fetchCounter, 5000); // refresh toutes les 5s