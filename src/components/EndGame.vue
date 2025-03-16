<template>
  <v-dialog
    v-model="dialogVisible"
    width="800"
    persistent
    content-class="end-game-dialog"
  >
    <v-card class="text-center" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-text class="pa-12">
        <div class="victory-text">{{ gameResultText }}</div>
        <div 
          class="winner-name" 
          :class="{ 'team-blue': isTeam1Winner, 'team-red': !isTeam1Winner && !isDraw, 'team-draw': isDraw }"
        >
          {{ winnerName }}
        </div>
        <div class="points-summary">
          <div :class="{ 'text-blue': true }">{{ team1Name }}: {{ team1Points }}</div>
          <div :class="{ 'text-red': true }">{{ team2Name }}: {{ team2Points }}</div>
        </div>
        <div class="rounds-info">
          Rozegrane rundy: {{ totalRounds }}
        </div>
        <div class="game-info">
          {{ endGameReason }}
        </div>
        <v-btn
          class="mt-6 confirm-btn"
          @click="router.push('/')"
          style="width: 100%;"
        >
         Powrót do menu [enter]
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import confetti from 'canvas-confetti';
import { useRouter } from 'vue-router';

export default {
  name: 'EndGame',
  props: {
    modelValue: Boolean,
    team1Name: String,
    team2Name: String,
    team1Points: Number,
    team2Points: Number,
    totalRounds: {
      type: Number,
      default: 0
    },
    endGameType: {
      type: String,
      validator: (value) => ['questions', 'points', 'rounds'].includes(value)
    }
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    isTeam1Winner() {
      return this.team1Points > this.team2Points;
    },
    isDraw() {
      return this.team1Points === this.team2Points;
    },
    gameResultText() {
      return this.isDraw ? 'Remis!' : 'Zwycięstwo!';
    },
    winnerName() {
      if (this.isDraw) return 'Obie drużyny';
      return this.isTeam1Winner ? this.team1Name : this.team2Name;
    },
    endGameReason() {
      switch(this.endGameType) {
        case 'questions':
          return 'Wszystkie pytania zostały wykorzystane!';
        case 'points':
          return 'Osiągnięto limit punktów!';
        case 'rounds':
          return 'Osiągnięto limit rund!';
        default:
          return '';
      }
    }
  },
  mounted() {
    window.addEventListener('keyup', this.handleKeyUp);
  },
  beforeUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
  },
  methods: {
    handleKeyUp(e) {
      if (e.key === 'Enter' && this.modelValue) {
        this.$emit('update:modelValue', false);
      }
    },
    fireConfetti() {
      const duration = 10000;
      const end = Date.now() + duration;

      const colors = this.isDraw 
        ? ['#FFD700', '#ffffff', '#FFA500']
        : this.isTeam1Winner 
          ? ['#0000ff', '#ffffff', '#4169E1']
          : ['#ff0000', '#ffffff', '#FF4500'];

      (function frame() {
        confetti({
          particleCount: 8,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: colors,
          gravity: 0.8,
          scalar: 1.5,
          zIndex: 100000
        });
        confetti({
          particleCount: 8,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: colors,
          gravity: 0.8,
          scalar: 1.5,
          zIndex: 100000
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.fireConfetti();
        });
      }
    }
  }
}
</script>

<style>
/* Dodajemy style globalne (bez scoped) */
.v-overlay {
  z-index: 1000 !important;
}

canvas {
  z-index: 100000 !important;
}

#confetti-canvas {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  pointer-events: none !important;
  z-index: 100000 !important;
}
</style>

<style scoped>
.victory-text {
  font-size: 5rem;
  color: #FFD700;
  font-family: 'PixelFont';
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  margin-bottom: 1rem;
  animation: victoryPulse 2s infinite;
}

.winner-name {
  font-size: 4rem;
  font-family: 'PixelFont';
  margin: 2rem 0;
}

.team-blue {
  color: #0000ff;
  text-shadow: 0 0 15px rgba(0, 0, 255, 0.8);
}

.team-red {
  color: #ff0000;
  text-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
}

.team-draw {
  color: #FFD700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
}

.points-summary {
  font-size: 2.5rem;
  font-family: 'PixelFont';
  margin: 2rem 0;
  display: flex;
  justify-content: space-around;
}

.text-blue {
  color: #0000ff;
  text-shadow: 0 0 10px rgba(0, 0, 255, 0.6);
}

.text-red {
  color: #ff0000;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
}

.rounds-info {
  font-size: 1.8rem;
  color: #ffffff;
  font-family: 'PixelFont';
  margin: 1rem 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.game-info {
  font-size: 1.5rem;
  color: #ffffff;
  font-family: 'PixelFont';
  margin: 1rem 0;
}

.confirm-btn {
  font-family: 'PixelFont';
  font-size: 1.5rem;
  height: 60px;
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

@keyframes victoryPulse {
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
</style> 