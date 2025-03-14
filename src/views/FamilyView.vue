<template>
    <div class="family-view">
        <BuzzCompetition 
          v-model="showBuzzCompetition" 
          :team1Name="team1Name"
          :team2Name="team2Name"
          :bluetooth-characteristic="bluetoothCharacteristic"
          @team-selected="activeTeam = $event"
        />
        <RoundComplete
          v-model="showPointsAnnouncement"
          :points="currentPoints"
          :teamName="pointsAnnouncementTeam === 1 ? team1Name : team2Name"
          :allAnswersRevealed="results.every(r => r.pass)"
          :totalLoss="team1Loss + team2Loss"
          :victoryMethod="victoryMethod"
          :isCheckingAnswers="isCheckingAnswers"
          @update:modelValue="handleRoundCompleteClose"
        />
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
                <v-col cols="2"></v-col>
                <v-col cols="3"></v-col>
                <v-col cols="2" class="d-flex justify-center">
                    <v-badge 
                      v-if="multiplierPoints > 1"
                      :content="`x${multiplierPoints}`" 
                      overlap="true" 
                      bordered 
                      offset-x="30" 
                      offset-y="30" 
                      class="large-badge"
                    >
                        <SmallDigitalScreen
                          :value="currentPoints"
                          :activeColor="activeTeam === 1 ? 'blue' : activeTeam === 2 ? 'red' : null"
                        />
                    </v-badge>
                    <SmallDigitalScreen
                      v-else
                      :value="currentPoints"
                      :activeColor="activeTeam === 1 ? 'blue' : activeTeam === 2 ? 'red' : null"
                    />
                </v-col>          
                <v-col cols="3"></v-col>
                <v-col cols="2"></v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-row>
                        <v-col cols="2" class="d-flex flex-column align-center large-badge">
                            <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                                <SmallDigitalScreen :value=team1Points />
                                <PlayerLabel playerNumber="1" :teamName="team1Name" :isActive="activeTeam === 1" />
                            </div>
                        </v-col>
                        <v-col cols="8">
                            <v-card outlined style="background-color: #000; opacity: 0.88; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px; border-radius: 40px;">
                                <v-row no-gutters>
                                    <v-col cols="1" style="padding-left: 2em;">
                                        <LossDigitalScreen :myLoss="team1Loss" :oponentLoss="team2Loss" />
                                    </v-col>
                                    
                                    <v-col cols="10">
                                        <ResultDigitalScreen :question="question" :results="results" />
                                    </v-col>
                                    
                                    <v-col cols="1" style="margin-left: -2rem;">
                                        <LossDigitalScreen :myLoss="team2Loss" :oponentLoss="team1Loss" />
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                        <v-col cols="2" class="d-flex flex-column align-center">
                            <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                                <SmallDigitalScreen :value=team2Points />
                                <PlayerLabel playerNumber="2" :teamName="team2Name" :isActive="activeTeam === 2" />
                            </div>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row class="mt-n4">
                <v-col cols="12" class="d-flex justify-center">
                    <v-col cols="8">
                        <GameTools 
                          @tool-action="handleToolAction" 
                          :round="round"
                        />
                    </v-col>
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
import GameTools from '@/components/GameTools.vue';
import RoundComplete from '@/components/RoundComplete.vue';
import backgroundVideo from '@/assets/video/background.mp4'
import { useBluetooth } from '@/composables/useBluetooth';

export default defineComponent({
  name: 'FamilyView',
  components: {
    SmallDigitalScreen,
    ResultDigitalScreen,
    LossDigitalScreen,
    PlayerLabel,
    BuzzCompetition,
    GameTools,
    RoundComplete
  },
  setup() {
    const { bluetoothDevice, bluetoothCharacteristic, isBluetoothConnected, initializeBluetooth, cleanup } = useBluetooth();
    return { bluetoothDevice, bluetoothCharacteristic, isBluetoothConnected, initializeBluetooth, cleanup };
  },
  data() {
    return {
      videoSrc: backgroundVideo,
      question: "",
      showBuzzCompetition: false,
      showPointsAnnouncement: false,
      pointsAnnouncementTeam: null,
      team1Name: '',
      team2Name: '',
      questionsData: null,
      currentQuestionIndex: 0,
      activeTeam: null,
      multiplierPoints: 1,
      results: [],
      currentSumPoints: 0,
      round: 1,
      team1Points: 0,
      team2Points: 0,
      team1Loss: 2,
      team2Loss: 0,
      roundCompleted: false,
      victoryMethod: null,
      isCheckingAnswers: false,
    }
  },
  computed: {
    currentPoints() {
      return this.currentSumPoints * this.multiplierPoints;
    }
  },
  async created() {
    const config = localStorage.getItem('familyGameConfig');
    if (!config) {
      this.$router.push('/start-family');
      return;
    }

    try {
      const { team1Name, team2Name, questionsData, isBluetoothConnected: wasConnected } = JSON.parse(config);
      this.team1Name = team1Name;
      this.team2Name = team2Name;
      this.questionsData = questionsData;
      
      if (this.questionsData?.questions?.length > 0) {
        this.loadQuestion(0);
        console.log('Załadowano pytania:', this.questionsData);
      } else {
        throw new Error('Brak pytań w pliku');
      }
      
      if (wasConnected) {
        await this.initializeBluetooth();
      }
    } catch (error) {
      console.error('Błąd podczas ładowania konfiguracji:', error);
      this.$router.push('/start-family');
    }
  },
  mounted() {
    const video = this.$refs.videoPlayer;
    if (video) {
      video.muted = true;
    }
  },
  methods: {
    loadQuestion(index) {
      if (this.questionsData?.questions?.[index]) {
        const questionData = this.questionsData.questions[index];
        this.question = questionData.question;
        this.results = questionData.answers.map((a, idx) => ({
          id: idx + 1,
          name: a.answer,
          points: a.points,
          pass: false
        }));
        this.currentQuestionIndex = index;
        this.currentSumPoints = 0;
        this.multiplierPoints = 1;
        this.victoryMethod = null;
        this.isCheckingAnswers = false;
        this.roundCompleted = false;
      }
    },
    handleToolAction(action) {
      if (this.showPointsAnnouncement) return;
      
      if (action.startsWith('show-answer-')) {
        if (!this.activeTeam && !this.roundCompleted && !this.victoryMethod) return;
        
        const num = parseInt(action.split('-').pop());
        const answer = this.results.find(r => r.id === num);
        if (answer && !answer.pass) {
          const index = this.results.indexOf(answer);
          this.results[index] = {
            ...answer,
            pass: true
          }
          
          if (this.victoryMethod === null) {
            this.currentSumPoints = this.results
              .filter(item => item.pass)
              .reduce((acc, item) => acc + item.points, 0);

            if ((this.team1Loss === 3 || this.team2Loss === 3) && answer.points > 0) {
              this.victoryMethod = 3;
              if (this.activeTeam === 1) {
                this.team1Points += this.currentPoints;
                this.pointsAnnouncementTeam = 1;
              } else {
                this.team2Points += this.currentPoints;
                this.pointsAnnouncementTeam = 2;
              }
              this.showPointsAnnouncement = true;
            }
          }

          if (this.results.every(r => r.pass)) {
            if (this.victoryMethod === 2 || this.victoryMethod === 3) {
              this.showPointsAnnouncement = true;
            } else if (this.victoryMethod === null) {
              this.victoryMethod = 1;
              
              if (this.activeTeam === 1) {
                this.team1Points += this.currentPoints;
              } else {
                this.team2Points += this.currentPoints;
              }
              
              this.pointsAnnouncementTeam = this.activeTeam;
              this.activeTeam = null;
              
              setTimeout(() => {
                this.showPointsAnnouncement = true;
              }, 1000);
            }
          }
        }
        return;
      }

      switch (action) {
        case 'buzz':
          if (this.showPointsAnnouncement) return;
          this.showBuzzCompetition = true;
          this.activeTeam = null;
          break;
        case 'swap':
          if (this.activeTeam) {
            this.activeTeam = this.activeTeam === 1 ? 2 : 1;
          }
          break;
        case 'restart':
          // TODO: Implementacja resetu gry
          break;
        case 'timer':
          // TODO: Start/Stop timera
          break;
        case 'points':
          if (this.showPointsAnnouncement) return;
          this.multiplierPoints = this.multiplierPoints === 3 ? 1 : this.multiplierPoints + 1;
          break;
        case 'loss':
          if (this.activeTeam === 1) {
            this.team1Loss++;
            if (this.team1Loss + this.team2Loss >= 4) {
              this.checkLossCondition();
              return;
            }
            
            if (this.team1Loss === 3) {
              this.activeTeam = 2;
            }
          } else if (this.activeTeam === 2) {
            this.team2Loss++;
            if (this.team1Loss + this.team2Loss >= 4) {
              this.checkLossCondition();
              return;
            }
            
            if (this.team2Loss === 3) {
              this.activeTeam = 1;
            }
          }
          break;
      }
    },
    checkLossCondition() {
      const totalLosses = this.team1Loss + this.team2Loss;
      
      if (totalLosses >= 4) {
        this.roundCompleted = true;
        
        if (this.victoryMethod !== 3) {
          this.victoryMethod = 2;
          
          if (this.activeTeam === 1) {
            this.team2Points += this.currentPoints;
            this.pointsAnnouncementTeam = 2;
          } else {
            this.team1Points += this.currentPoints;
            this.pointsAnnouncementTeam = 1;
          }
          
          this.showPointsAnnouncement = true;
        }
      }
    },
    handleRoundCompleteClose(value) {
      this.showPointsAnnouncement = value;
      if (!value) {
        if (this.results.every(r => r.pass)) {
          this.resetRound();
        }
      }
    },
    resetRound() {
      this.currentSumPoints = 0;
      this.multiplierPoints = 1;
      this.victoryMethod = null;
      this.isCheckingAnswers = false;
      this.roundCompleted = false;
      this.showPointsAnnouncement = false;
      this.results.forEach(r => r.pass = false);
      this.team1Loss = 0;
      this.team2Loss = 0;
      this.loadQuestion(this.currentQuestionIndex + 1);
    }
  },
  beforeUnmount() {
    this.cleanup();
  },
  watch: {
    showBuzzCompetition() {
      console.log('showBuzzCompetition changed to:', this.showBuzzCompetition);
    },
    team1Loss() {
      this.checkLossCondition();
    },
    team2Loss() {
      this.checkLossCondition();
    },
    results: {
      deep: true,
      handler() {
        if (this.team1Loss === 3 || this.team2Loss === 3) {
          this.checkLossCondition();
        }
      }
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

.large-badge :deep(.v-badge__badge) {
    font-size: 20px !important;
    height: 40px !important;
    min-width: 40px !important;
    font-weight: bold !important;
    border-width: 3px !important;
    z-index: 6;
    color: red;
}
</style>
