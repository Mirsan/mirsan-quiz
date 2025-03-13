<template>
    <div class="family-view">
        <BuzzCompetition v-model="showBuzzCompetition" />
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
                    <SmallDigitalScreen :value="164" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-row>
                        <v-col cols="2">
                            <SmallDigitalScreen :value="4" />
                            <PlayerLabel playerNumber="1" :teamName="team1Name" />
                        </v-col>
                        <v-col cols="8">
                            <v-card outlined style="background-color: #000; opacity: 0.88; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px; border-radius: 40px;">
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
                        <v-col cols="2" class="d-flex flex-column align-center">
                            <SmallDigitalScreen :value="17" />
                            <PlayerLabel playerNumber="2" :teamName="team2Name" />
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
import BuzzCompetition from '@/components/BuzzCompetition.vue';
import backgroundVideo from '@/assets/video/background.mp4'

export default defineComponent({
  name: 'FamilyView',
  components: {
    SmallDigitalScreen,
    ResultDigitalScreen,
    LossDigitalScreen,
    PlayerLabel,
    BuzzCompetition
  },
  data() {
    return {
      videoSrc: backgroundVideo,
      question: "W sypialni na P?",
      showBuzzCompetition: false,
      team1Name: '',
      team2Name: '',
      questionsData: null,
      results: [
        { id: 1, name: 'Posciel', points: 35, pass: false },
        { id: 2, name: 'Poduszka', points: 17, pass: true },
        { id: 3, name: 'Przescieradlo', points: 12, pass: false },
        { id: 4, name: 'Polka', points: 8, pass: true },
      ]
    }
  },
  created() {
    // Sprawdzamy czy mamy konfigurację
    const config = localStorage.getItem('familyGameConfig');
    if (!config) {
      // Jeśli nie ma konfiguracji, przekierowujemy do start-family
      this.$router.push('/start-family');
      return;
    }

    try {
      // Wczytujemy konfigurację
      const { team1Name, team2Name, questionsData } = JSON.parse(config);
      this.team1Name = team1Name;
      this.team2Name = team2Name;
      this.questionsData = questionsData;
    } catch (error) {
      console.error('Błąd podczas wczytywania konfiguracji:', error);
      this.$router.push('/start-family');
    }
  },
  mounted() {
    const video = this.$refs.videoPlayer;
    if (video) {
      video.muted = true;
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
