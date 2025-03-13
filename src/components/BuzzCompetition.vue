<template>
  <v-dialog
    v-model="dialog"
    width="800"
    height="500"
    @click:outside="isBlocked ? null : dialog = false"
  >
    <v-card class="text-center" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-text class="text-h2 pa-12" style="color: yellow; font-family: 'PixelFont';">
        <v-tooltip location="top" text="Buzz">
          <template v-slot:activator="{ props }">
            <span v-bind="props">BUZZ TIME!</span>
          </template>
        </v-tooltip>
        <v-row class="justify-center">
          <v-col cols="5">
            <v-tooltip location="top" text="[Lewy Shift]">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  :color="activeTeam === 1 ? '#0000ff' : '#ccccff'" 
                  :class="['text-white', 'team-btn', { 'v-btn--active': activeTeam === 1 }]"
                  style="width: 100%; height: 100px;"
                  @click="selectTeam(1)"
                  :disabled="isBlocked && activeTeam !== 1"
                >
                  {{ team1Name }} <br>
                  [Lewy Shift]
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
          <v-col cols="5">
            <v-tooltip location="top" text="[Prawy Shift]">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  :color="activeTeam === 2 ? '#ff0000' : '#ffcccc'" 
                  :class="['text-white', 'team-btn', { 'v-btn--active': activeTeam === 2 }]"
                  style="width: 100%; height: 100px;"
                  @click="selectTeam(2)"
                  :disabled="isBlocked && activeTeam !== 2"
                >
                  {{ team2Name }} <br>
                  [Prawy Shift]
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { useBluetooth } from '@/composables/useBluetooth';

export default {
  name: 'BuzzCompetition',
  setup() {
    const { BUZZER_SIGNALS } = useBluetooth();
    return { BUZZER_SIGNALS };
  },
  data() {
    return {
      activeTeam: null,
      isBlocked: false,
      closeTimer: null
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
    }
  },
  methods: {
    selectTeam(team) {
      if (this.isBlocked) return;
      
      this.activeTeam = team;
      this.isBlocked = true;
      this.$emit('team-selected', team);

      this.closeTimer = setTimeout(() => {
        this.dialog = false;
        this.isBlocked = false;
      }, 3000);
    },
    handleKeyPress(event) {
      if (!this.dialog || this.isBlocked) return;
      
      if (event.key === 'Shift') {
        if (event.location === 1) {
          this.selectTeam(2);
        } else if (event.location === 2) {
          this.selectTeam(1);
        }
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
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
    }
  },
  watch: {
    dialog: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.resetState();
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
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
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
</style> 