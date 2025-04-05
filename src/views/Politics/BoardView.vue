<template>
  <div class="board-container">
    <div class="background-image"></div>
    <div class="content-wrapper" :style="{ opacity: contentOpacity }">
      <VotingTopic :session-id="sessionId" />
      <VotingResult
        v-if="gameStage !== 'Podsumowanie'"
        :voting-number="1"
        :votes-for="votesFor"
        :votes-against="votesAgainst"
        :votes-abstain="votesAbstain"
      />
      <IndividualResult
        v-else-if="gameStage === 'Podsumowanie'"
        :votes="votes"
      />
      <StatusPanel @stage-changed="handleStageChange" :session-id="sessionId" />
    </div>
  </div>
</template>

<script>
import VotingTopic from '@/components/Politics/VotingTopic.vue'
import VotingResult from '@/components/Politics/VotingResult.vue'
import IndividualResult from '@/components/Politics/IndividualResult.vue'
import StatusPanel from '@/components/Politics/StatusPanel.vue'
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { ref as dbRef, onValue, set } from 'firebase/database'

export default {
  name: 'BoardView',
  components: {
    VotingTopic,
    VotingResult,
    IndividualResult,
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

    const votesFor = computed(() => {
      return Object.values(votes.value).filter(vote => vote.option === 'Za').length
    })
    
    const votesAgainst = computed(() => {
      return Object.values(votes.value).filter(vote => vote.option === 'Przeciw').length
    })
    
    const votesAbstain = computed(() => {
      return Object.values(votes.value).filter(vote => vote.option === 'Wstrzymuję się').length
    })

    const handleStageChange = (newStage) => {
      console.log('Zmieniono etap na:', newStage)
      gameStage.value = newStage
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
      votes,
      votesFor,
      votesAgainst,
      votesAbstain,
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