<template>
  <v-dialog
    v-if="modelValue"
    :model-value="true"
    width="600"
    persistent
  >
    <v-card class="text-center" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-text class="text-h2 pa-12" style="color: yellow; font-family: 'PixelFont';">
        <div class="points-display">
          <template v-if="activeTeam != null">
            <div class="points">+{{ points }}</div>
            <div class="team-name" :class="{ 'team-blue': activeTeam === 1, 'team-red': activeTeam === 2 }">{{ teamName }}</div>
          </template>
          <v-btn
            class="mt-6 confirm-btn"
            @click="closeDialog"
            style="width: 100%;"
          >
            {{ isLastRound ? 'Przejdź do podsumowania [enter]' : 'Następna runda [enter]' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RoundComplete',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    activeTeam: {
      type: Number,
      default: null
    },
    points: {
      type: Number,
      required: true
    },
    teamName: {
      type: String,
      required: true
    },
    allAnswersRevealed: {
      type: Boolean,
      required: true
    },
    totalLoss: {
      type: Number,
      required: true,
      default: 0
    },
    victoryMethod: {
      type: Number,
      default: null
    },
    isCheckingAnswers: {
      type: Boolean,
      default: false
    },
    isTeam1: {
      type: Boolean,
      default: true
    },
    isLastRound: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isVisible: false
    }
  },
  computed: {
    buttonText() {
      if (this.allAnswersRevealed) {
        return 'Następna runda [enter]';
      }
      return 'Sprawdź odpowiedzi [enter]';
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:modelValue', false);
      this.$emit('dialogClosed', this.allAnswersRevealed);
    },
    closeDialog() {
      this.handleClose();
    }
  },
  mounted() {
    this.handleKeyUp = (e) => {
      if (e.key === 'Enter' && this.modelValue) {
        e.preventDefault();
        this.closeDialog();
      }
    };
    window.addEventListener('keyup', this.handleKeyUp);
    
    if (this.modelValue) {
      this.$emit('dialogOpened');
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.$emit('dialogOpened');
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
</script>

<style scoped>
.points-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.points {
  font-size: 5rem;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  animation: pointsPulse 1.5s infinite;
}

.team-name {
  font-size: 3rem;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
}

.team-blue {
  color: #0000ff;
  text-shadow: 0 0 15px rgba(0, 0, 255, 0.8);
}

.team-red {
  color: #ff0000;
  text-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
}

.confirm-btn {
  font-family: 'PixelFont';
  font-size: 1.5rem;
  height: 60px;
  width: 80%;
  background: rgba(255, 255, 0, 0.7);
  color: #000;
  border: 2px solid rgba(255, 255, 0, 0.9);
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.5);
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  background: rgba(255, 255, 0, 0.9);
  box-shadow: 0 0 20px rgba(255, 255, 0, 0.8);
  transform: scale(1.05);
}

@keyframes pointsPulse {
  0% {
    transform: scale(1);
    text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  }
  50% {
    transform: scale(1.5);
    text-shadow: 0 0 30px rgba(0, 255, 0, 1);
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  }
}
</style> 