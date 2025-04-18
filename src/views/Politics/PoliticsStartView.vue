<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Gra Polityczna</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-row>
              <!-- Lewa kolumna z QR kodem -->
              <v-col cols="6" class="text-center">
                <h2 class="mb-4">Dołącz do gry!</h2>
                <div v-if="sessionId" class="mb-4">
                  <qrcode-vue :value="joinUrl" :size="200" level="H" />
                </div>
                <div v-else>
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>
                <div class="d-flex flex-column align-center">
                  <a
                    v-if="sessionId"
                    :href="joinUrl"
                    target="_blank"
                    class="mb-4 text-decoration-none"
                  >
                    {{ joinUrl }}
                  </a>
                </div>
              </v-col>

              <!-- Prawa kolumna z obrazkiem -->
              <v-col cols="6" class="d-flex flex-column align-center">
                <v-img
                  src="@/assets/images/real-voting.png"
                  alt="Prawdziwy system głosowania"
                  class="real-voting-image mb-2"
                />
                <em class="text-subtitle-1">Rrawdziwy system do głosowania w sejmie</em>
              </v-col>
            </v-row>

            <!-- Wiersz z przyciskami na dole -->
            <v-row class="mt-4">
              <v-col cols="6" class="text-center">
                <v-btn
                  color="secondary"
                  @click="goToSettings"
                  width="200"
                  tabindex="0"
                >
                  Ustawienia
                </v-btn>
              </v-col>
              <v-col cols="6" class="text-center">
                <v-btn
                  color="primary"
                  @click="goToBoard"
                  @keyup.enter="goToBoard"
                  width="200"
                  tabindex="0"
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
  height: auto;
  border-radius: 4px;
}
</style> 