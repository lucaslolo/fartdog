const countEl = document.getElementById('count');
let localValue = 0;
let targetValue = 0;

// Récupérer valeur globale
async function fetchCounterOnce() {
  try {
    const res = await fetch('/.netlify/functions/get-counter');
    const data = await res.json();
    targetValue = data.value;
    localValue = targetValue;
    countEl.textContent = localValue;
  } catch (err) {
    console.error(err);
  }
}

// Smooth incrément côté client
function smoothIncrement() {
  localValue++;
  countEl.textContent = localValue;
}

// Resync toutes les minutes
async function resyncCounter() {
  try {
    const res = await fetch('/.netlify/functions/get-counter');
    const data = await res.json();
    targetValue = data.value;
    if (localValue < targetValue) localValue = targetValue;
  } catch (err) {
    console.error(err);
  }
}

// Initialisation
fetchCounterOnce();
setInterval(smoothIncrement, 1000);
setInterval(resyncCounter, 60_000); // toutes les minutes
