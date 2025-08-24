let currentValue = 0;
let targetValue = 0;
let incrementSpeed = 1000; // 1 second
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

setInterval(fetchCounter, 60000); // sync every 60 sec
fetchCounter();
animateCounter();
