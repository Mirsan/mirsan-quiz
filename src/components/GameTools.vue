<template>
  <div class="game-tools d-flex justify-center align-center" style="gap: 48px">
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
export default {
  name: 'GameTools',
  data() {
    return {
      showResetDialog: false,
      tools: [
        {
          icon: 'mdi-bell-ring',
          color: 'blue',
          tooltip: 'Buzz - zgłaszanie drużyny [*]',
          action: 'buzz',
          shortcut: '*'
        },
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
        '*': 'buzz',
        '/': 'swap',
        '-': 'timer',
        '+': 'points',
        'Backspace': 'restart',
        'NumpadMultiply': 'buzz',    // Numpad *
        'NumpadDivide': 'swap',      // Numpad /
        'NumpadSubtract': 'timer',   // Numpad -
        'NumpadAdd': 'points'        // Numpad +
      };

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
</style> 