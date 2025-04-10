<template>
  <v-dialog
    v-model="show"
    persistent
    width="600"
  >
    <v-card class="text-center pa-4" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-title class="text-h4 mb-6" style="color: yellow; font-family: 'PixelFont';">
        KONFIGURACJA GRY
      </v-card-title>

      <v-card-text style="background-color: #000; background-image: none;">
        <v-form ref="form" @submit.prevent="startGame">
          <v-text-field
            v-model="team1Name"
            label="Nazwa Drużyny 1"
            variant="outlined"
            class="mb-2"
            style="color: yellow;"
            :rules="nameRules"
            prepend-icon="mdi-account-group"
            :counter="10"
          ></v-text-field>

          <v-text-field
            v-model="team2Name"
            label="Nazwa Drużyny 2"
            variant="outlined"
            class="mb-2"
            style="color: yellow;"
            :rules="nameRules"
            prepend-icon="mdi-account-group"
            :counter="10"
          ></v-text-field>

          <v-file-input
            v-model="questionsFile"
            label="Zestaw pytań"
            variant="outlined"
            class="mb-2"
            accept=".json"
            style="color: yellow;"
            :rules="[v => !!v || 'Plik z pytaniami jest wymagany']"
            prepend-icon="mdi-file-question"
            @change="handleFileChange"
          ></v-file-input>

          <v-row>
            <v-col :cols="gameEndCondition !== 'all' ? 6 : 12">
              <v-select
                v-model="gameEndCondition"
                :items="gameEndConditions"
                label="Warunek końca gry"
                variant="outlined"
                class="mb-2"
                style="color: yellow;"
                prepend-icon="mdi-flag-checkered"
                hide-details
              ></v-select>
            </v-col>
            
            <v-col cols="6" v-if="gameEndCondition !== 'all'">
              <v-text-field
                v-model.number="gameEndLimit"
                :label="gameEndCondition === 'points' ? 'Limit punktów' : 'Limit pytań'"
                variant="outlined"
                class="mb-2"
                style="color: yellow;"
                type="number"
                :rules="limitRules"
                prepend-icon="mdi-numeric"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <div class="checkboxes-container">
            <v-checkbox
              v-model="randomizeQuestions"
              label="Losowa kolejność pytań"
              color="yellow"
              hide-details
              density="compact"
            ></v-checkbox>

            <v-checkbox
              v-model="autoIncreaseMultiplier"
              label="Automatycznie zwiększaj mnożnik punktacji"
              color="yellow"
              hide-details
              density="compact"
            ></v-checkbox>

            <v-checkbox
              v-model="showKeyboardHints"
              label="Pokazuj wskazówki klawiszy"
              color="yellow"
              hide-details
              density="compact"
            ></v-checkbox>
          </div>

          <div v-if="fileError" class="text-error mb-4 text-center">
            {{ fileError }}
          </div>

          <v-divider class="my-6"></v-divider>

          <v-btn
            :color="isConnected ? 'success' : 'primary'"
            block
            class="mb-4 bluetooth-btn"
            @click="toggleBluetooth"
            :loading="isConnecting"
            :disabled="isConnecting"
            elevation="4"
            size="large"
            height="50"
          >
            <template v-slot:prepend>
              <v-icon :color="isConnected ? 'white' : 'white'" size="large">
                {{ isConnected ? 'mdi-bluetooth-connect' : 'mdi-bluetooth-off' }}
              </v-icon>
            </template>
            <span class="bluetooth-text">{{ isConnected ? 'Odłącz kontroler buzzerów' : 'Podłącz kontroler buzzerów' }}</span>
          </v-btn>

          <div v-if="bluetoothError" class="text-error mb-4 text-center">
            {{ bluetoothError }}
          </div>

          <v-btn
            color="yellow"
            block
            size="x-large"
            height="70"
            :disabled="!isFormValid"
            @click="startGame"
            class="start-button mt-6"
            elevation="8"
          >
            <template v-slot:prepend>
              <v-icon color="black" size="large">mdi-rocket-launch</v-icon>
            </template>
            <span class="start-text">START!</span>
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { useAudioManager } from '@/composables/useAudioManager';

export default {
  name: 'StarterPanel',
  setup() {
    const audioManager = useAudioManager();
    return { audioManager };
  },
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
      randomizeQuestions: false,
      autoIncreaseMultiplier: false,
      showKeyboardHints: false,
      nameRules: [
        v => !!v || 'Nazwa drużyny jest wymagana',
        v => v.length <= 10 || 'Nazwa drużyny nie może być dłuższa niż 10 znaków'
      ],
      fileError: null,
      gameEndCondition: 'all',
      gameEndConditions: [
        { title: 'Wszystkie pytania', value: 'all' },
        { title: 'Limit punktów', value: 'points' },
        { title: 'Limit pytań', value: 'questions' }
      ],
      gameEndLimit: null,
      limitRules: [
        v => !!v || 'Limit jest wymagany',
        v => v > 0 || 'Limit musi być większy od 0',
        v => Number.isInteger(Number(v)) || 'Limit musi być liczbą całkowitą'
      ]
    }
  },
  computed: {
    isFormValid() {
      const basicValidation = this.team1Name && 
             this.team2Name && 
             this.questionsFile &&
             this.team1Name.length <= 10 &&
             this.team2Name.length <= 10;

      // Dodatkowa walidacja dla limitu
      if (this.gameEndCondition !== 'all') {
        return basicValidation && 
               this.gameEndLimit && 
               this.gameEndLimit > 0 && 
               Number.isInteger(Number(this.gameEndLimit));
      }

      return basicValidation;
    }
  },
  methods: {
    toggleBluetooth() {
      this.$emit('toggle-bluetooth');
    },
    async startGame() {
      const { valid } = await this.$refs.form.validate()
      if (valid && this.isFormValid) {
        try {
          // Zatrzymaj odtwarzanie dźwięku przed rozpoczęciem gry
          this.audioManager.stopAll();
          
          const gameConfig = {
            team1Name: this.team1Name,
            team2Name: this.team2Name,
            questionsFile: this.questionsFile,
            randomizeQuestions: this.randomizeQuestions,
            autoIncreaseMultiplier: this.autoIncreaseMultiplier,
            isBluetoothConnected: this.isConnected,
            gameEndCondition: this.gameEndCondition,
            gameEndLimit: this.gameEndLimit,
            showKeyboardHints: this.showKeyboardHints,
          };
          
          this.$emit('game-start', gameConfig);
          this.show = false;
        } catch (error) {
          console.error('Błąd podczas startowania gry:', error);
          this.fileError = 'Wystąpił błąd podczas uruchamiania gry';
        }
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
    }
  },
  beforeUnmount() {
    // Zatrzymaj odtwarzanie dźwięku przed usunięciem komponentu
    this.audioManager.stopAll();
  },
  watch: {
    gameEndCondition: {
      immediate: true,
      handler(newValue) {
        if (newValue === 'points') {
          this.gameEndLimit = 300;
        } else if (newValue === 'questions') {
          this.gameEndLimit = 7;
        }
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
  font-family: 'PixelFont';
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  border: 3px solid rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.start-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: 0.5s;
}

.start-button:hover::before {
  left: 100%;
}

.start-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 255, 0, 0.7);
}

.start-text {
  font-family: 'PixelFont';
  font-size: 2rem;
}

.start-button :deep(.v-icon) {
  color: black !important;
}

.start-button:hover :deep(.v-icon) {
  color: black !important;
}

.bluetooth-btn {
  font-family: 'PixelFont';
  font-size: 1.2rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.bluetooth-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 0 15px rgba(100, 100, 255, 0.5);
}

.bluetooth-text {
  font-family: 'PixelFont';
  font-size: 1.2rem;
}

:deep(.v-messages) {
  color: white !important;
}

:deep(.v-counter) {
  color: white !important;
}

.checkboxes-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 16px 0;
  padding: 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}

:deep(.v-checkbox) {
  margin: 0;
  padding: 0;
}

:deep(.v-selection-control) {
  margin: 0 !important;
  padding: 4px 0 !important;
}

:deep(.v-label) {
  color: yellow !important;
  font-family: 'PixelFont';
  opacity: 0.9;
  font-size: 0.9rem;
  margin-left: 4px;
}

:deep(.v-selection-control__input) {
  color: yellow !important;
}

:deep(.v-row) {
  margin: 0;
  padding: 0;
}

:deep(.v-col) {
  padding: 4px;
}
</style> 