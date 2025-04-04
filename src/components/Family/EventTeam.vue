<template>
  <div class="event-team">
    <transition name="alert-fade">
      <div v-if="showAlert" class="alert-label" :class="{ 'przejecie': showPrzejecie, 'narada': !showPrzejecie }">
        {{ alertText }}
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
    },
    showAlert() {
      return this.showNarada || this.showPrzejecie;
    },
    alertText() {
      return this.showPrzejecie ? 'PRÓBA PRZEJĘCIA' : 'NARADA';
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
  background-color: rgba(255, 0, 0, 0.9);
  color: white;
}

.narada {
  animation: shake 1.5s infinite;
}

.przejecie {
  animation: shake 0.8s infinite;
}

@keyframes shake {
  0% { transform: translateX(0); }
  10% { transform: translateX(-3px) rotate(-1deg); }
  20% { transform: translateX(3px) rotate(1deg); }
  30% { transform: translateX(-3px) rotate(-1deg); }
  40% { transform: translateX(3px) rotate(1deg); }
  50% { transform: translateX(-3px) rotate(-1deg); }
  60% { transform: translateX(3px) rotate(1deg); }
  70% { transform: translateX(-3px) rotate(-1deg); }
  80% { transform: translateX(3px) rotate(1deg); }
  90% { transform: translateX(-3px) rotate(-1deg); }
  100% { transform: translateX(0); }
}

.alert-fade-enter-active, .alert-fade-leave-active {
  transition: all 0.3s ease;
}

.alert-fade-enter-from, .alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 