<template>
  <v-dialog
    v-model="dialog"
    width="800"
    height="500"
    persistent
  >
    <v-card class="text-center" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-text class="text-h4 pa-12" style="color: yellow; font-family: 'PixelFont';">
        <v-tooltip location="top" text="Buzz">
          <template v-slot:activator="{ props }">
            <span v-if="!questionShown" v-bind="props">
              Pytanie z <span class="bold-number">{{ answersCount }}</span> odpowiedziami
            </span>
            <span v-else v-bind="props">
              {{ question }}
            </span>
            <br><br>
          </template>
        </v-tooltip>
        <v-row class="justify-center">
          <v-col cols="5">
            <v-tooltip location="top" text="[Lewy Shift]">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  :color="activeTeam === 1 ? '#0000ff' : '#66b3ff'" 
                  :class="['text-white', 'team-btn', { 'v-btn--active': activeTeam === 1 }]"
                  style="width: 100%; height: 100px;"
                  @click="selectTeam(1)"
                  :disabled="isBlocked && activeTeam !== 1"
                >
                  {{ team1Name }} <br>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
          <v-col cols="5">
            <v-tooltip location="top" text="[Prawy Shift]">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  :color="activeTeam === 2 ? '#ff0000' : '#ff9999'" 
                  :class="['text-white', 'team-btn', { 'v-btn--active': activeTeam === 2 }]"
                  style="width: 100%; height: 100px;"
                  @click="selectTeam(2)"
                  :disabled="isBlocked && activeTeam !== 2"
                >
                  {{ team2Name }} <br>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>

        <v-row class="justify-center mb-6">
          <v-col cols="6">
            <v-btn 
              class="confirm-btn"
              @click="handleConfirm"
              @keyup.enter="handleConfirm"
              :disabled="questionShown && !activeTeam"
            >
              {{ questionShown ? 'Dalej [Enter]' : 'Pokaż pytanie [Enter]' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { useBluetooth } from '@/composables/useBluetooth';
import { useAudioManager } from '@/composables/useAudioManager';

export default {
  name: 'BuzzCompetition',
  setup() {
    const { BUZZER_SIGNALS } = useBluetooth();
    const audioManager = useAudioManager();
    return { BUZZER_SIGNALS, audioManager };
  },
  data() {
    return {
      activeTeam: null,
      isBlocked: false,
      questionShown: false
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    team1Name: {
      type: String,
      required: true
    },
    team2Name: {
      type: String,
      required: true
    },
    bluetoothCharacteristic: {
      type: Object,
      default: null
    },
    question: {
      type: String,
      required: true
    },
    answersCount: {
      type: Number,
      required: true
    }
  },
  methods: {
    selectTeam(team) {
      if (this.isBlocked) return;
      
      this.activeTeam = team;
      this.isBlocked = true;
      this.audioManager.stopAll();
      this.audioManager.playBuzz();
      this.$emit('team-selected', team);
    },
    closeDialog() {
      this.$emit('dialog-closed');
      this.dialog = false;
      this.isBlocked = false;
    },
    handleConfirm() {
      if (!this.questionShown) {
        this.questionShown = true;
      } else if (this.activeTeam) {
        this.$emit('show-question');
        this.closeDialog();
      }
    },
    handleKeyPress(event) {
      if (!this.dialog) return;
      
      if (event.key === 'Shift' && !this.isBlocked) {
        if (event.location === 1) {
          this.selectTeam(1);
        } else if (event.location === 2) {
          this.selectTeam(2);
        }
      } else if (event.key === 'Enter') {
        this.handleConfirm();
      }
    },
    handleBuzzerSignal(event) {
      if (!this.dialog || this.isBlocked) return;
      
      const value = event.target.value.getUint8(0);
      if (value in this.BUZZER_SIGNALS) {
        this.selectTeam(this.BUZZER_SIGNALS[value]);
      }
    },
    resetState() {
      this.activeTeam = null;
      this.isBlocked = false;
    },
    fullReset() {
      this.resetState();
      this.questionShown = false;
    }
  },
  watch: {
    dialog: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fullReset();
          this.audioManager.playRound();
          if (this.bluetoothCharacteristic) {
            this.bluetoothCharacteristic.addEventListener('characteristicvaluechanged', this.handleBuzzerSignal);
          }
        } else {
          if (this.bluetoothCharacteristic) {
            this.bluetoothCharacteristic.removeEventListener('characteristicvaluechanged', this.handleBuzzerSignal);
          }
          this.resetState();
        }
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
    if (this.bluetoothCharacteristic) {
      this.bluetoothCharacteristic.removeEventListener('characteristicvaluechanged', this.handleBuzzerSignal);
    }
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    displayText() {
      return this.questionShown ? this.question : `Pytanie z <span class="bold-number">${this.answersCount}</span> odpowiedziami`;
    }
  }
}
</script>

<style scoped>
.team-btn {
  transition: all 0.3s ease;
  font-family: 'PixelFont';
  font-size: 2rem;
  position: relative;
}

.team-btn.v-btn--active {
  animation: pulse 1.5s infinite;
  box-shadow: 0 0 30px currentColor;
}

.team-btn.v-btn--active::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 3px solid currentColor;
  border-radius: 12px;
  animation: borderPulse 1.5s infinite;
  pointer-events: none;
}

.continue-btn {
  font-family: 'PixelFont';
  font-size: 1.5rem;
  height: 60px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    text-shadow: 0 0 20px rgba(255,255,255,0.8);
  }
  50% {
    transform: scale(1.15);
    text-shadow: 0 0 30px rgba(255,255,255,1);
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 20px rgba(255,255,255,0.8);
  }
}

@keyframes borderPulse {
  0% {
    box-shadow: 0 0 20px rgba(255,255,255,0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255,255,255,0.8);
  }
  100% {
    box-shadow: 0 0 20px rgba(255,255,255,0.5);
  }
}

.team-btn:disabled {
  opacity: 0.1;
}

.confirm-btn {
  font-family: 'PixelFont';
  font-size: 1.5rem;
  height: 60px;
  width: 100%;
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

.bold-number {
  display: inline-block;
  text-shadow: 0 0 3px yellow, 
               0 0 3px yellow, 
               0 0 3px yellow, 
               0 0 3px yellow;
  letter-spacing: 1px;
  font-size: 1.2em;
  position: relative;
  top: 2px;
}
</style> 