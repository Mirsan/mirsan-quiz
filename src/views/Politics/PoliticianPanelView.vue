<template>
  <div class="politician-panel-view">
    <div v-if="isLandscape">
      <VotingPanel
        :deputy-name="deputyName"
        :vote-id="currentTopicNumber"
        :session-id="sessionId"
        @vote-cast="handleVote"
        :disabled="!canVote"
      />
    </div>
    <div v-else class="rotate-message">
      <v-icon size="64" class="mb-4">mdi-rotate-right</v-icon>
      <div class="text-h6">Odwróć telefon by uruchomić Panel do głosowania</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { ref as dbRef, onValue, set } from '@firebase/database'
import VotingPanel from '@/components/Politics/VotingPanel.vue'
import { useTopics } from '@/firebase/topics'

export default {
  name: 'PoliticianPanelView',
  components: {
    VotingPanel
  },
  props: {
    sessionId: {
      type: String,
      required: true
    },
    deputyName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const gameStage = ref('')
    const currentTopicNumber = ref(1)
    const hasVoted = ref(false)
    const isLandscape = ref(false)
    const { topics, loadTopics, setupTopicsListener } = useTopics()

    const currentTopic = computed(() => {
      console.log('Computing current topic:', {
        currentTopicNumber: currentTopicNumber.value,
        topics: topics.value
      })
      const index = (currentTopicNumber.value || 1) - 1
      const topic = topics.value[index]
      console.log('Selected topic:', topic)
      return topic || 'Brak tematu'
    })

    const canVote = computed(() => {
      return gameStage.value === 'Głosowanie' && !hasVoted.value
    })

    const handleVote = async (choice) => {
      if (!canVote.value) {
        console.log('Cannot vote:', { stage: gameStage.value, hasVoted: hasVoted.value })
        return
      }

      try {
        const voteRef = dbRef(db, `sessions/${props.sessionId}/votes/${props.deputyName}`)
        await set(voteRef, {
          option: choice,
          timestamp: Date.now(),
          topicNumber: currentTopicNumber.value
        })
        console.log('Vote recorded successfully:', { choice, deputy: props.deputyName })
        hasVoted.value = true
      } catch (error) {
        console.error('Error recording vote:', error)
      }
    }

    const checkOrientation = () => {
      isLandscape.value = window.innerWidth > window.innerHeight
    }

    onMounted(async () => {
      checkOrientation()
      window.addEventListener('resize', checkOrientation)
      setupTopicsListener()
      await loadTopics()

      // Nasłuchuj na zmiany etapu
      const stageRef = dbRef(db, `sessions/${props.sessionId}/status`)
      onValue(stageRef, (snapshot) => {
        const newStage = snapshot.val()
        console.log('Stage changed to:', newStage)
        gameStage.value = newStage

        // Reset głosowania przy zmianie etapu
        if (newStage !== 'Głosowanie') {
          hasVoted.value = false
        }
      })

      // Nasłuchuj na zmiany aktualnego tematu
      const topicRef = dbRef(db, `sessions/${props.sessionId}/currentTopic`)
      onValue(topicRef, (snapshot) => {
        const topicData = snapshot.val()
        if (topicData) {
          console.log('Topic changed to:', topicData)
          currentTopicNumber.value = topicData.number || 1
          hasVoted.value = false
        }
      })

      // Sprawdź czy już głosował w tym temacie
      const votesRef = dbRef(db, `sessions/${props.sessionId}/votes/${props.deputyName}`)
      onValue(votesRef, (snapshot) => {
        const voteData = snapshot.val()
        if (voteData && voteData.topicNumber === currentTopicNumber.value) {
          console.log('Already voted in this topic:', voteData)
          hasVoted.value = true
        }
      })
    })

    return {
      gameStage,
      currentTopicNumber,
      currentTopic,
      hasVoted,
      canVote,
      handleVote,
      isLandscape
    }
  }
}
</script>

<style scoped>
.politician-panel-view {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f0f0f0;
}

.rotate-message {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 20px;
}
</style> 