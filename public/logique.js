const countEl = document.getElementById('count');
let currentCount = 0;

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

async function initCounter() {
  const backendCount = await fetchCount();
  animateCount(backendCount);

  setInterval(async () => {
    const newCount = await fetchCount();
    animateCount(newCount);
  }, 30000);
}

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

initCounter();