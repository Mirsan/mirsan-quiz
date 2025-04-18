<template>
  <v-container fluid class="pa-0">
    <div class="voting-panel-container">
      <v-card class="voting-card" elevation="4">
        <!-- Górny pasek -->
        <v-card-title class="header-bar d-flex justify-space-between align-center pa-2">
          <div class="d-flex align-center">
            <v-icon icon="mdi-card-account-details" class="mr-2"/>
            <span class="deputy-name">{{ deputyName }}</span>
          </div>
          <div>
            <v-btn
              icon
              variant="text"
              @click="toggleContrast"
            >
              <v-icon>mdi-contrast-circle</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <!-- Środkowy panel z wynikiem -->
        <v-card-text class="vote-container pa-2">
          <div class="vote-result-display">
            <div class="vote-number" :class="{ 'vote-number-white': currentVote }">
              Głosowanie nr {{ voteId }}
            </div>
            <div class="vote-result" :class="voteResultClass">
              <span v-if="currentVote" class="text-h1 vote-text">
                Głos: {{ currentVote }}
              </span>
            </div>
          </div>
        </v-card-text>

        <!-- Panel przycisków -->
        <v-card-actions class="button-panel pa-2">
          <div class="button-container">
            <v-btn
              class="vote-btn vote-for"
              size="x-large"
              @click="vote('ZA')"
              :disabled="!!currentVote || disabled"
            >
              Za
            </v-btn>
            <v-btn
              class="vote-btn vote-against"
              size="x-large"
              @click="vote('PRZECIW')"
              :disabled="!!currentVote || disabled"
            >
              Przeciw
            </v-btn>
            <v-btn
              class="vote-btn vote-abstain"
              size="x-large"
              @click="vote('WSTRZYMANO SIĘ')"
              :disabled="!!currentVote || disabled"
            >
              <span class="d-none d-sm-flex">Wstrzymaj się</span>
              <span class="d-flex d-sm-none">Wstrzymaj</span>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import { ref as dbRef, onValue } from '@firebase/database'
import { db } from '@/firebase'

export default {
  name: 'VotingPanel',
  props: {
    deputyName: {
      type: String,
      required: true
    },
    voteId: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    sessionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentVote: '',
      highContrast: false
    }
  },
  computed: {
    voteResultClass() {
      return {
        'vote-result-for': this.currentVote === 'ZA',
        'vote-result-against': this.currentVote === 'PRZECIW',
        'vote-result-abstain': this.currentVote === 'WSTRZYMANO SIĘ'
      }
    }
  },
  methods: {
    vote(choice) {
      this.currentVote = choice
      this.$emit('vote-cast', choice)
    },
    toggleContrast() {
      this.highContrast = !this.highContrast
    },
    resetVote() {
      console.log('Resetowanie głosu...')
      this.currentVote = ''
      // Emitujemy event o resecie głosu
      this.$emit('vote-reset')
    }
  },
  mounted() {
    console.log('VotingPanel mounted, sessionId:', this.sessionId)
    if (!this.sessionId) {
      console.error('Brak sessionId!')
      return
    }

    // Nasłuchuj na zmiany etapu
    const stageRef = dbRef(db, `sessions/${this.sessionId}/status`)
    onValue(stageRef, (snapshot) => {
      const newStage = snapshot.val()
      console.log('Zmiana etapu na:', newStage)
      if (newStage === 'Pierwsze czytanie') {
        this.resetVote()
      }
    }, (error) => {
      console.error('Błąd nasłuchiwania etapu:', error)
    })

    // Nasłuchuj na zmiany głosu
    const voteRef = dbRef(db, `sessions/${this.sessionId}/votes/${this.deputyName}`)
    onValue(voteRef, (snapshot) => {
      const voteData = snapshot.val()
      console.log('Zmiana głosu:', voteData)
      if (!voteData) {
        this.resetVote()
      } else {
        this.currentVote = voteData.option
      }
    }, (error) => {
      console.error('Błąd nasłuchiwania głosu:', error)
    })
  }
}
</script>

<style scoped>
.voting-panel-container {
  height: 90vh; /* Domyślnie dla trybu pionowego */
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-x: hidden;
}

/* Dla orientacji poziomej */
@media screen and (orientation: landscape) {
  .voting-panel-container {
    height: 80vh;
  }
}

.voting-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.deputy-name {
  font-size: 1.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vote-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vote-result-display {
  width: 100%;
  height: 100%;
  position: relative;
  background: white;
  border: 0px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.vote-number {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 1;
  transition: color 0.3s ease;
}

.vote-number-white {
  color: white;
}

.vote-result {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.vote-result-for {
  background: #4CAF50;
  color: white;
}

.vote-result-against {
  background: #F44336;
  color: white;
}

.vote-result-abstain {
  background: #FFC107;
  color: black;
}

.button-panel {
  padding: 10px !important;
}

.button-container {
  display: flex;
  gap: 24px;
  width: 100%;
  padding: 0 16px;
}

.vote-btn {
  flex: 1;
  height: 110px !important;
  font-size: 1.4rem !important;
  font-weight: 700 !important;
  text-transform: none !important;
  letter-spacing: 1px !important;
  padding: 25px 0 !important;
  white-space: nowrap !important;
  border-radius: 10px !important;
  border: 2px solid rgba(0, 0, 0, 0.2) !important;
}

.vote-for {
  background-color: #4CAF50 !important;
  color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.2) !important;
}

.vote-against {
  background-color: #F44336 !important;
  color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.2) !important;
}

.vote-abstain {
  background-color: #FFC107 !important;
  color: black !important;
  border: 1px solid rgba(0, 0, 0, 0.2) !important;
}

.vote-text {
  font-size: 3rem !important;
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
}

/* Responsywność dla poziomego telefonu */
@media screen and (max-width: 900px) and (orientation: landscape) {
  .voting-panel-container {
    padding: 10px;
  }

  .deputy-name {
    font-size: 1.2rem;
  }

  .button-panel {
    padding: 5px !important;
  }

  .button-container {
    gap: 2.5em;
    padding: 0 8px;
  }

  .vote-btn {
    height: 90px !important;
    font-size: 1.2rem !important;
    padding: 15px 0 !important;
  }

  .vote-number {
    font-size: 1rem;
  }

  .header-bar {
    margin-top: -0.8em;
    margin-left: 0.2em;
    margin-bottom: -1.2em;
  }
}
</style> 