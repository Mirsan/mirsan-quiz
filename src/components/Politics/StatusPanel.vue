<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="10" md="8">
        <v-card class="status-panel pa-4" elevation="4" width="800">
          <div class="d-flex align-center justify-space-between">
            <v-btn
              variant="text"
              class="custom-btn"
              @click="previousStage"
              :disabled="currentStageIndex === 0"
            >
              <span class="text-h4">-</span>
              <v-tooltip activator="parent" location="top">
                <span>Poprzedni etap (-)</span>
              </v-tooltip>
            </v-btn>
            
            <div class="status-content text-h4">
              Etap: <span class="stage-name">{{ currentStage }}</span>
              <div class="stage-shortcut text-caption">
                ({{ currentStageIndex + 1 }})
              </div>
            </div>
            
            <v-btn
              variant="text"
              class="custom-btn"
              @click="nextStage"
              :disabled="currentStageIndex !== stages.length - 1"
              v-if="currentStageIndex === stages.length - 1"
            >
              <span class="text-h6">Dalej</span>
              <v-tooltip activator="parent" location="top">
                <span>Przejdź dalej (Enter)</span>
              </v-tooltip>
            </v-btn>
            <v-btn
              v-else
              variant="text"
              class="custom-btn"
              @click="nextStage"
              :disabled="currentStageIndex === stages.length - 1"
            >
              <span class="text-h4">+</span>
              <v-tooltip activator="parent" location="top">
                <span>Następny etap (+)</span>
              </v-tooltip>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref as dbRef, set, onValue } from '@firebase/database'
import { db } from '@/firebase'

export default {
  name: 'StatusPanel',
  components: {
  },
  props: {
    sessionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      stages: [
        'Pierwsze czytanie',
        'Drugie czytanie',
        'Głosowanie',
        'Wyniki',
        'Podsumowanie'
      ],
      currentStageIndex: 0,
      currentTopicNumber: 1,
      totalTopics: 0
    }
  },
  computed: {
    currentStage() {
      return this.stages[this.currentStageIndex]
    }
  },
  methods: {
    nextStage() {
      if (this.currentStageIndex < this.stages.length - 1) {
        this.currentStageIndex++
        this.$emit('stage-changed', this.currentStage)
      } else if (this.currentStageIndex === this.stages.length - 1) {
        this.goToNextTopic()
      }
    },
    async goToNextTopic() {
      if (this.currentTopicNumber >= this.totalTopics) {
        // Koniec gry lub powrót do pierwszego tematu
        return
      }

      this.currentTopicNumber++
      this.currentStageIndex = 0
      
      // Aktualizacja w Firebase
      const topicRef = dbRef(db, `sessions/${this.sessionId}/currentTopic`)
      await set(topicRef, {
        id: this.currentTopicNumber - 1,
        number: this.currentTopicNumber
      })
      
      // Resetowanie głosów
      const votesRef = dbRef(db, `sessions/${this.sessionId}/votes`)
      await set(votesRef, null)
      
      this.$emit('stage-changed', this.currentStage)
    },
    previousStage() {
      if (this.currentStageIndex > 0) {
        this.currentStageIndex--
        this.$emit('stage-changed', this.currentStage)
      }
    },
    goToStage(index) {
      if (index >= 0 && index < this.stages.length) {
        this.currentStageIndex = index
        this.$emit('stage-changed', this.currentStage)
      }
    },
    handleKeydown(event) {
      switch(event.key) {
        case '+':
        case 'ArrowRight':
          if (this.currentStageIndex !== this.stages.length - 1) {
            this.nextStage()
          }
          break
        case '-':
        case 'ArrowLeft':
          this.previousStage()
          break
        case 'Enter':
          if (this.currentStageIndex === this.stages.length - 1) {
            this.goToNextTopic()
          }
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          this.goToStage(parseInt(event.key) - 1)
          break
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
    // Pobierz liczbę tematów
    const topicsRef = dbRef(db, 'topics')
    onValue(topicsRef, (snapshot) => {
      if (snapshot.exists()) {
        this.totalTopics = snapshot.val().length
      }
    })
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>

<style scoped>
.status-panel {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 2px solid #1976d2;
  margin: 0 auto;
}

.status-content {
  font-weight: 500;
  color: #333;
  text-align: center;
  position: relative;
}

.stage-name {
  color: #1976d2;
  font-weight: 700;
}

.stage-shortcut {
  position: absolute;
  top: -10px;
  right: -20px;
  color: #666;
}

.custom-btn {
  min-width: 48px !important;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: transparent !important;
  color: #1976d2 !important;
}

.custom-btn:hover {
  background: rgba(25, 118, 210, 0.1) !important;
}

.custom-btn:disabled {
  color: rgba(0, 0, 0, 0.26) !important;
  background: transparent !important;
}

/* Usuwamy domyślne style Vuetify dla przycisków */
.custom-btn::before,
.custom-btn::after {
  display: none !important;
}

/* Dodajemy responsywność */
@media (max-width: 600px) {
  .status-content {
    font-size: 1.2rem !important;
  }
  
  .stage-shortcut {
    top: -5px;
    right: -10px;
  }
}
</style> 