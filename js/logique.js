const countEl = document.getElementById('count');

async function fetchCounter() {
  try {
    const res = await fetch('/.netlify/functions/increment-counter');
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    countEl.textContent = data.value;
  } catch (err) {
    console.error('Error fetching counter:', err);
  }
}

// sync toutes les minutes
fetchCounter();
setInterval(fetchCounter, 60_000);