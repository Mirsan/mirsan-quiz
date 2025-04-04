<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Dołącz do gry</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>Session ID: {{ sessionId }}</p>
            <p>Komponent się renderuje!</p>
            <v-form @submit.prevent="joinGame">
              <v-text-field
                v-model="deputyName"
                label="Imię i nazwisko posła"
                name="deputyName"
                prepend-icon="mdi-account"
                type="text"
                required
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="joinGame">Wejdź do sejmu</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import { ref as dbRef, set } from 'firebase/database'

export default {
  name: 'JoinGameView',
  props: {
    sessionId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    console.log('Session ID:', props.sessionId)
    const router = useRouter()
    const deputyName = ref('')

    const joinGame = async () => {
      console.log('Join game clicked')
      if (!deputyName.value) {
        console.log('No deputy name provided')
        return
      }
      
      const deputyRef = dbRef(db, `sessions/${props.sessionId}/deputies/${Date.now()}`)
      await set(deputyRef, {
        name: deputyName.value,
        joinedAt: Date.now()
      })
      console.log('Deputy added:', deputyName.value)

      router.push({
        name: 'PoliticianPanel',
        params: { 
          sessionId: props.sessionId,
          deputyName: deputyName.value 
        }
      }).then(() => {
        console.log('Navigated to PoliticianPanel')
      }).catch((error) => {
        console.error('Navigation error:', error)
      })
    }

    return {
      deputyName,
      joinGame
    }
  }
}
</script> 