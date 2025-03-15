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
            @change="handleFileChange"
          ></v-file-input>

          <div v-if="fileError" class="text-error mb-4 text-center">
            {{ fileError }}
          </div>

          <v-divider class="my-6"></v-divider>

          <v-btn
            color="yellow"
            block
            class="mb-2"
            @click="toggleBluetooth"
            :loading="isConnecting"
            :disabled="isConnecting"
          >
            <template v-slot:prepend>
              <v-icon color="black">mdi-bluetooth</v-icon>
            </template>
            {{ isConnected ? 'Odłącz kontroler buzzerów' : 'Podłącz kontroler buzzerów' }}
          </v-btn>

          <div v-if="bluetoothError" class="text-error mb-4 text-center">
            {{ bluetoothError }}
          </div>

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
  props: {
    isConnected: {
      type: Boolean,
      default: false
    },
    isConnecting: {
      type: Boolean,
      default: false
    },
    bluetoothError: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      show: true,
      team1Name: '',
      team2Name: '',
      questionsFile: null,
      nameRules: [
        v => !!v || 'Nazwa drużyny jest wymagana',
        v => v.length <= 10 || 'Nazwa drużyny nie może być dłuższa niż 10 znaków'
      ],
      fileError: null
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
    toggleBluetooth() {
      this.$emit('toggle-bluetooth');
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
    },
    async handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        // Czytamy i walidujemy plik
        const content = await this.readFileContent(file);
        const questionsData = JSON.parse(content);
        
        // Walidacja struktury
        if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
          throw new Error('Nieprawidłowy format pliku - brak tablicy questions');
        }

        // Walidacja pytań
        questionsData.questions.forEach((q, idx) => {
          if (!q.question || !q.answers || !Array.isArray(q.answers)) {
            throw new Error(`Nieprawidłowa struktura pytania ${idx + 1}`);
          }
          if (q.answers.length === 0) {
            throw new Error(`Pytanie ${idx + 1} nie ma żadnych odpowiedzi`);
          }
          q.answers.forEach((a, aIdx) => {
            if (!a.answer || typeof a.points !== 'number') {
              throw new Error(`Nieprawidłowa struktura odpowiedzi ${aIdx + 1} w pytaniu ${idx + 1}`);
            }
          });
        });

        // Jeśli walidacja przeszła, zapisujemy plik
        this.questionsFile = file;
        this.fileError = null;
      } catch (error) {
        this.fileError = `Błąd walidacji pliku: ${error.message}`;
        event.target.value = ''; // Reset input
        this.questionsFile = null;
      }
    },

    readFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
        reader.readAsText(file);
      });
    },

    handleSubmit() {
      if (!this.team1Name || !this.team2Name || !this.questionsFile) {
        this.formError = 'Wypełnij wszystkie pola';
        return;
      }
      
      this.$emit('game-start', {
        team1Name: this.team1Name,
        team2Name: this.team2Name,
        questionsFile: this.questionsFile
      });
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