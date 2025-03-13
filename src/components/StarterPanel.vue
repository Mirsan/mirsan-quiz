<template>
  <v-dialog
    v-model="show"
    persistent
    width="600"
  >
    <v-card class="text-center pa-6" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-title class="text-h4 mb-6" style="color: yellow; font-family: 'PixelFont';">
        KONFIGURACJA GRY
      </v-card-title>

      <v-card-text style="background-color: #000; background-image: none;">
        <v-form ref="form" @submit.prevent="startGame">
          <v-text-field
            v-model="team1Name"
            label="Nazwa Drużyny 1"
            variant="outlined"
            class="mb-4"
            style="color: yellow;"
            :rules="nameRules"
            prepend-icon="mdi-account-group"
            :counter="10"
          ></v-text-field>

          <v-text-field
            v-model="team2Name"
            label="Nazwa Drużyny 2"
            variant="outlined"
            class="mb-4"
            style="color: yellow;"
            :rules="nameRules"
            prepend-icon="mdi-account-group"
            :counter="10"
          ></v-text-field>

          <v-file-input
            v-model="questionsFile"
            label="Zestaw pytań"
            variant="outlined"
            class="mb-4"
            accept=".json"
            style="color: yellow;"
            :rules="[v => !!v || 'Plik z pytaniami jest wymagany']"
            prepend-icon="mdi-file-question"
          ></v-file-input>

          <v-divider class="my-6"></v-divider>

          <v-btn
            color="primary"
            block
            class="mb-6"
            @click="connectBuzzers"
            prepend-icon="mdi-bluetooth"
          >
            Podłącz kontroler buzzerów
          </v-btn>

          <v-divider class="mb-6"></v-divider>

          <v-btn
            color="yellow"
            block
            size="large"
            height="60"
            :disabled="!isFormValid"
            @click="startGame"
            prepend-icon="mdi-rocket-launch"
            class="start-button"
          >
            START!
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'StarterPanel',
  data() {
    return {
      show: true,
      team1Name: '',
      team2Name: '',
      questionsFile: null,
      buzzersConnected: false,
      nameRules: [
        v => !!v || 'Nazwa drużyny jest wymagana',
        v => v.length <= 10 || 'Nazwa drużyny nie może być dłuższa niż 10 znaków'
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.team1Name && 
             this.team2Name && 
             this.questionsFile &&
             this.team1Name.length <= 10 &&
             this.team2Name.length <= 10
    }
  },
  methods: {
    async connectBuzzers() {
      // TODO: Implementacja połączenia z buzzerami
      this.buzzersConnected = true;
    },
    async startGame() {
      const { valid } = await this.$refs.form.validate()
      if (valid && this.isFormValid) {
        this.$emit('game-start', {
          team1Name: this.team1Name,
          team2Name: this.team2Name,
          questionsFile: this.questionsFile
        });
        this.show = false;
      }
    }
  }
}
</script>

<style scoped>
:deep(.v-field) {
  color: yellow !important;
}
:deep(.v-label) {
  color: yellow !important;
}
:deep(.v-field__outline) {
  color: yellow !important;
}
:deep(.v-file-input__prepend-icon) {
  color: yellow !important;
}
:deep(.v-icon) {
  color: yellow !important;
}
:deep(.v-btn.v-btn--disabled) {
  opacity: 0.5;
}

.start-button {
  color: black !important;
  font-weight: bold;
}

.start-button :deep(.v-icon) {
  color: black !important;
}

.start-button:hover :deep(.v-icon) {
  color: black !important;
}

:deep(.v-messages) {
  color: white !important;
}

:deep(.v-counter) {
  color: white !important;
}
</style> 