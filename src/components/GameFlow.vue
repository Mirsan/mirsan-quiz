<template>
  <div>
    <h2 v-if="VictoryMethod === 1">Gratulacje! Wygrałeś!</h2>
    <h2 v-else-if="VictoryMethod === 2">Przegrałeś!</h2>
    <h2 v-else-if="VictoryMethod === 3">Przejęcie wygranej!</h2>
    <!-- VictoryMethod: 1 - correctAll, 2 - failLimit, 3 - takeoverWin -->
    <div v-for="(question, index) in questions" :key="index">
      <button 
        v-for="answer in question.answers" 
        :key="answer"
        @click="handleAnswer(answer, index)"
        :disabled="question.isRevealed"
      >
        {{ answer }}
      </button>
    </div>
    <button 
      v-if="VictoryMethod || allAnswersRevealed" 
      @click="handleRoundComplete"
    >
      {{ getRoundCompleteButtonText }}
    </button>
    <div>Błędy: {{ loss }}/4</div>
  </div>
</template>

<script>
export default {
  name: 'GameFlow',
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      loss: 0,
      VictoryMethod: null, // 1 - correctAll, 2 - failLimit, 3 - takeoverWin
      isCheckingAnswers: false,
    };
  },
  computed: {
    allAnswersRevealed() {
      return this.questions.every(q => q.isRevealed);
    },
    getRoundCompleteButtonText() {
      if (!this.allAnswersRevealed) {
        return 'Sprawdź odpowiedzi [enter]';
      }
      return 'Następna runda [enter]';
    }
  },
  methods: {
    handleAnswer(answer, index) {
      // Jeśli mamy już zwycięzcę, po prostu odkrywamy odpowiedź
      if (this.VictoryMethod) {
        this.questions[index].isRevealed = true;
        return;
      }
      
      if (answer === this.currentQuestion.correctAnswer) {
        this.questions[this.currentQuestionIndex].isRevealed = true;
        if (this.allAnswersRevealed) {
          this.VictoryMethod = 1; // correctAll
        }
      } else {
        this.loss++;
        if (this.loss >= 4) {
          this.VictoryMethod = 2; // failLimit
        }
      }
    },
    handleRoundComplete() {
      // Jeśli nie wszystkie odpowiedzi są odkryte, nie robimy nic
      // Użytkownik musi ręcznie odkryć wszystkie odpowiedzi
      if (!this.allAnswersRevealed) {
        return;
      }
      this.resetGame();
    },
    resetGame() {
      this.currentQuestionIndex = 0;
      this.loss = 0;
      this.VictoryMethod = null;
      this.isCheckingAnswers = false;
      this.questions.forEach(q => q.isRevealed = false);
    }
  }
};
</script>

<style>
  /* No changes to style section */
</style> 