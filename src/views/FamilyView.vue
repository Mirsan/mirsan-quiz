<template>
    <div class="family-view">
        <BuzzCompetition 
          v-model="showBuzzCompetition" 
          :team1Name="team1Name"
          :team2Name="team2Name"
          :bluetooth-characteristic="bluetoothCharacteristic"
          :question="currentQuestion"
          :answersCount="questionsData?.questions[currentQuestionIndex]?.answers?.length || 0"
          @team-selected="activeTeam = $event"
          @show-question="showQuestionOnBoard"
          @dialog-closed="handleBuzzClose"
        />
        <RoundComplete
          v-model="showPointsAnnouncement"
          :points="currentPoints"
          :teamName="pointsAnnouncementTeam === 1 ? team1Name : team2Name"
          :allAnswersRevealed="results.every(r => r.pass)"
          :totalLoss="team1Loss + team2Loss"
          :victoryMethod="victoryMethod"
          :isCheckingAnswers="isCheckingAnswers"
          :isTeam1="pointsAnnouncementTeam === 1"
          :activeTeam="activeTeam"
          :isLastRound="isLastRound"
          @update:modelValue="handleRoundCompleteClose"
          @dialogOpened="handleDialogOpened"
          @dialogClosed="handleDialogClosed"
        />
        <EndGame
          v-model="showEndGame"
          :team1Name="team1Name"
          :team2Name="team2Name"
          :team1Points="team1Points"
          :team2Points="team2Points"
          :endGameType="endGameType"
          :totalRounds="round"
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
                <v-col cols="2">
                </v-col>
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
                            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; position: relative;">
                                <EventTeam 
                                  :teamNumber="1"
                                  :team1Loss="team1Loss"
                                  :team2Loss="team2Loss"
                                  :victoryMethod="victoryMethod"
                                />
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
                                        <ResultDigitalScreen :question="question" :results="results || []" :is-preparation-phase="isPreparationPhase" />
                                    </v-col>
                                    
                                    <v-col cols="1" style="margin-left: -2rem;">
                                        <LossDigitalScreen :myLoss="team2Loss" :oponentLoss="team1Loss" />
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                        <v-col cols="2" class="d-flex flex-column align-center">
                            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; position: relative;">
                                <EventTeam 
                                  :teamNumber="2"
                                  :team1Loss="team1Loss"
                                  :team2Loss="team2Loss"
                                  :victoryMethod="victoryMethod"
                                />
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
                          :current-points="Math.max(team1Points, team2Points)"
                          :answered-questions="currentQuestionIndex + 1"
                          :total-questions="questionsData?.questions?.length || 0"
                          :game-config="gameConfig"
                          :is-preparation-phase="isPreparationPhase"
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
import EventTeam from '@/components/EventTeam.vue';
import EndGame from '@/components/EndGame.vue';
import backgroundVideo from '@/assets/video/background.mp4'
import { useBluetooth } from '@/composables/useBluetooth';
import { useAudioManager } from '@/composables/useAudioManager';

export default defineComponent({
  name: 'FamilyView',
  components: {
    SmallDigitalScreen,
    ResultDigitalScreen,
    LossDigitalScreen,
    PlayerLabel,
    BuzzCompetition,
    GameTools,
    RoundComplete,
    EventTeam,
    EndGame
  },
  setup() {
    const { bluetoothDevice, bluetoothCharacteristic, isBluetoothConnected, initializeBluetooth, cleanup } = useBluetooth();
    const audioManager = useAudioManager();
    return { bluetoothDevice, bluetoothCharacteristic, isBluetoothConnected, initializeBluetooth, cleanup, audioManager };
  },
  data() {
    return {
      videoSrc: backgroundVideo,
      gameConfig: null,
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
      team1Loss: 0,
      team2Loss: 0,
      roundCompleted: false,
      victoryMethod: null,
      isCheckingAnswers: false,
      showEndGame: false,
      endGameType: null,
      isLastRound: false,
      currentQuestion: "",
      isPreparationPhase: false,
      preparationPhaseTeam1Score: null,
      preparationPhaseTeam2Score: null,
    }
  },
  computed: {
    currentPoints() {
      const revealedPoints = this.results
        .filter(item => item.pass)
        .reduce((acc, item) => acc + item.points, 0);
      
      return revealedPoints * this.multiplierPoints;
    }
  },
  async created() {
    this.audioManager.stopAll();
    
    const config = localStorage.getItem('familyGameConfig');
    if (!config) {
      this.$router.push('/start-family');
      return;
    }

    try {
      const parsedConfig = JSON.parse(config);
      
      if (!Array.isArray(parsedConfig.questionsData)) {
        throw new Error('Brak pytań w pliku');
      }

      this.team1Name = parsedConfig.team1Name;
      this.team2Name = parsedConfig.team2Name;
      this.questionsData = {
        questions: parsedConfig.questionsData
      };
      this.gameConfig = parsedConfig;
      
      this.loadQuestion(0);
      
      if (parsedConfig.isBluetoothConnected) {
        await this.initializeBluetooth();
      }
    } catch (error) {
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
      if (this.checkGameEndCondition()) {
        return;
      }

      if (this.questionsData?.questions?.[index]) {
        this.currentQuestionIndex = index;
        this.currentSumPoints = 0;
        
        if (this.gameConfig?.autoIncreaseMultiplier) {
          if (index >= 4) {
            this.multiplierPoints = 3;
          } else if (index === 3) {
            this.multiplierPoints = 2;
          } else {
            this.multiplierPoints = 1;
          }
        } else {
          this.multiplierPoints = 1;
        }
        
        this.victoryMethod = null;
        this.isCheckingAnswers = false;
        this.roundCompleted = false;
        this.activeTeam = null;
        
        this.question = "";
        const questionData = this.questionsData.questions[index];
        this.currentQuestion = questionData.question;
        
        if (!questionData?.answers || !Array.isArray(questionData.answers)) {
          console.error('Brak poprawnych odpowiedzi dla pytania:', index);
          this.results = [];
          return;
        }

        this.results = questionData.answers.map((a, idx) => ({
          id: idx + 1,
          name: "",
          points: a.points || 0,
          pass: false
        }));
        
        this.round = index + 1;
        
        this.isPreparationPhase = true;
        this.preparationPhaseTeam1Score = null;
        this.preparationPhaseTeam2Score = null;
        
        setTimeout(() => {
          this.showBuzzCompetition = true;
        }, 500);
      } else {
        if (this.gameConfig.gameEndCondition === 'all') {
          this.showEndGame = true;
          this.endGameType = 'questions';
        }
      }
    },
    showQuestionOnBoard() {
      const questionData = this.questionsData.questions[this.currentQuestionIndex];
      if (!questionData?.answers || !Array.isArray(questionData.answers)) {
        console.error('Brak poprawnych odpowiedzi dla pytania:', this.currentQuestionIndex);
        this.results = [];
        return;
      }

      this.question = this.currentQuestion;
      try {
        const newResults = questionData.answers.map((a, idx) => ({
          id: idx + 1,
          name: a.answer || "",
          points: a.points || 0,
          pass: false
        }));
        
        if (newResults.length > 0 && newResults.length <= 10) {
          this.results = newResults;
        } else {
          console.error('Nieprawidłowa liczba odpowiedzi:', newResults.length);
          this.results = [];
        }
      } catch (error) {
        console.error('Błąd podczas tworzenia tablicy wyników:', error);
        this.results = [];
      }
    },
    handleToolAction(action) {
      if (this.showPointsAnnouncement || this.showBuzzCompetition) return;
      
      if (action === 'loss' && this.isPreparationPhase) {
        const currentTeam = this.activeTeam;
        const otherTeam = currentTeam === 1 ? 2 : 1;
        
        // Traktuj loss jak trafienie w 0 punktów
        if (currentTeam === 1) {
          this.preparationPhaseTeam1Score = 0;
        } else {
          this.preparationPhaseTeam2Score = 0;
        }

        const otherTeamScore = currentTeam === 1 ? this.preparationPhaseTeam2Score : this.preparationPhaseTeam1Score;

        // Jeśli to pierwsza odpowiedź
        if (otherTeamScore === null) {
          this.activeTeam = otherTeam;
          return;
        }

        // Jeśli poprzednia drużyna trafiła (ma punkty)
        if (otherTeamScore > 0) {
          this.isPreparationPhase = false;
          this.activeTeam = otherTeam; // Poprzednia drużyna wygrywa, bo ma więcej niż 0
          return;
        }

        // Jeśli obie drużyny spudłowały - kontynuujemy
        this.activeTeam = otherTeam;
        return;
      }

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
          
          if (this.isPreparationPhase) {
            const currentTeam = this.activeTeam;
            const score = answer.points;
            const otherTeam = currentTeam === 1 ? 2 : 1;
            
            // Zapisz wynik dla aktualnej drużyny
            if (currentTeam === 1) {
              this.preparationPhaseTeam1Score = score;
            } else {
              this.preparationPhaseTeam2Score = score;
            }

            // Przypadek 1: Trafienie najwyżej punktowanej odpowiedzi
            const highestPointsAnswer = this.results
              .reduce((max, current) => current.points > max.points ? current : max);
            if (answer.id === highestPointsAnswer.id) {
              this.isPreparationPhase = false;
              this.activeTeam = currentTeam;
              return;
            }

            const otherTeamScore = currentTeam === 1 ? this.preparationPhaseTeam2Score : this.preparationPhaseTeam1Score;

            // Przypadek 2: Pierwsza drużyna trafiła, czekamy na odpowiedź drugiej
            if (otherTeamScore === null && score > 0) {
              this.activeTeam = otherTeam;
              return;
            }

            // Przypadek 2b: Druga drużyna odpowiada po trafieniu pierwszej
            if (otherTeamScore !== null && otherTeamScore > 0) {
              this.isPreparationPhase = false;
              this.activeTeam = score > otherTeamScore ? currentTeam : otherTeam;
              return;
            }

            // Przypadek 3: Pierwsza drużyna spudłowała, druga trafia
            if (otherTeamScore !== null && otherTeamScore === 0 && score > 0) {
              this.isPreparationPhase = false;
              this.activeTeam = currentTeam;
              return;
            }

            // Przypadek 4: Obie drużyny spudłowały lub pierwsza odpowiedź
            if (score > 0) {
              // Ktoś w końcu trafił - koniec fazy
              this.isPreparationPhase = false;
              this.activeTeam = currentTeam;
            } else {
              // Pudło - kolejna drużyna próbuje
              this.activeTeam = otherTeam;
            }
            return;
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
          if (this.showPointsAnnouncement || this.showBuzzCompetition) return;
          if (this.team1Loss + this.team2Loss >= 4) return;
          
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
      
      if (totalLosses >= 4 && this.victoryMethod === null) {
        this.roundCompleted = true;     
        this.victoryMethod = 2;

        if (this.currentPoints > 0) {
          if (this.activeTeam === 1) {
            this.team2Points += this.currentPoints;
            this.pointsAnnouncementTeam = 2;
          } else {
            this.team1Points += this.currentPoints;
            this.pointsAnnouncementTeam = 1;
          }
        } else {
          this.pointsAnnouncementTeam = this.activeTeam;
        }
        
        this.showPointsAnnouncement = true;
      }
    },
    handleRoundCompleteClose(value) {
      this.showPointsAnnouncement = value;
      if (!value) {
        if (this.isLastRound) {
          if (this.results.every(r => r.pass)) {
            setTimeout(() => {
              this.showEndGame = true;
              this.endGameType = this.gameConfig.gameEndCondition;
            }, 100);
          } else {
            this.activeTeam = null;
          }
        } else if (this.results.every(r => r.pass)) {
          if (Array.isArray(this.results) && this.results.length > 0) {
            this.resetRound();
          }
        }
        this.activeTeam = null;
      }
    },
    resetRound() {
      this.currentSumPoints = 0;
      this.multiplierPoints = 1;
      this.victoryMethod = null;
      this.isCheckingAnswers = false;
      this.roundCompleted = false;
      this.showPointsAnnouncement = false;
      this.results = [];
      this.team1Loss = 0;
      this.team2Loss = 0;
      this.loadQuestion(this.currentQuestionIndex + 1);
    },
    handleDialogOpened() {
      this.audioManager.stopAll();
      setTimeout(() => {
        this.audioManager.playPause();
      }, 100);
    },
    handleDialogClosed(isNextRound) {
      if (isNextRound) {
        this.audioManager.stopAll();
      }
    },
    handleEndGameClose() {
      this.showEndGame = false;
      this.$router.push('/start-family');
    },
    checkGameEndCondition() {
      if (!this.gameConfig) return false;

      const maxPoints = Math.max(this.team1Points, this.team2Points);
      let endConditionMet = false;

      switch (this.gameConfig.gameEndCondition) {
        case 'points':
          if (maxPoints >= this.gameConfig.gameEndLimit) {
            this.isLastRound = true;
            this.endGameType = 'points';
            endConditionMet = true;
          }
          break;
        
        case 'questions':
          if (this.currentQuestionIndex + 1 >= this.gameConfig.gameEndLimit) {
            this.isLastRound = true;
            this.endGameType = 'rounds';
            endConditionMet = true;
          }
          break;
      }

      const noMoreQuestions = this.currentQuestionIndex + 1 >= (this.questionsData?.questions?.length || 0);
      
      if (noMoreQuestions && !endConditionMet) {
        this.isLastRound = true;
        this.endGameType = 'questions';
        return true;
      }

      return endConditionMet;
    },
    handleBuzzClose() {
      this.showBuzzCompetition = false;
    }
  },
  beforeUnmount() {
    this.cleanup();
  },
  watch: {
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
    },
    team1Points() {
      this.checkGameEndCondition();
    },
    team2Points() {
      this.checkGameEndCondition();
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

.tooltip-label {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 4px;
    z-index: 10;
    white-space: nowrap;
}
</style>
