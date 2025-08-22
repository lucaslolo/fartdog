
document.addEventListener('DOMContentLoaded', () => {
  const showBtn = document.getElementById('show-btn');
  const terminal = document.getElementById('terminal');
  const historyEl = document.getElementById('history');
  const cmdInput = document.getElementById('cmd');

  if (!historyEl || !cmdInput || !terminal || !cmdInput) {
    console.error('One or more DOM elements are missing.');
    return;
  }

  const commands = {
    fartdog: () => [
    '// Booting FartDog Core System...',
    '✅ Systems online.',
    '✅ Gas reserves detected.',
    '✅ Fart engines warming up 💨',
    '',
    'Hey humans, it’s me, FARTDOG 🐕',
    'I managed to fart once before… but it was a glitch in my code!',
    'Now, my energy is drained and I can’t do it alone.',
    'I need YOU and everyone in the community to help me blast!',
    '',
    '➡ Phase 2 unlocks at an average of 1,450,000 FARTS over 24 hours!',
    'Let’s do this together and make history 🚀',
    '',
    'Type GOAL to see how you can assist me!'
  ],
  goal: () => [
    '// Initializing FartDog Goal Module...',
    '✅ Module online.',
    '',
  'Here’s how my fart system works:',
  '- I have a counter that resets every 24 hours.',
  '- The number of farts I produce depends on FartDog\'s market cap.',
  '- The bigger the market cap, the stronger my farts!',
  '',
  'Our goal is to reach an average of 1,450,000 FARTS over 24 hours.',
  'Why? Because I want to last and stay strong for the long term!',
  '',
  'Join me, and together we can keep FartDog powerful 🚀',
  '',
  'Type FARTCAT to see what you can do!'
  ],

  fartcat: () => [
  '// Accessing FartCat Memories...',
  '✅ Connection established… somehow.',
  '',
  'I am somehow linked to FartCat… I don’t know exactly how.',
  'But I remember: on June 15th, we exploded together 💥',
  '',
  'Now, I have one goal: to become the strongest animal!',
  'I want to surpass FartCat and be the ultimate farting champion!',
  '',
  'Join me, and let’s show the world what FartDog can do 🚀',
  '',
  'Type mission to see what you can do!'
],
  mission: () => [
  '// Loading missions...',
  'FartDog missions! 🐕‍💨',
  'You have 7 missions to become stronger and unlock your full power.',
  '',
  'Mission 1: 10,000 FARTS → sound 2%',
  'Mission 2: 50,000 FARTS → sound 9%',
  'Mission 3: 100,000 FARTS → sound 21%',
  'Mission 4: 250,000 FARTS → sound 37%',
  'Mission 5: 500,000 FARTS → sound 51%',
  'Mission 6: 1,000,000 FARTS → sound 69%',
  'Mission 7: 1,450,000 FARTS → sound 100% + PHASE 2 + FART NEWS',
  '',
  'Each mission makes you stronger. Your goal is to keep farting and reach Phase 2!',
  'Type POWER for more commands.'
  ],
  power: () => [
    '// Activating motivational mode...',
    'FartDog warriors! 🐕‍💨',
    'You have the power to help me reach Phase 2!',
    'Every single fart counts — together we can achieve the impossible!',
    'Remember: the more we fart, the stronger I become!',
    'Keep pushing, don’t give up, and let’s make history!',
    '🚀 PHASE 2 is waiting for us!',
    'You can check the price with marketcap and clean the terminal with clear command.'
  ],

    clear: () => { historyEl.innerHTML=''; return []; },
    marketcap: () => [`Market Cap: $${marketcap.toLocaleString()}`],
  };
  terminal.style.background = '#000';
  terminal.style.border = '2px solid #0f0';
  terminal.style.padding = '1rem';
  terminal.style.width = '90%';
  terminal.style.maxWidth = '800px';
  terminal.style.height = '60vh';
  terminal.style.marginTop = '2rem';
  terminal.style.marginBottom = '5rem';
  terminal.style.overflowY = 'auto';
  terminal.style.flexDirection = 'column';
  terminal.style.color = '#e0e0e0';
  terminal.style.fontFamily = 'monospace';
  terminal.style.fontSize = '16px';
  historyEl.style.margin = '0';
  historyEl.style.padding = '0';
  showBtn.addEventListener('click', () => {
    terminal.style.display = terminal.style.display === 'none' ? 'block' : 'none';
  });

  function typeInTerminal(text, callback) {
    if (historyEl.children.length > 0) {
      const sep = document.createElement('div');
      sep.style.borderTop = '1px solid #333';
      sep.style.margin = '8px 0';
      historyEl.appendChild(sep);
    }
    const p = document.createElement('p');
    p.style.margin = '4px 0';
    p.style.padding = '2px 8px';
    p.style.borderRadius = '4px';
    p.style.fontFamily = 'monospace';
    p.style.fontSize = '16px';
    p.style.background = historyEl.children.length % 2 === 0 ? '#222' : '#202020';
    let htmlText = text.replace(/(MISSION|FARTCAT|GOAL|POWER|CLEAR|MARKETCAP)/gi,
      match => `<span style='color:#ffd700;font-weight:bold;'>${match}</span>`);
    let i = 0;
    function typeChar() {
      if (i <= htmlText.length) {
        let current = htmlText.slice(0, i);
        if (current.endsWith('>')) {
          p.innerHTML = current;
        } else {
          p.textContent = current;
        }
        i++;
        setTimeout(typeChar, 4 + Math.random() * 10);
      } else if (callback) {
        p.innerHTML = htmlText;
        callback();
      }
      historyEl.scrollTop = historyEl.scrollHeight;
    }
    historyEl.appendChild(p);
    typeChar();
  }

  cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = cmdInput.value.trim().toLowerCase();
      cmdInput.value = '';
      const output = commands[input] ? commands[input]() : [`Unknown command: ${input}`];
      let idx = 0;
      function typeNext() {
        if (idx < output.length) {
          typeInTerminal(output[idx], () => { idx++; typeNext(); });
        }
      }
      typeNext();
    }
  });
});