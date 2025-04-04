<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Panel Posła: {{ deputyName }}
          </v-card-title>
          <v-card-text>
            <div v-if="currentQuestion && gameStage === 'voting'">
              <h3>{{ currentQuestion.text }}</h3>
              <v-btn
                v-for="option in currentQuestion.options"
                :key="option"
                color="primary"
                class="ma-2"
                @click="vote(option)"
                :disabled="hasVoted"
              >
                {{ option }}
              </v-btn>
            </div>
            <div v-else>
              <h3>Oczekiwanie na pytanie...</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { ref as dbRef, onValue, set } from 'firebase/database'
import { useRouter } from 'vue-router'

export default {
  name: 'PoliticianPanelView',
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
    const currentQuestion = ref(null)
    const gameStage = ref('waiting')
    const hasVoted = ref(false)
    const router = useRouter()

    const vote = async (option) => {
      if (hasVoted.value) return
      
      const voteRef = dbRef(db, `sessions/${props.sessionId}/votes/${props.deputyName}`)
      await set(voteRef, {
        option,
        timestamp: Date.now()
      })
      
      hasVoted.value = true
    }

    const joinGame = async () => {
      if (!props.deputyName) return
      
      const deputyRef = dbRef(db, `sessions/${props.sessionId}/deputies/${Date.now()}`)
      await set(deputyRef, {
        name: props.deputyName,
        joinedAt: Date.now()
      })

      router.push({
        name: 'PoliticianPanel',
        params: { 
          sessionId: props.sessionId,
          deputyName: props.deputyName 
        }
      })
    }

    onMounted(() => {
      const questionRef = dbRef(db, `sessions/${props.sessionId}/currentQuestion`)
      const stageRef = dbRef(db, `sessions/${props.sessionId}/status`)

      onValue(questionRef, (snapshot) => {
        currentQuestion.value = snapshot.val()
      })

      onValue(stageRef, (snapshot) => {
        gameStage.value = snapshot.val()
        if (snapshot.val() !== 'voting') {
          hasVoted.value = false
        }
      })
    })

    return {
      currentQuestion,
      gameStage,
      hasVoted,
      vote,
      joinGame
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
</style> 