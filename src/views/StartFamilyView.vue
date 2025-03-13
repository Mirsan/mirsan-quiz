<template>
  <div class="start-family-view">
    <video
      ref="videoPlayer"
      class="background-video"
      autoplay
      loop
      muted
      playsinline
    >
      <source :src="videoSrc" type="video/mp4">
    </video>
    
    <StarterPanel @game-start="handleGameStart" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import StarterPanel from '@/components/StarterPanel.vue';
import backgroundVideo from '@/assets/video/background.mp4'

export default defineComponent({
  name: 'StartFamilyView',
  components: {
    StarterPanel
  },
  data() {
    return {
      videoSrc: backgroundVideo
    }
  },
  methods: {
    async handleGameStart(config) {
      // Czytamy zawartość pliku
      const reader = new FileReader();
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(config.questionsFile);
      });

      // Zapisujemy konfigurację w localStorage bez obiektu File
      localStorage.setItem('familyGameConfig', JSON.stringify({
        team1Name: config.team1Name,
        team2Name: config.team2Name,
        questionsData: JSON.parse(fileContent)
      }));

      // Przekierowujemy do właściwej gry
      this.$router.push('/family');
    }
  }
});
</script>

<style scoped>
.start-family-view {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.background-video {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: 1;
  object-fit: cover;
  transform: translateX(0) translateY(0);
}
</style> 