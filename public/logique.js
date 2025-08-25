const countEl = document.getElementById('count');
const marketCapEl = document.getElementById('marketcap');
const clickPerSecondeEl = document.getElementById('clickperseconde');
const clickPerMinuteEl = document.getElementById('clickperminute');
const resetBtn = document.getElementById('reset-btn');

const tokenAddress = 'EmidmqwsaEHV2qunR3brnQTyvWS9q7BM8CXyW9NmPrd';
const blockchain = 'solana';

let currentCount = 0;
let marketcap = 0;
let secondsInDay = 86400;
let clicksPerSecond = 0;
let clicksPerMinute = 0;
let lastTimestamp = null;

// ----- Fetch Market Cap -----
async function fetchClickPerMinute() {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${blockchain}/${tokenAddress}`);
    if (!response.ok) throw new Error('Erreur API DexScreener');

    const dataResp = await response.json();

    //marketcap = dataResp?.pairs?.[0]?.marketCap || 100000000;dd
    marketcap = 1000000;
    clicksPerSecond = marketcap / secondsInDay;
    clicksPerMinute = clicksPerSecond * 60;

    if (marketCapEl) marketCapEl.textContent = `Marketcap: $${marketcap.toLocaleString()}`;
    if (clickPerSecondeEl) clickPerSecondeEl.textContent = `Clicks per second: ${clicksPerSecond.toFixed(2)}`;
    if (clickPerMinuteEl) clickPerMinuteEl.textContent = `Clicks per minute: ${clicksPerMinute.toFixed(2)}`;

  } catch (error) {
    console.error('Erreur lors de la récupération du market cap:', error);
  }
}

// Lance la récupération et mise à jour toutes les 60 secondes par rapport au serveur
fetchClickPerMinute();
setInterval(fetchClickPerMinute, 60000);

// ----- Fetch compteur backend -----
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

// ----- Animation compteur avec clicksPerSecond -----
function animateCount() {
  function step(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000; // secondes écoulées
    lastTimestamp = timestamp;

    currentCount += clicksPerSecond * delta; // incrémente selon le market cap
    countEl.textContent = Math.floor(currentCount);

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ----- Reset -----
if (resetBtn) {
  resetBtn.addEventListener('click', async () => {
    try {
      await fetch('/.netlify/functions/counter-reset');
      currentCount = 0;
      countEl.textContent = 0;
      console.log('Compteur réinitialisé');
    } catch (err) {
      console.error('Reset error:', err);
    }
  });
}

// ----- Initialisation -----
async function initCounter() {
  const backendCount = await fetchCount();
  currentCount = backendCount; // initialise le compteur
  animateCount();

  setInterval(async () => {
    const newCount = await fetchCount();
    currentCount = newCount;
  }, 30000);
}

initCounter();
