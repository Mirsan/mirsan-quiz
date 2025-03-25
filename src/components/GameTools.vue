<template>
  <div class="game-tools">
    <v-row no-gutters>
      <v-col cols="3" class="d-flex align-center">
        <div class="round-label">
          Runda {{ round }}
          <div class="game-progress" v-if="showProgress">
            {{ progressText }}
          </div>
        </div>
      </v-col>
      
      <v-col cols="6" class="d-flex justify-center align-center" style="gap: 48px">
        <v-btn
          v-for="(tool, index) in tools"
          :key="index"
          :color="tool.color"
          icon
          size="x-large"
          variant="tonal"
          class="d-flex align-center justify-center"
          @click="handleToolClick(tool.action)"
        >
          <v-icon :icon="tool.icon" size="32" class="d-flex align-center justify-center"></v-icon>
          <v-tooltip
            activator="parent"
            location="top"
          >
            {{ tool.tooltip }}
          </v-tooltip>
        </v-btn>
      </v-col>

      <v-col cols="3" class="d-flex align-center">
        <div class="status-label">
          {{ statusGame }}
        </div>
      </v-col>
    </v-row>

    <!-- Dialog potwierdzenia resetu -->
    <v-dialog v-model="showResetDialog" max-width="400" @keydown="handleResetDialogKeyPress">
      <v-card class="text-center">
        <v-card-title class="text-h5 font-weight-bold pa-4">
          Resetowanie gry
        </v-card-title>
        <v-card-text class="pa-4">
          Czy na pewno chcesz zresetować grę? Wszystkie postępy zostaną utracone.
        </v-card-text>
        <v-card-actions class="justify-center pa-4 gap-4">
          <v-btn
            min-width="120"
            color="red"
            variant="flat"
            @click="confirmReset"
            class="reset-btn"
          >
            Tak [Enter]
          </v-btn>
          <v-btn
            min-width="120"
            color="grey"
            variant="flat"
            @click="showResetDialog = false"
            class="reset-btn"
          >
            Anuluj [0]
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useAudioManager } from '@/composables/useAudioManager';

export default {
  name: 'GameTools',
  setup() {
    const audioManager = useAudioManager();
    return { audioManager };
  },
  props: {
    round: {
      type: Number,
      required: true
    },
    currentPoints: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    answeredQuestions: {
      type: Number,
      default: 0
    },
    gameConfig: {
      type: Object,
      required: true
    },
    isPreparationPhase: {
      type: Boolean,
      default: false
    },
    activeTeam: {
      type: Number,
      default: null
    },
    isTeamConsulting: {
      type: Boolean,
      default: false
    },
    team1Loss: {
      type: Number,
      default: 0
    },
    team2Loss: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      showResetDialog: false,
      tools: [
        {
          icon: 'mdi-swap-horizontal',
          color: 'green',
          tooltip: 'Zmiana drużyny [/]',
          action: 'swap',
          shortcut: '/'
        },
        {
          icon: 'mdi-timer',
          color: 'orange',
          tooltip: 'Start/Stop timer [-]',
          action: 'timer',
          shortcut: '-'
        },
        {
          icon: 'mdi-numeric',
          color: 'yellow',
          tooltip: 'Zmień punktowanie [+]',
          action: 'points',
          shortcut: '+'
        },
        {
          icon: 'mdi-restart',
          color: 'red',
          tooltip: 'Zacznij od nowa [Backspace]',
          action: 'restart',
          shortcut: 'Backspace'
        }
      ]
    }
  },
  computed: {
    showProgress() {
      return this.gameConfig?.gameEndCondition !== 'all';
    },
    progressText() {
      if (!this.gameConfig) return '';
      if (this.gameConfig.gameEndCondition === 'points') {
        return `${this.currentPoints}/${this.gameConfig.gameEndLimit} pkt`;
      }
      return `${this.answeredQuestions}/${this.gameConfig.gameEndLimit} pytań`;
    },
    roundLabel() {
      let label = `Runda ${this.round}`;
      if (this.isPreparationPhase) {
        label += ' - Wybór Drużyny';
      }
      return label;
    },
    statusGame() {
      if (this.isPreparationPhase) {
        return 'Wybór Drużyny';
      }
      
      // Sprawdzamy czy jest narada (2 straty aktywnej drużyny)
      if ((this.activeTeam === 1 && this.team1Loss === 2) || 
          (this.activeTeam === 2 && this.team2Loss === 2)) {
        return 'NARADA';
      }
      
      // Sprawdzamy czy jest próba przejęcia (3 straty przeciwnika)
      if ((this.activeTeam === 1 && this.team2Loss === 3) || 
          (this.activeTeam === 2 && this.team1Loss === 3)) {
        return 'PRÓBA PRZEJĘCIA';
      }
      
      return '';
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    handleToolClick(action) {
      if (action === 'restart') {
        this.showResetDialog = true;
      } else if (action === 'loss') {
        // Odtwarzamy dźwięk bad.mp3 przy skuciu
        this.audioManager.playBad();
        this.$emit('tool-action', action);
      } else {
        this.$emit('tool-action', action);
      }
    },
    handleResetDialogKeyPress(event) {
      if (event.key === 'Enter') {
        this.confirmReset();
      } else if (event.key === '0' || event.key === 'Numpad0') {
        this.showResetDialog = false;
      }
    },
    confirmReset() {
      // Resetujemy ustawienia
      localStorage.removeItem('familyGameConfig');
      // Emitujemy akcję resetu
      this.$emit('tool-action', 'restart');
      // Zamykamy dialog
      this.showResetDialog = false;
      // Przekierowujemy do StarterPanel
      this.$router.push('/start-family');
    },
    handleKeyPress(event) {
      const keyMap = {
        '/': 'swap',
        '-': 'timer',
        '+': 'points',
        'Backspace': 'restart',
        'NumpadDivide': 'swap',      // Numpad /
        'NumpadSubtract': 'timer',   // Numpad -
        'NumpadAdd': 'points',       // Numpad +
        '0': 'loss',                 // Dodanie straty
        'Numpad0': 'loss'           // Numpad 0
      };

      // Obsługa klawiszy numerycznych
      const numKey = event.key;
      if (/^[1-9]$/.test(numKey) || /^Numpad[1-9]$/.test(event.code)) {
        const num = parseInt(numKey) || parseInt(event.code.slice(-1));
        this.$emit('tool-action', `show-answer-${num}`);
        return;
      }

      const action = keyMap[event.key] || keyMap[event.code];
      if (action) {
        this.handleToolClick(action);
      }
    }
  }
}
</script>

<style scoped>
.game-tools {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 16px;
  border-radius: 16px;
  backdrop-filter: blur(8px);
  width: 100%;
}

.round-label {
  color: white;
  font-size: 24px;
  font-weight: bold;
  font-family: 'PixelFont', monospace;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  padding-left: 24px;
}

.tool-container {
  text-align: center;
}

:deep(.v-btn) {
  transition: transform 0.2s;
  width: 64px !important;
  height: 64px !important;
}

:deep(.v-btn:hover) {
  transform: scale(1.1);
}

:deep(.v-btn__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.shortcut-label {
  color: white;
  font-size: 12px;
  font-weight: bold;
  opacity: 0.8;
}

.game-progress {
  font-size: 16px;
  color: #ffeb3b;
  margin-top: 4px;
}

.status-label {
  color: #ffeb3b;
  font-size: 24px;
  font-weight: bold;
  font-family: 'PixelFont', monospace;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  width: 100%;
  text-align: center;
}
</style> 