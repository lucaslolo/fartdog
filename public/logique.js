// ----- Éléments du DOM -----
const countEl = document.getElementById('count');
const marketCapEl = document.getElementById('marketcap');
const tokenAddress = 'EmidmqwsaEHV2qunR3brnQTyvWS9q7BM8CXyW9NmPrd';
const blockchain = 'solana';

// ----- Variables globales -----
let currentCount = 0;
let marketcap = 0;
const secondsInDay = 86400; // Pour calculer clicksPerSecond
let clicksPerSecond = 0;

// ----- Fonction pour récupérer le compteur -----
async function fetchCount() {
  try {
    console.log('Fetching count from server...');
    const res = await fetch('/.netlify/functions/counter');
    console.log('Response status:', res.status);
    if (!res.ok) throw new Error('Network response not ok');

    const data = await res.json();
    console.log('Data received:', data);
    return data.dailyCount;
  } catch (err) {
    console.error('fetchCount error:', err);
    return currentCount;
  }
}

// ----- Animation du compteur -----
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

// ----- Initialisation du compteur -----
async function initCounter() {
  const backendCount = await fetchCount();
  animateCount(backendCount);

  setInterval(async () => {
    const newCount = await fetchCount();
    animateCount(newCount);
  }, 30000);
}

// ----- Reset compteur -----
document.getElementById('reset-btn').addEventListener('click', async () => {
  try {
    console.log('Reset button clicked...');
    await fetch('/.netlify/functions/counter-reset');
    currentCount = 0;
    countEl.textContent = 0;
    console.log('Counter reset');
  } catch (err) {
    console.error('Reset error:', err);
  }
});

// Lance l'initialisation du compteur
initCounter();

// ----- Récupération du Market Cap -----
async function fetchMarketCap() {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${blockchain}/${tokenAddress}`);
    if (!response.ok) throw new Error('Erreur API DexScreener');

    const dataResp = await response.json();

    // Si la donnée existe
    marketcap = dataResp?.pairs?.[0]?.marketCap || 100000000;
    clicksPerSecond = marketcap / secondsInDay;

    // Mise à jour du DOM
    if (marketCapEl) {
      marketCapEl.textContent = `Marketcap: $${marketcap.toLocaleString()}`;
    }

    console.log('Marketcap:', marketcap);

  } catch (error) {
    console.error('Erreur lors de la récupération du market cap:', error);
  }
}

// Lance la récupération du Market Cap et mise à jour auto toutes les 30 sec
fetchMarketCap();
setInterval(fetchMarketCap, 30000);
