<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent
  >
    <v-card class="text-center" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-text class="text-h2 pa-12" style="color: yellow; font-family: 'PixelFont';">
        <div class="points-display">
          <div class="points">+{{ points }}</div>
          <div class="team-name">{{ teamName }}</div>
          <v-btn
            class="mt-6"
            color="primary"
            @click="closeDialog"
            @keyup.enter="closeDialog"
          >
            {{ buttonText }}
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
    }
  },
  data() {
    return {}
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue || this.totalLoss >= 4;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    buttonText() {
      return this.allAnswersRevealed ? 'Następna runda' : 'Sprawdź odpowiedzi';
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    }
  },
  mounted() {
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' && this.dialog) {
        this.closeDialog();
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('keyup', this.closeDialog);
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
  color: #ffffff;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
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