<template>
    <div class="family-view">
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

        <v-container class="content-container flex-wrap">
            <v-row>
                <v-col cols="12" class="d-flex justify-center">
                    <SmallDigitalScreen :value="999" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-row>
                        <v-col cols="2">
                            <SmallDigitalScreen :value="32" />
                            <PlayerLabel playerNumber="1" playerName="Niebiescy" />
                        </v-col>
                        <v-col cols="8">
                            <v-card outlined style="background-color: black; border-radius: 40px;">
                                <v-row no-gutters>
                                    <v-col cols="1">
                                        <LossDigitalScreen :loss="1" />
                                    </v-col>
                                    
                                    <v-col cols="10">
                                        <ResultDigitalScreen :question="question" :results="results" />
                                    </v-col>
                                    
                                    <v-col cols="1">
                                        <LossDigitalScreen :loss="3" />
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                        <v-col cols="2">
                            <SmallDigitalScreen :value="32" />
                            <PlayerLabel playerNumber="2" playerName="Czerwoni" />
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import SmallDigitalScreen from '@/components/SmallDigitalScreen.vue';
import ResultDigitalScreen from '@/components/ResultDigitalScreen.vue';
import LossDigitalScreen from '@/components/LossDigitalScreen.vue';
import PlayerLabel from '@/components/PlayerLabel.vue';
import backgroundVideo from '@/assets/video/background.mp4'

export default defineComponent({
  name: 'FamilyView',
  components: {
    SmallDigitalScreen,
    ResultDigitalScreen,
    LossDigitalScreen,
    PlayerLabel
  },
  data() {
    return {
      videoSrc: backgroundVideo,
      question: "W sypialni na P?",
      results: [
        { id: 1, name: 'Posciel', points: 35, pass: false },
        { id: 2, name: 'Poduszka', points: 17, pass: true },
        { id: 3, name: 'Przescieradlo', points: 12, pass: false },
        { id: 5, name: 'Polka', points: 8, pass: true },
      ]
    }
  },
  mounted() {
    // Opcjonalnie możemy kontrolować wideo przez ref
    const video = this.$refs.videoPlayer;
    if (video) {
      video.volume = 0.5; // Ustawienie domyślnej głośności na 50%
    }
  }
});
</script>

<style scoped>
.family-view {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
}

.content-container {
    position: relative;
    z-index: 2;
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
