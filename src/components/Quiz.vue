<template>
  <div>
    <h2 v-if="VictoryMethod === 1">Gratulacje! Wygrałeś!</h2>
    <h2 v-else-if="VictoryMethod === 2">Przegrałeś!</h2>
    <!-- VictoryMethod: 1 - correctAll, 2 - failLimit, 3 - takeoverWin -->
    <div v-for="(question, index) in questions" :key="index">
      <button 
        v-for="answer in question.answers" 
        :key="answer"
        @click="handleAnswer(answer, index)"
        :disabled="question.isRevealed || (VictoryMethod === 2 && !isCheckingAnswers)"
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
      if (this.VictoryMethod === 2 && !this.isCheckingAnswers) {
        return 'Sprawdź odpowiedzi [enter]';
      }
      return 'Następna runda [enter]';
    }
  },
  methods: {
    handleAnswer(answer, index) {
      if (this.isCheckingAnswers) {
        this.questions[index].isRevealed = true;
        if (this.allAnswersRevealed) {
          this.VictoryMethod = 1; // correctAll
        }
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
      if (this.VictoryMethod === 2 && !this.isCheckingAnswers) {
        this.isCheckingAnswers = true;
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