let currentValue = 0;
let targetValue = 0;
let incrementSpeed = 1000; // 1 sec
const display = document.getElementById('counter');

async function fetchCounter() {
  const res = await fetch('/.netlify/functions/getCounter');
  const data = await res.json();
  targetValue = data.value;
}

function animateCounter() {
  if (currentValue < targetValue) {
    currentValue++;
    display.textContent = currentValue;
  }
  setTimeout(animateCounter, incrementSpeed);
}

setInterval(fetchCounter, 30000); // sync every 30 sec
fetchCounter();
animateCounter();
