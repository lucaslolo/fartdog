

document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.getElementById('reset-btn');
  if (!resetBtn) {
    console.warn('Reset button does not exist in the HTML.');
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Do you really want to reset your Fart data?')) {
        const todayStr = new Date().toISOString().split('T')[0];
        data = { date: todayStr, dailyCount: 0, totalCount: 0, successDays: 0 };
        localStorage.setItem('fartCount', JSON.stringify(data));
        countEl.textContent = data.dailyCount;
        updateCountdown();
        alert('Data reset!');
      }
    });
  }

  const countdownEl = document.getElementById('countdown');
  const countEl = document.getElementById('count');
  const totalEl = document.getElementById('total-target');
  const phaseTitle = document.querySelector('.phase-title');
  const tracker = document.getElementById('tracker');
  if (!countdownEl || !countEl || !totalEl || !phaseTitle || !tracker) {
    console.error('One or more DOM elements are missing.');
    return;
  }

  const tokenAddress = 'EmidmqwsaEHV2qunR3brnQTyvWS9q7BM8CXyW9NmPrd';
  const blockchain = 'solana';
  const targets = [10, 50, 100, 250, 500, 1000, 1450];
  const totalTarget = targets[targets.length - 1];

  const secondsInDay = 24 * 60 * 60;
  let marketcap = 0;
  let clicksPerSecond = 0;


  function renderTargets(currentValue) {
    totalEl.innerHTML = '';
    let nextTargetIdx = targets.findIndex(t => currentValue < t);
    if (nextTargetIdx === -1) {
      totalEl.innerHTML = `<span style="color:#ffd700;font-weight:bold;">${totalTarget.toLocaleString()} Fart</span>`;
      return;
    }
    const t = targets[nextTargetIdx];
    const span = document.createElement('span');
    span.textContent = `${t.toLocaleString()} Fart`;
    span.style.color = '#ffd700';
    span.style.fontWeight = 'bold';
    totalEl.appendChild(span);
  }

  function updatePhaseDay() {
    const startDate = new Date('2025-06-15');
    const today = new Date();
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    phaseTitle.textContent = `Phase 1 - Day ${diffDays}`;
  }
  updatePhaseDay();
  setInterval(updatePhaseDay, 1000 * 60 * 60);


  async function fetchMarketCap() {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${blockchain}/${tokenAddress}`);
      const dataResp = await response.json();
      marketcap = 1000000;
      //marketcap = dataResp?.pairs?.[0]?.marketCap || 100000000;
      clicksPerSecond = marketcap / secondsInDay;
      setupClickSound();
    } catch (error) {
  console.error('Error while fetching market cap:', error);
    }
  }
  fetchMarketCap();

  let clickSound;
  function setupClickSound() {
    const totalFart = data.totalCount + Math.floor(data.dailyCount);
    if (totalFart < targets[0]) {
      clickSound = new Audio('sound/fart1.mp3');
      clickSound.volume = 0;
    } else if (totalFart < targets[1]) {
      clickSound = new Audio('sound/fart1.mp3');
      clickSound.volume = 0.02;
    } else if (totalFart < targets[2]) {
      clickSound = new Audio('sound/fart1.mp3');
      clickSound.volume = 0.09;
    } else if (totalFart < targets[3]) {
      clickSound = new Audio('sound/fart1.mp3');
      clickSound.volume = 0.21;
    } else if (totalFart < targets[4]) {
      clickSound = new Audio('sound/fart1.mp3');
      clickSound.volume = 0.37;
    } else if (totalFart < targets[5]) {
      clickSound = new Audio('sound/fart1.mp3');
      clickSound.volume = 0.51;
    } else if (totalFart < targets[6]) {
      clickSound = new Audio('sound/fart1.mp3');
      clickSound.volume = 0.69;
    }  else {
      clickSound = new Audio('sound/fart1.mp3');
      clickSound.volume = 1.0;
    }
  }

  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = "width:100%; height:20px; background:#333; border-radius:10px; margin:10px 0; position:relative;";
  const progressBar = document.createElement('div');
  progressBar.style.cssText = "width:0%; height:100%; background:#ff0; border-radius:10px; text-align:center; color:#000; font-weight:bold; line-height:20px;";
  progressContainer.appendChild(progressBar);
  const totalDisplay = document.createElement('div');
  totalDisplay.style.cssText = "margin-top:5px; color:#fff; font-size:14px; text-align:right;";
  tracker.appendChild(progressContainer);
  tracker.appendChild(totalDisplay);

  function updateProgress() {
    const totalFart = data.totalCount + Math.floor(data.dailyCount);

    let progress = Math.min((totalFart / totalTarget) * 100, 100);
    progressBar.style.width = progress + '%';
    progressBar.textContent = `${progress.toFixed(2)}%`;
    renderTargets(totalFart);
    setupClickSound();
    let nextTargetIdx = targets.findIndex(t => totalFart < t);
    let currentTarget = nextTargetIdx === -1 ? totalTarget : targets[nextTargetIdx];
  }


  function updateCountdown() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    countdownEl.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();


  function getData() {
    const stored = JSON.parse(localStorage.getItem('fartCount')) || { date:'', dailyCount:0, totalCount:0, successDays:0 };
    const todayStr = new Date().toISOString().split('T')[0];
    if (stored.date !== todayStr) return { date: todayStr, dailyCount:0, totalCount: stored.totalCount, successDays: stored.successDays };
    return stored;
  }      

  function saveData(data) { localStorage.setItem('fartCount', JSON.stringify(data)); }

  let data = getData();
  countEl.textContent = data.dailyCount;
  updateProgress();
  renderTargets(data.totalCount + Math.floor(data.dailyCount));

  let previousCount = Math.floor(data.dailyCount);
  window.autoClickInterval = setInterval(autoClick, 1000);
  function autoClick() {
    data.dailyCount += clicksPerSecond;
    let currentCount = Math.floor(data.dailyCount);
    const MAX_PET_IMAGES = 10;
    let imagesToShow = Math.min(currentCount - previousCount, MAX_PET_IMAGES);
    const totalFart = data.totalCount + Math.floor(data.dailyCount);
    let petsToShow = 0;
    for (let t of targets) {
      if (totalFart >= t) petsToShow++;
    }
    for (let i = 0; i < imagesToShow; i++) {
      for (let j = 0; j < petsToShow; j++) {
        if (clickSound) {
          clickSound.currentTime = 0;
          clickSound.play().catch(e => {});
        }
        const fartImg = document.createElement('img');
        fartImg.src = 'img/fart.png';
        fartImg.classList.add('fart-animation');
        fartImg.style.width = '60px';
        fartImg.style.height = '60px';
        const dog = document.querySelector('.main-logo');
        if (dog) {
          const dogRect = dog.getBoundingClientRect();
          fartImg.style.left = `${dogRect.right}px`;
          fartImg.style.top = `${dogRect.bottom - 50}px`;
        } else {
          fartImg.style.left = '50vw';
          fartImg.style.top = '50vh';
        }
        document.body.appendChild(fartImg);
        let speed = Math.max(400, 1200 - petsToShow * 150); 
        let maxX = Math.min(100 + petsToShow * 80, window.innerWidth - 100); 
        let maxY = Math.min(-100 - petsToShow * 40, -window.innerHeight / 2 + 100);
        fartImg.style.transition = `transform ${speed}ms cubic-bezier(.68,-0.55,.27,1.55), opacity ${speed}ms linear`;
        setTimeout(() => {
          fartImg.style.transform = `translateY(${maxY}px) translateX(${maxX}px) scale(1.2)`;
          fartImg.style.opacity = '0';
        }, 50);
        setTimeout(() => { fartImg.remove(); }, speed + 1000);
      }
    }
    previousCount = currentCount;
    countEl.textContent = currentCount;
    saveData(data);
    updateProgress();
  }

  function resetAtMidnight() {
  const totalFart = data.totalCount + Math.floor(data.dailyCount);
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24,0,0,0);
    const timeToMidnight = midnight - now;
    setTimeout(() => {
      if (window.phase1Complete) return;
      data = { date: new Date().toISOString().split('T')[0], dailyCount:0, totalCount:data.totalCount, successDays:data.successDays };
      countEl.textContent = 0;
      saveData(data);
      updateProgress();
      resetAtMidnight();
    }, timeToMidnight);
  }
  resetAtMidnight();

});