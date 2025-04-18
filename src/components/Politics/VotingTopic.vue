<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="10" md="8">
        <v-card class="text-center pa-6" elevation="8">
          <v-card-title class="voting-header mb-6">
            GŁOSOWANIE NR {{ actNumber }}
          </v-card-title>
          <v-card-text class="voting-question">
            {{ actQuestion }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { ref as dbRef, onValue } from '@firebase/database'
import { useTopics } from '@/firebase/topics'

export default {
  name: 'VotingTopic',
  props: {
    sessionId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const actNumber = ref(1)
    const currentTopicId = ref(null)
    const { topics: topicsRef } = useTopics()

    const actQuestion = computed(() => {
      if (currentTopicId.value !== null && topicsRef.value) {
        return topicsRef.value[currentTopicId.value] || 'Brak tematu'
      }
      return 'Ładowanie tematu...'
    })

    onMounted(() => {
      const sessionRef = dbRef(db, `sessions/${props.sessionId}/currentTopic`)
      onValue(sessionRef, (snapshot) => {
        const topicData = snapshot.val()
        if (topicData) {
          currentTopicId.value = topicData.id
          actNumber.value = topicData.number || currentTopicId.value + 1
        } else {
          // Domyślnie pierwszy temat
          currentTopicId.value = 0
          actNumber.value = 1
        }
      })
    })

    return {
      actNumber,
      actQuestion
    }
  }
}
</script>

<style scoped>
.voting-header {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-bottom: 3px solid #1976d2;
  display: inline-block;
  padding-bottom: 8px;
  margin: 0 auto;
}

.voting-question {
  font-size: 1.8rem;
  color: #333;
  line-height: 1.4;
  font-weight: 500;
  margin-top: 20px;
}

.v-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border: 1px solid rgba(25, 118, 210, 0.1);
  transition: transform 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(25, 118, 210, 0.1) !important;
}
</style> 