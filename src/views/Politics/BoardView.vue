<template>
  <div class="board-container">
    <div class="background-image"></div>
    <div class="content-wrapper" :style="{ opacity: contentOpacity }">
      <VotingTopic :session-id="sessionId" />
      <VotingResult
        v-if="gameStage !== 'Podsumowanie'"
        :voting-number="currentTopicNumber"
        :votes-for="votesFor"
        :votes-against="votesAgainst"
        :votes-abstain="votesAbstain"
        :show-collective="gameStage === 'Wyniki'"
        :collective-votes="collectiveVotes"
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
import { ref as dbRef, onValue, set, get } from 'firebase/database'

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
    const currentTopicNumber = ref(1)

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

    const collectiveVotes = computed(() => {
      if (gameStage.value !== 'Wyniki') return null;
      
      const results = {
        ZA: 0,
        PRZECIW: 0,
        'WSTRZYMANO SIĘ': 0
      };
      
      Object.values(votes.value).forEach(vote => {
        if (vote.option in results) {
          results[vote.option]++;
        }
      });
      
      return results;
    });

    const handleStageChange = (newStage) => {
      console.log('Zmieniono etap na:', newStage)
      gameStage.value = newStage
      set(dbRef(db, `sessions/${props.sessionId}/status`), newStage)
    }

    const startVoting = async () => {
      await set(dbRef(db, `sessions/${props.sessionId}/status`), 'Głosowanie')
    }

    const showResults = async () => {
      await set(dbRef(db, `sessions/${props.sessionId}/status`), 'Wyniki')
    }

    const nextQuestion = async () => {
      await set(dbRef(db, `sessions/${props.sessionId}/status`), 'Pierwsze czytanie')
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
      const topicRef = dbRef(db, `sessions/${props.sessionId}/currentTopic`)

      onValue(topicRef, (snapshot) => {
        const topicData = snapshot.val()
        if (topicData) {
          currentTopicNumber.value = topicData.number || 1
        }
      })

      onValue(questionRef, (snapshot) => {
        currentQuestion.value = snapshot.val()
      })

      onValue(stageRef, (snapshot) => {
        const newStage = snapshot.val() || 'Pierwsze czytanie'
        console.log('Firebase status changed:', newStage)
        gameStage.value = newStage
      })

      const initialStatusRef = dbRef(db, `sessions/${props.sessionId}/status`)
      get(initialStatusRef).then((snapshot) => {
        if (!snapshot.exists()) {
          set(initialStatusRef, 'Pierwsze czytanie')
        }
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
      currentTopicNumber,
      collectiveVotes,
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
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
}

.content-wrapper > *:not(.status-panel) {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Dodajemy przezroczystość do kart w komponentach */
:deep(.v-card) {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
}

:deep(.status-panel) {
  background-color: rgba(255, 255, 255, 0.95) !important;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  max-width: 90%;
  margin: 0 auto;
  z-index: 10;
}

@media (max-width: 600px) {
  :deep(.status-panel) {
    width: 95%;
    max-width: none;
  }
}
</style> 