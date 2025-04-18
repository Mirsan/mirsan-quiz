import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import './assets/styles/main.css'
import { initializeDefaultTopics } from './firebase/topics'

// Preładowanie czcionek, aby zapobiec miganiu
const preloadFonts = () => {
  const pixelFont = new FontFace('PixelFont', 'url(./assets/fonts/PixelFont.ttf)');
  const digitalFont = new FontFace('DigitalFont', 'url(./assets/fonts/DigitalFont.ttf)');
  
  Promise.all([
    pixelFont.load(),
    digitalFont.load()
  ]).then(fonts => {
    fonts.forEach(font => {
      document.fonts.add(font);
    });
  }).catch(err => {
    console.error('Nie udało się załadować czcionek:', err);
  });
};

// Wywołanie funkcji preładowania czcionek
preloadFonts();

// Inicjalizacja domyślnych tematów
initializeDefaultTopics().catch(err => {
  console.error('Nie udało się zainicjalizować tematów:', err);
});

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')
