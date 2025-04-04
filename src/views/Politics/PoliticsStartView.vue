<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Gra Polityczna</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="text-center">
            <h2 class="mb-4">Dołącz do gry!</h2>
            <div v-if="sessionId" class="mb-4">
              <qrcode-vue :value="joinUrl" :size="200" level="H" />
            </div>
            <div v-else>
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <v-btn
              v-if="sessionId"
              color="primary"
              :href="joinUrl"
              target="_blank"
              class="mb-4"
            >
              Otwórz link
            </v-btn>
            <v-btn
              color="secondary"
              @click="goToBoard"
            >
              Przejdź do panelu prowadzącego
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { createGameSession } from '@/firebase/gameSession'

export default {
  name: 'PoliticsStartView',
  components: {
    QrcodeVue
  },
  setup() {
    const router = useRouter()
    const sessionId = ref(null)

    const joinUrl = computed(() => {
      if (!sessionId.value) return ''
      return `${window.location.origin}/join-game/${sessionId.value}`
    })

    const goToBoard = () => {
      if (sessionId.value) {
        router.push(`/politics/board/${sessionId.value}`)
      }
    }

    onMounted(async () => {
      sessionId.value = await createGameSession()
    })

    return {
      sessionId,
      joinUrl,
      goToBoard
    }
  }
}
</script> 