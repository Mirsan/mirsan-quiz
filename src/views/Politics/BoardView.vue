<template>
  <div class="board-container">
    <div class="background-image"></div>
    <div class="content-wrapper" :style="{ opacity: contentOpacity }">
      <VotingTopic />
      <VotingResult
        :voting-number="1"
        :votes-for="0"
        :votes-against="0"
        :votes-abstain="0"
      />
      <StatusPanel @stage-changed="handleStageChange" />
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                Panel Prowadzącego
              </v-card-title>
              <v-card-text>
                <div v-if="currentQuestion">
                  <h2>{{ currentQuestion.text }}</h2>
                  <div v-if="gameStage === 'voting'">
                    <v-btn color="primary" @click="showResults">
                      Pokaż wyniki
                    </v-btn>
                  </div>
                  <div v-else-if="gameStage === 'results'">
                    <h3>Wyniki głosowania:</h3>
                    <div v-for="(count, option) in voteResults" :key="option">
                      {{ option }}: {{ count }} głosów
                    </div>
                    <v-btn color="primary" @click="nextQuestion" class="mt-4">
                      Następne pytanie
                    </v-btn>
                  </div>
                  <div v-else>
                    <v-btn color="primary" @click="startVoting">
                      Rozpocznij głosowanie
                    </v-btn>
                  </div>
                </div>
                <div v-else>
                  <h3>Brak aktywnego pytania</h3>
                  <v-btn color="primary" @click="loadNextQuestion">
                    Wczytaj następne pytanie
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import VotingTopic from '@/components/Politics/VotingTopic.vue'
import VotingResult from '@/components/Politics/VotingResult.vue'
import StatusPanel from '@/components/Politics/StatusPanel.vue'
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { ref as dbRef, onValue, set } from 'firebase/database'

export default {
  name: 'BoardView',
  components: {
    VotingTopic,
    VotingResult,
    StatusPanel
  },
  props: {
    sessionId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const contentOpacity = ref(0.9)
    const currentQuestion = ref(null)
    const gameStage = ref('waiting')
    const votes = ref({})

    const voteResults = computed(() => {
      const results = {}
      Object.values(votes.value).forEach(vote => {
        results[vote.option] = (results[vote.option] || 0) + 1
      })
      return results
    })

    const handleStageChange = (newStage) => {
      console.log('Zmieniono etap na:', newStage)
    }

    const startVoting = async () => {
      await set(dbRef(db, `sessions/${props.sessionId}/status`), 'voting')
    }

    const showResults = async () => {
      await set(dbRef(db, `sessions/${props.sessionId}/status`), 'results')
    }

    const nextQuestion = async () => {
      await set(dbRef(db, `sessions/${props.sessionId}/status`), 'waiting')
      await set(dbRef(db, `sessions/${props.sessionId}/votes`), {})
      loadNextQuestion()
    }

    const loadNextQuestion = async () => {
      // TODO: Zaimplementuj logikę ładowania następnego pytania
      const question = {
        text: 'Przykładowe pytanie?',
        options: ['Za', 'Przeciw', 'Wstrzymuję się']
      }
      await set(dbRef(db, `sessions/${props.sessionId}/currentQuestion`), question)
    }

    onMounted(() => {
      const questionRef = dbRef(db, `sessions/${props.sessionId}/currentQuestion`)
      const stageRef = dbRef(db, `sessions/${props.sessionId}/status`)
      const votesRef = dbRef(db, `sessions/${props.sessionId}/votes`)

      onValue(questionRef, (snapshot) => {
        currentQuestion.value = snapshot.val()
      })

      onValue(stageRef, (snapshot) => {
        gameStage.value = snapshot.val()
      })

      onValue(votesRef, (snapshot) => {
        votes.value = snapshot.val() || {}
      })
    })

    return {
      contentOpacity,
      currentQuestion,
      gameStage,
      voteResults,
      handleStageChange,
      startVoting,
      showResults,
      nextQuestion,
      loadNextQuestion
    }
  }
}
</script>

<style scoped>
.board-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/sejm.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 20px;
  backdrop-filter: blur(3px);
}

/* Dodajemy przezroczystość do kart w komponentach */
:deep(.v-card) {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
}

:deep(.status-panel) {
  background-color: rgba(255, 255, 255, 0.95) !important;
}
</style> 