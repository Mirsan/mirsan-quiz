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
  </div>
</template>

<script>
export default {
  name: 'GameTools',
  data() {
    return {
      tools: [
        {
          icon: 'mdi-refresh',
          color: 'green',
          tooltip: 'Resetuj grę',
          action: 'reset'
        },
        {
          icon: 'mdi-volume-high',
          color: 'blue',
          tooltip: 'Dźwięk poprawnej odpowiedzi',
          action: 'correct'
        },
        {
          icon: 'mdi-close-circle',
          color: 'red',
          tooltip: 'Dźwięk złej odpowiedzi',
          action: 'wrong'
        },
        {
          icon: 'mdi-timer',
          color: 'orange',
          tooltip: 'Start/Stop czasu',
          action: 'timer'
        },
        {
          icon: 'mdi-cog',
          color: 'grey',
          tooltip: 'Ustawienia',
          action: 'settings'
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
      this.$emit('tool-action', action);
    },
    handleKeyPress(event) {
      const tool = this.tools.find(t => t.shortcut === event.key.toLowerCase());
      if (tool) {
        this.handleToolClick(tool.action);
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