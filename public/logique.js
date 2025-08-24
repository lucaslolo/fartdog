// Récupère l'élément du DOM qui affiche le compteur
const countEl = document.getElementById('count');
const marketCapEl = document.getElementById('marketcap');
const tokenAddress = 'EmidmqwsaEHV2qunR3brnQTyvWS9q7BM8CXyW9NmPrd';
const blockchain = 'solana';

// Variable pour stocker la valeur actuelle du compteur
let currentCount = 0;
let currentMarketCap = 0;

// Fonction pour récupérer le compteur du backend (Netlify Function)
async function fetchCount() {
  try {
    console.log('Fetching count from server...');
    // Appel à la Netlify Function qui retourne le dailyCount
    const res = await fetch('/.netlify/functions/counter');
    console.log('Response status:', res.status);
    if (!res.ok) throw new Error('Network response not ok');

    // Récupère la donnée JSON
    const data = await res.json();
    console.log('Data received:', data);
    return data.dailyCount;
  } catch (err) {
    // En cas d'erreur, log et retourne la valeur actuelle
    console.error('fetchCount error:', err);
    return currentCount;
  }
}

// Animation pour faire évoluer le compteur affiché jusqu'à la valeur cible
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

// Initialise le compteur et met à jour toutes les 30 secondes
async function initCounter() {
  // Récupère la valeur initiale du backend
  const backendCount = await fetchCount();
  animateCount(backendCount);

  // Met à jour le compteur toutes les 30 secondes
  setInterval(async () => {
    const newCount = await fetchCount();
    animateCount(newCount);
  }, 30000);
}

// Ajoute un listener pour le bouton de reset du compteur
document.getElementById('reset-btn').addEventListener('click', async () => {
  try {
    console.log('Reset button clicked...');
    // Appel à la Netlify Function pour reset le compteur
    await fetch('/.netlify/functions/counter-reset');
    // Remet le compteur local à zéro
    currentCount = 0;
    countEl.textContent = 0;
    console.log('Counter reset');
  } catch (err) {
    // Gestion d'erreur lors du reset
    console.error('Reset error:', err);
  }
});

// Lance l'initialisation du compteur au chargement de la page
initCounter();

async function fetchMarketCap() {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${blockchain}/${tokenAddress}`);
    const dataResp = await response.json();

    // Vérifie la structure et récupère le market cap
    currentMarketCap = dataResp?.pairs?.[0]?.marketCapUsd || 100000000;

    // Affiche dans le DOM
    marketCapEl.textContent = currentMarketCap.toLocaleString();
    console.log('Market Cap:', currentMarketCap);

  } catch (error) {
    console.error('Error while fetching market cap:', error);
  }
}

fetchMarketCap();


