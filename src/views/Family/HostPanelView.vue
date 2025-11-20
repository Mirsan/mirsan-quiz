<template>
  <div class="host-panel-view">
    <div class="round-badge">
      Runda {{ round }}
    </div>
    <div v-if="activeTeam" class="active-team-badge" :class="`team-${activeTeam}`">
      <div class="team-color-indicator" :class="`team-${activeTeam}`"></div>
      <div class="team-name">{{ activeTeamName }}</div>
    </div>
    <v-container fluid class="host-container">
      <v-row class="question-row" no-gutters>
        <v-col cols="12">
          <div class="question-display">
            <h2 class="question-text">{{ currentQuestion || 'Brak pytania' }}</h2>
          </div>
        </v-col>
      </v-row>

      <div class="answers-container">
        <div 
          v-for="(column, colIndex) in answerColumns" 
          :key="`col-${colIndex}`"
          class="answer-column"
        >
          <v-card
            v-for="answer in column"
            :key="`answer-${answer.id}`"
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
        </div>
      </div>

      <div class="controls-container">
        <v-btn
          color="green"
          size="large"
          class="control-button"
          @click="handleAction('swap')"
        >
          <v-icon left>mdi-swap-horizontal</v-icon>
          Zmiana drużyny
        </v-btn>
        <v-btn
          color="orange"
          size="large"
          class="control-button"
          @click="handleAction('timer')"
        >
          <v-icon left>mdi-timer</v-icon>
          Timer
        </v-btn>
        <v-btn
          color="yellow"
          size="large"
          class="control-button"
          @click="handleAction('points')"
        >
          <v-icon left>mdi-numeric</v-icon>
          Punkty (x{{ multiplierPoints }})
        </v-btn>
        <v-btn
          color="blue"
          size="large"
          class="control-button undo-loss-button"
          @click="handleUndoLoss"
          :disabled="!canUndoLoss"
        >
          <v-icon left>mdi-undo</v-icon>
          Cofnij utratę
        </v-btn>
        <v-btn
          color="red"
          size="large"
          class="control-button loss-button"
          @click="handleLoss"
          :disabled="!activeTeam"
        >
          <v-icon left>mdi-close-circle</v-icon>
          UTRATA
        </v-btn>
      </div>
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
      team1Loss: 0,
      team2Loss: 0,
      team1Name: '',
      team2Name: '',
    }
  },
  computed: {
    answerColumns() {
      // Podziel odpowiedzi na kolumny po 2 odpowiedzi każda
      if (!this.answers || this.answers.length === 0) {
        return [];
      }
      const columns = [];
      for (let i = 0; i < this.answers.length; i += 2) {
        columns.push(this.answers.slice(i, i + 2));
      }
      return columns;
    },
    calculatedPoints() {
      // Oblicz punkty na podstawie odkrytych odpowiedzi i mnożnika
      const revealedPoints = this.answers
        .filter(item => item.pass)
        .reduce((acc, item) => acc + item.points, 0);
      return revealedPoints * this.multiplierPoints;
    },
    canUndoLoss() {
      // Można cofnąć utratę tylko jeśli jest aktywny zespół i ma co najmniej 1 utratę
      if (!this.activeTeam) return false;
      if (this.activeTeam === 1) {
        return this.team1Loss > 0;
      } else if (this.activeTeam === 2) {
        return this.team2Loss > 0;
      }
      return false;
    },
    activeTeamName() {
      if (this.activeTeam === 1) {
        return this.team1Name || 'Drużyna 1';
      } else if (this.activeTeam === 2) {
        return this.team2Name || 'Drużyna 2';
      }
      return '';
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
      // Załaduj nazwy drużyn z konfiguracji
      if (parsedConfig.team1Name) {
        this.team1Name = parsedConfig.team1Name;
      }
      if (parsedConfig.team2Name) {
        this.team2Name = parsedConfig.team2Name;
      }
    } catch (error) {
      this.$router.push('/start-family');
      return;
    }

    // Inicjalizuj BroadcastChannel do synchronizacji
    try {
      this.channel = new BroadcastChannel('family-game-sync');
      
      // Nasłuchuj aktualizacji stanu
      this.channel.onmessage = (event) => {
        this.handleStateUpdate(event.data);
      };
    } catch (error) {
      console.warn('BroadcastChannel nie jest dostępny:', error);
    }

    // Załaduj początkowy stan
    this.loadInitialState();
    
    // Jeśli nie ma stanu, załaduj pierwsze pytanie
    if (!this.currentQuestion && this.questionsData && this.questionsData.questions && this.questionsData.questions.length > 0) {
      this.currentQuestionIndex = 0;
      this.loadAnswersFromQuestionData();
    }
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
          // Jeśli nie udało się załadować stanu, załaduj pierwsze pytanie
          if (this.questionsData && this.questionsData.questions && this.questionsData.questions.length > 0) {
            this.currentQuestionIndex = 0;
            this.loadAnswersFromQuestionData();
          }
        }
      } else {
        // Jeśli nie ma stanu, załaduj pierwsze pytanie
        if (this.questionsData && this.questionsData.questions && this.questionsData.questions.length > 0) {
          this.currentQuestionIndex = 0;
          this.loadAnswersFromQuestionData();
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
      if (state.team1Loss !== undefined) {
        this.team1Loss = state.team1Loss;
      }
      if (state.team2Loss !== undefined) {
        this.team2Loss = state.team2Loss;
      }
      if (state.team1Name !== undefined) {
        this.team1Name = state.team1Name;
      }
      if (state.team2Name !== undefined) {
        this.team2Name = state.team2Name;
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
        } else {
          // Jeśli nie ma odpowiedzi, ustaw pustą tablicę
          this.answers = [];
        }
      } else {
        // Jeśli nie ma danych pytania, ustaw domyślne wartości
        this.currentQuestion = 'Brak pytania';
        this.answers = [];
      }
    },
    selectAnswer(answerId) {
      // Wyślij akcję do głównego widoku
      if (this.channel) {
        try {
          this.channel.postMessage({
            type: 'action',
            action: `show-answer-${answerId}`
          });
        } catch (error) {
          console.warn('Nie udało się wysłać akcji przez BroadcastChannel:', error);
        }
      }
    },
    handleLoss() {
      if (!this.activeTeam) return;
      
      // Wyślij akcję utraty do głównego widoku
      this.handleAction('loss');
    },
    handleUndoLoss() {
      if (!this.canUndoLoss) return;
      
      // Wyślij akcję cofnięcia utraty do głównego widoku
      this.handleAction('undo-loss');
    },
    handleAction(action) {
      // Wyślij akcję do głównego widoku
      if (this.channel) {
        try {
          this.channel.postMessage({
            type: 'action',
            action: action
          });
        } catch (error) {
          console.warn('Nie udało się wysłać akcji przez BroadcastChannel:', error);
        }
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
  position: relative;
}

.round-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffeb3b;
  font-family: 'PixelFont', monospace;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid rgba(255, 235, 59, 0.3);
  z-index: 10;
  text-shadow: 0 0 10px rgba(255, 235, 59, 0.5);
}

.active-team-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  font-family: 'PixelFont', monospace;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid;
}

.active-team-badge.team-1 {
  color: #4a9eff;
  border-color: rgba(74, 158, 255, 0.5);
  text-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.active-team-badge.team-2 {
  color: #ff4a4a;
  border-color: rgba(255, 74, 74, 0.5);
  text-shadow: 0 0 10px rgba(255, 74, 74, 0.5);
}

.team-color-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid;
}

.team-color-indicator.team-1 {
  background-color: rgba(0, 0, 255, 0.8);
  border-color: rgba(74, 158, 255, 0.8);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.6);
}

.team-color-indicator.team-2 {
  background-color: rgba(255, 0, 0, 0.8);
  border-color: rgba(255, 74, 74, 0.8);
  box-shadow: 0 0 10px rgba(255, 74, 74, 0.6);
}

.team-name {
  text-transform: uppercase;
  letter-spacing: 1px;
}

.host-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  padding-bottom: 80px; /* Miejsce na przyciski na dole */
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

.answers-container {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  min-height: 0;
  align-items: flex-start;
}

.answer-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 0 0 auto;
  min-width: 0;
}

.answer-card {
  width: 100%;
  min-width: 150px;
  max-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  background: rgba(0, 0, 0, 0.4) !important;
  display: flex;
  flex-direction: column;
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

.controls-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 100;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
}

.control-button {
  min-width: 120px;
  height: 48px;
  font-size: 0.9rem;
  font-weight: bold;
  font-family: 'PixelFont', monospace;
  text-transform: uppercase;
  flex: 0 0 auto;
}

.loss-button {
  min-width: 140px;
}

.undo-loss-button {
  min-width: 160px;
}

/* Orientacja pozioma (landscape) - mobile */
@media (orientation: landscape) and (max-height: 600px) {
  .round-badge {
    top: 8px;
    left: 8px;
    font-size: 1rem;
    padding: 6px 12px;
  }
  
  .active-team-badge {
    top: 8px;
    right: 8px;
    font-size: 0.9rem;
    padding: 6px 12px;
    gap: 8px;
  }
  
  .team-color-indicator {
    width: 16px;
    height: 16px;
  }
  
  .team-name {
    font-size: 0.9rem;
  }
  
  .host-container {
    padding: 8px;
    padding-bottom: 70px;
  }
  
  .question-row {
    margin-bottom: 8px;
    flex: 0 0 auto;
  }
  
  .question-display {
    padding: 12px;
    border-radius: 12px;
  }
  
  .question-text {
    font-size: 1.2rem;
    line-height: 1.3;
  }
  
  .answers-container {
    gap: 6px;
    margin-bottom: 8px;
  }
  
  .answer-column {
    gap: 6px;
  }
  
  .answer-card {
    min-width: 120px;
    max-width: 160px;
  }
  
  .answer-content {
    padding: 8px !important;
  }
  
  .answer-number {
    font-size: 1rem;
    margin-bottom: 2px;
  }
  
  .answer-text {
    font-size: 0.75rem;
    margin-bottom: 2px;
    line-height: 1.2;
  }
  
  .answer-points {
    font-size: 0.7rem;
  }
  
  .controls-container {
    padding: 8px;
  }
  
  .control-button {
    min-width: 100px;
    height: 40px;
    font-size: 0.75rem;
    padding: 0 8px;
  }
  
  .loss-button {
    min-width: 110px;
  }
  
  .undo-loss-button {
    min-width: 130px;
  }
}

/* Responsywność dla większych ekranów w orientacji poziomej */
@media (orientation: landscape) and (min-height: 601px) {
  .round-badge {
    top: 12px;
    left: 12px;
    font-size: 1.2rem;
  }
  
  .active-team-badge {
    top: 12px;
    right: 12px;
    font-size: 1.1rem;
  }
  
  .host-container {
    padding: 12px;
    padding-bottom: 80px;
  }
  
  .question-row {
    margin-bottom: 12px;
  }
  
  .question-text {
    font-size: 1.5rem;
  }
  
  .answer-card {
    min-height: auto;
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
  
  .controls-container {
    padding: 12px;
  }
  
  .control-button {
    min-width: 130px;
    height: 45px;
    font-size: 0.85rem;
  }
}

/* Responsywność dla portretu (portrait) */
@media (orientation: portrait) and (max-width: 600px) {
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
</style>

