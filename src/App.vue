<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Preload fonts
    this.preloadFonts();
  },
  methods: {
    preloadFonts() {
      // Preload PixelFont
      const pixelFont = new FontFace('PixelFont', 'url(./assets/fonts/PixelFont.ttf)');
      pixelFont.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log('PixelFont loaded successfully');
      }).catch((error) => {
        console.error('Error loading PixelFont:', error);
      });

      // Preload DigitalFont
      const digitalFont = new FontFace('DigitalFont', 'url(./assets/fonts/DigitalFont.ttf)');
      digitalFont.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log('DigitalFont loaded successfully');
      }).catch((error) => {
        console.error('Error loading DigitalFont:', error);
      });
    }
  }
}
</script>

<style>
html {
  overflow-y: hidden !important;
}

.v-application {
  overflow: hidden !important;
}

.v-main {
  overflow: hidden !important;
}

/* Global styles */
@font-face {
  font-family: 'PixelFont';
  src: url('./assets/fonts/PixelFont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

@font-face {
  font-family: 'DigitalFont';
  src: url('./assets/fonts/DigitalFont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
