import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/app.css';
import { loadJSON } from './api';

const SETTINGS_KEY = 'spotifyClone.settings';

const DEFAULT_SETTINGS = {
  displayName: 'Guest',
  profileDescription: "We don't know much about Guest, but we're sure they have great music taste!",
  isDarkMode: false,
  fontSize: 16,
  accentColor: '#1db954',
};

// Apply saved theme before the app mounts to avoid a flash of unstyled content.
function applyTheme(settings) {
  const { isDarkMode, fontSize, accentColor } = settings;
  document.body.classList.toggle('theme-dark', Boolean(isDarkMode));
  document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
  document.documentElement.style.setProperty('--accent', accentColor);
  document.documentElement.style.setProperty('--accent-soft', `${accentColor}22`);
}

applyTheme(loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS));

createApp(App).use(router).mount('#app');
