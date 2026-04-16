

const accentColors = [
  { name: 'Indigo',  value: '#5c6bc0' },
  { name: 'Violet',  value: '#7c3aed' },
  { name: 'Rose',    value: '#e11d48' },
  { name: 'Amber',   value: '#d97706' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Sky',     value: '#0284c7' },
  { name: 'Slate',   value: '#475569' },
];

let isDarkMode  = false;
let fontSize = 16;
let accentColor = '#5c6bc0';

//refs
const darkSwitch = document.getElementById('dark-mode-switch');
const themeIcon = document.getElementById('themeIcon');
const fontPreview = document.getElementById('fontPreview');
const fontSizeLabel = document.getElementById('fontSizeLabel');
const fontDown = document.getElementById('fontDown');
const fontUp = document.getElementById('fontUp');
const colorSwatches = document.getElementById('colorSwatches');
const profileName = document.getElementById('profileName');
const profileDesc = document.getElementById('profileDescription');
const btnSave = document.getElementById('btnSave');
const btnReset = document.getElementById('btnReset');

// Load from localStorage
function loadFromStorage() {
  const saved = JSON.parse(localStorage.getItem('userSettings') || '{}');

  isDarkMode = saved.isDarkMode  ?? false;
  fontSize = saved.fontSize ?? 16;
  accentColor = saved.accentColor ?? '#5c6bc0';

  profileName.value = saved.profileName ?? '';
  profileDesc.value = saved.profileDescription ?? '';

  applyTheme();
  applyFontSize();
  applyAccentColor();

  darkSwitch.checked = isDarkMode;
}

//Save to localStorage
function saveToStorage() {
  localStorage.setItem('userSettings', JSON.stringify({
    isDarkMode,
    fontSize,
    accentColor,
    profileName: profileName.value,
    profileDescription: profileDesc.value,
  }));
}

//Theme
function applyTheme() {
  document.body.classList.toggle('dark', isDarkMode);
  themeIcon.textContent = isDarkMode ? '🌙' : '☀️';
}

darkSwitch.addEventListener('change', () => {
  isDarkMode = darkSwitch.checked;
  applyTheme();
  saveToStorage();
});

//Font size
function applyFontSize() {
  document.documentElement.style.setProperty('--base-font-size', fontSize + 'px');
  fontPreview.style.fontSize = fontSize + 'px';
  fontSizeLabel.textContent = fontSize + 'px';
  fontDown.disabled = fontSize <= 12;
  fontUp.disabled = fontSize >= 24;
}

fontDown.addEventListener('click', () => {
  if (fontSize > 12) { 
    fontSize--; applyFontSize(); saveToStorage(); 
    }
});

fontUp.addEventListener('click', () => {
  if (fontSize < 24) { 
    fontSize++; applyFontSize(); saveToStorage(); 
    }
});

//Accent color 
function applyAccentColor() {
  document.documentElement.style.setProperty('--accent', accentColor);
  document.documentElement.style.setProperty('--accent-tint', accentColor + '22');
  // update active swatch
  document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.classList.toggle('color-swatch--active', btn.dataset.color === accentColor);
  });
}

function buildSwatches() {
  accentColors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-swatch';
    btn.dataset.color = color.value;
    btn.title = color.name;
    btn.style.background = color.value;
    btn.addEventListener('click', () => {
      accentColor = color.value;
      applyAccentColor();
      saveToStorage();
    });
    colorSwatches.appendChild(btn);
  });
}

//Save button
btnSave.addEventListener('click', async () => {
  btnSave.disabled = true;
  btnSave.textContent = 'Saving…';
  saveToStorage();

  await fetch('/api/settings', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ isDarkMode, fontSize, accentColor }),
  }).catch(() => {});

  btnSave.disabled = false;
  btnSave.textContent = 'Save Settings';
});

// Reset
btnReset.addEventListener('click', () => {
  isDarkMode = false;
  fontSize = 16;
  accentColor = '#5c6bc0';

  profileName.value = '';
  profileDesc.value = '';
  darkSwitch.checked = false;

  applyTheme();
  applyFontSize();
  applyAccentColor();
  saveToStorage();
});

buildSwatches();
loadFromStorage();