<template>
  <div class="host-panel-view">
    <v-container fluid class="host-container">
      <v-row class="question-row" no-gutters>
        <v-col cols="12">
          <div class="question-display">
            <h2 class="question-text">{{ currentQuestion || 'Brak pytania' }}</h2>
          </div>
        </v-col>
      </v-row>

      <v-row class="answers-row" no-gutters>
        <v-col 
          v-for="answer in answers" 
          :key="answer.id"
          :cols="getAnswerCols()"
          class="answer-col"
        >
          <v-card
            :class="['answer-card', { 'answer-selected': answer.pass, 'answer-available': !answer.pass }]"
            @click="selectAnswer(answer.id)"
            :disabled="answer.pass"
            elevation="4"
          >
            <v-card-text class="answer-content">
              <div class="answer-number">{{ answer.id }}</div>
              <div class="answer-text">{{ answer.name || '...' }}</div>
              <div class="answer-points">{{ answer.points }} pkt</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="controls-row" no-gutters>
        <v-col cols="12" class="d-flex justify-center align-center">
          <v-btn
            color="red"
            size="x-large"
            class="loss-button"
            @click="handleLoss"
            :disabled="!activeTeam"
          >
            <v-icon left>mdi-close-circle</v-icon>
            UTRATA
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="info-row" no-gutters>
        <v-col cols="6" class="text-center">
          <div class="info-label">Runda</div>
          <div class="info-value">{{ round }}</div>
        </v-col>
        <v-col cols="6" class="text-center">
          <div class="info-label">Aktualne punkty</div>
          <div class="info-value">{{ currentPoints || calculatedPoints }}</div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HostPanelView',
  data() {
    return {
      currentQuestion: '',
      answers: [],
      round: 1,
      currentPoints: 0,
      activeTeam: null,
      gameConfig: null,
      questionsData: null,
      currentQuestionIndex: 0,
      multiplierPoints: 1,
      channel: null,
    }
  },
  computed: {
    getAnswerCols() {
      return () => {
        const count = this.answers.length;
        if (count <= 2) return 6;
        if (count <= 4) return 6;
        if (count <= 6) return 4;
        return 3;
      }
    },
    calculatedPoints() {
      // Oblicz punkty na podstawie odkrytych odpowiedzi i mnożnika
      const revealedPoints = this.answers
        .filter(item => item.pass)
        .reduce((acc, item) => acc + item.points, 0);
      return revealedPoints * this.multiplierPoints;
    }
  },
  created() {
    // Sprawdź czy gra jest uruchomiona
    const config = localStorage.getItem('familyGameConfig');
    if (!config) {
      this.$router.push('/start-family');
      return;
    }

    try {
      const parsedConfig = JSON.parse(config);
      this.gameConfig = parsedConfig;
      this.questionsData = {
        questions: parsedConfig.questionsData
      };
    } catch (error) {
      this.$router.push('/start-family');
      return;
    }

    // Inicjalizuj BroadcastChannel do synchronizacji
    this.channel = new BroadcastChannel('family-game-sync');
    
    // Nasłuchuj aktualizacji stanu
    this.channel.onmessage = (event) => {
      this.handleStateUpdate(event.data);
    };

    // Załaduj początkowy stan
    this.loadInitialState();
  },
  beforeUnmount() {
    if (this.channel) {
      this.channel.close();
    }
  },
  methods: {
    loadInitialState() {
      // Spróbuj załadować stan z localStorage
      const gameState = localStorage.getItem('familyGameState');
      if (gameState) {
        try {
          const state = JSON.parse(gameState);
          // Najpierw ustaw currentQuestionIndex, żeby załadować odpowiedzi
          if (state.currentQuestionIndex !== undefined) {
            this.currentQuestionIndex = state.currentQuestionIndex;
            this.loadAnswersFromQuestionData();
          }
          // Potem zaktualizuj resztę stanu
          this.updateState(state);
        } catch (error) {
          console.error('Błąd podczas ładowania stanu:', error);
        }
      }
    },
    handleStateUpdate(data) {
      if (data.type === 'state-update') {
        this.updateState(data.state);
      }
    },
    updateState(state) {
      const previousQuestionIndex = this.currentQuestionIndex;
      
      if (state.currentQuestionIndex !== undefined) {
        this.currentQuestionIndex = state.currentQuestionIndex;
      }
      
      if (state.currentQuestion !== undefined) {
        this.currentQuestion = state.currentQuestion;
      }
      if (state.question !== undefined) {
        this.currentQuestion = state.question;
      }
      
      // Jeśli zmienił się indeks pytania, załaduj pytanie i odpowiedzi z questionsData
      if (state.currentQuestionIndex !== undefined && state.currentQuestionIndex !== previousQuestionIndex) {
        this.loadAnswersFromQuestionData();
      }
      
      // Jeśli nie mamy jeszcze pytania lub odpowiedzi, ale mamy indeks pytania, załaduj je
      if ((!this.currentQuestion || this.answers.length === 0) && this.currentQuestionIndex !== undefined) {
        this.loadAnswersFromQuestionData();
      }
      
      // Aktualizuj odpowiedzi z wyników (zachowaj stan odkrycia i zaktualizuj nazwy)
      if (state.results !== undefined && state.results.length > 0) {
        // Jeśli mamy już załadowane odpowiedzi, zaktualizuj tylko stan odkrycia i nazwy
        if (this.answers.length > 0) {
          this.answers = this.answers.map(answer => {
            const result = state.results.find(r => r.id === answer.id);
            if (result) {
              return {
                ...answer,
                name: result.name || answer.name || '',
                points: result.points || answer.points || 0,
                pass: result.pass || false
              };
            }
            return answer;
          });
        } else {
          // Jeśli nie mamy jeszcze odpowiedzi, załaduj je z results
          this.answers = state.results.map(r => ({
            id: r.id,
            name: r.name || '',
            points: r.points || 0,
            pass: r.pass || false
          }));
        }
      }
      
      if (state.round !== undefined) {
        this.round = state.round;
      }
      if (state.currentPoints !== undefined) {
        this.currentPoints = state.currentPoints;
      }
      if (state.activeTeam !== undefined) {
        this.activeTeam = state.activeTeam;
      }
      if (state.multiplierPoints !== undefined) {
        this.multiplierPoints = state.multiplierPoints;
      }
    },
    loadAnswersFromQuestionData() {
      // Załaduj wszystkie odpowiedzi dla aktualnego pytania
      if (this.questionsData && this.questionsData.questions && 
          this.questionsData.questions[this.currentQuestionIndex]) {
        const questionData = this.questionsData.questions[this.currentQuestionIndex];
        
        // Załaduj pytanie z questionsData (zawsze, żeby mieć aktualne)
        if (questionData.question) {
          this.currentQuestion = questionData.question;
        }
        
        if (questionData.answers && Array.isArray(questionData.answers)) {
          this.answers = questionData.answers.map((a, idx) => ({
            id: idx + 1,
            name: a.answer || '',
            points: a.points || 0,
            pass: false
          }));
        }
      }
    },
    selectAnswer(answerId) {
      // Wyślij akcję do głównego widoku
      if (this.channel) {
        this.channel.postMessage({
          type: 'action',
          action: `show-answer-${answerId}`
        });
      }
    },
    handleLoss() {
      if (!this.activeTeam) return;
      
      // Wyślij akcję utraty do głównego widoku
      if (this.channel) {
        this.channel.postMessage({
          type: 'action',
          action: 'loss'
        });
      }
    }
  }
});
</script>

<style scoped>
.host-panel-view {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  display: flex;
  flex-direction: column;
}

.host-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.question-row {
  flex: 0 0 auto;
  margin-bottom: 16px;
}

.question-display {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 16px;
  padding: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.question-text {
  color: #ffeb3b;
  font-family: 'PixelFont', monospace;
  font-size: 2rem;
  text-align: center;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 235, 59, 0.5);
  word-wrap: break-word;
}

.answers-row {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  align-content: flex-start;
}

.answer-col {
  padding: 6px;
}

.answer-card {
  height: 100%;
  min-height: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  background: rgba(0, 0, 0, 0.4) !important;
}

.answer-card.answer-available {
  border-color: rgba(255, 255, 255, 0.3);
}

.answer-card.answer-available:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.answer-card.answer-selected {
  background: rgba(76, 175, 80, 0.8) !important;
  border-color: #4caf50;
  box-shadow: 0 0 30px rgba(76, 175, 80, 0.6);
  animation: pulse-green 0.5s ease;
}

@keyframes pulse-green {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.answer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 12px !important;
  text-align: center;
}

.answer-number {
  font-size: 2rem;
  font-weight: bold;
  color: #ffeb3b;
  font-family: 'PixelFont', monospace;
  margin-bottom: 8px;
}

.answer-text {
  font-size: 1.2rem;
  color: white;
  font-family: 'PixelFont', monospace;
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.answer-points {
  font-size: 1rem;
  color: #ffeb3b;
  font-family: 'PixelFont', monospace;
  font-weight: bold;
}

.controls-row {
  flex: 0 0 auto;
  margin-bottom: 16px;
}

.loss-button {
  min-width: 200px;
  height: 60px;
  font-size: 1.5rem;
  font-weight: bold;
  font-family: 'PixelFont', monospace;
  text-transform: uppercase;
}

.info-row {
  flex: 0 0 auto;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-family: 'PixelFont', monospace;
  margin-bottom: 4px;
}

.info-value {
  color: #ffeb3b;
  font-size: 1.5rem;
  font-weight: bold;
  font-family: 'PixelFont', monospace;
}

/* Responsywność dla różnych rozmiarów ekranów */
@media (max-width: 600px) {
  .question-text {
    font-size: 1.5rem;
  }
  
  .answer-card {
    min-height: 100px;
  }
  
  .answer-number {
    font-size: 1.5rem;
  }
  
  .answer-text {
    font-size: 1rem;
  }
}

/* Orientacja pozioma (landscape) */
@media (orientation: landscape) {
  .host-container {
    padding: 12px;
  }
  
  .question-row {
    margin-bottom: 12px;
  }
  
  .question-text {
    font-size: 1.5rem;
  }
  
  .answer-card {
    min-height: 80px;
  }
  
  .answer-number {
    font-size: 1.2rem;
    margin-bottom: 4px;
  }
  
  .answer-text {
    font-size: 0.9rem;
    margin-bottom: 4px;
  }
  
  .answer-points {
    font-size: 0.8rem;
  }
  
  .loss-button {
    min-width: 150px;
    height: 50px;
    font-size: 1.2rem;
  }
}
</style>

