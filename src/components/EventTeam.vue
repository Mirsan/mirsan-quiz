<template>
  <div class="event-team">
    <transition name="alert-fade">
      <div v-if="showNarada" class="alert-label narada">
        NARADA
      </div>
    </transition>
    <transition name="alert-fade">
      <div v-if="showPrzejecie" class="alert-label przejecie">
        PRÓBA PRZEJĘCIA
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'EventTeam',
  props: {
    teamNumber: {
      type: Number,
      required: true,
      validator: (value) => [1, 2].includes(value)
    },
    team1Loss: {
      type: Number,
      default: 0
    },
    team2Loss: {
      type: Number,
      default: 0
    },
    victoryMethod: {
      type: Number,
      default: null
    }
  },
  computed: {
    showNarada() {
      // Pokazuje "NARADA" gdy przeciwna drużyna ma 2 starty (loss)
      if (this.teamNumber === 1) {
        return this.team2Loss === 2 && this.victoryMethod === null;
      } else {
        return this.team1Loss === 2 && this.victoryMethod === null;
      }
    },
    showPrzejecie() {
      // Pokazuje "PRÓBA PRZEJĘCIA" gdy przeciwna drużyna ma 3 starty (loss)
      if (this.teamNumber === 1) {
        return this.team2Loss === 3 && this.victoryMethod === null;
      } else {
        return this.team1Loss === 3 && this.victoryMethod === null;
      }
    }
  }
}
</script>

<style scoped>
.event-team {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.alert-label {
  padding: 5px 12px;
  border-radius: 6px;
  font-weight: bold;
  white-space: nowrap;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.narada {
  background-color: rgba(255, 165, 0, 0.9);
  color: black;
  animation: pulse 1.5s infinite;
}

.przejecie {
  background-color: rgba(255, 0, 0, 0.9);
  color: white;
  animation: blink 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes blink {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.alert-fade-enter-active, .alert-fade-leave-active {
  transition: all 0.3s ease;
}

.alert-fade-enter-from, .alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 