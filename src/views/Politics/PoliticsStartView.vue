<template>
  <v-container class="fill-height pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" lg="10" xl="8" class="pa-4">
        <v-card class="elevation-12 fill-height">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title class="text-h5">Gra Polityczna</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text class="pa-6">
            <v-row class="fill-height">
              <!-- Lewa kolumna z QR kodem -->
              <v-col cols="6" class="text-center d-flex flex-column justify-center">
                <h2 class="text-h4 mb-8">Dołącz do gry!</h2>
                <div v-if="sessionId" class="mb-6">
                  <qrcode-vue :value="joinUrl" :size="280" level="H" />
                </div>
                <div v-else>
                  <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                </div>
                <div class="d-flex flex-column align-center">
                  <a
                    v-if="sessionId"
                    :href="joinUrl"
                    target="_blank"
                    class="mb-4 text-decoration-none text-body-1"
                  >
                    {{ joinUrl }}
                  </a>
                </div>
              </v-col>

              <!-- Prawa kolumna z obrazkiem -->
              <v-col cols="6" class="d-flex flex-column align-center justify-center">
                <v-img
                  src="@/assets/images/real-voting.png"
                  alt="Prawdziwy system głosowania"
                  class="real-voting-image mb-4"
                  max-height="400"
                  contain
                />
                <em class="text-h6">Prawdziwy system do głosowania w sejmie</em>
              </v-col>
            </v-row>

            <!-- Wiersz z przyciskami na dole -->
            <v-row class="mt-8">
              <v-col cols="6" class="text-center">
                <v-btn
                  color="secondary"
                  @click="goToSettings"
                  min-width="250"
                  height="50"
                  class="text-h6"
                >
                  Ustawienia
                </v-btn>
              </v-col>
              <v-col cols="6" class="text-center">
                <v-btn
                  color="primary"
                  @click="goToBoard"
                  @keyup.enter="goToBoard"
                  min-width="250"
                  height="50"
                  class="text-h6"
                >
                  Rozpocznij obrady
                </v-btn>
              </v-col>
            </v-row>
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
      return `${window.location.origin}/mirsan-quiz/#/join-game/${sessionId.value}`
    })

    const goToBoard = () => {
      if (sessionId.value) {
        router.push(`/politics/board/${sessionId.value}`)
      }
    }

    const goToSettings = () => {
      router.push('/politics/settings')
    }

    onMounted(async () => {
      sessionId.value = await createGameSession()
    })

    return {
      sessionId,
      joinUrl,
      goToBoard,
      goToSettings
    }
  }
}
</script>

<style scoped>
.real-voting-image {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-card {
  display: flex;
  flex-direction: column;
}

.v-card-text {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.v-row {
  flex-grow: 1;
}
</style> 