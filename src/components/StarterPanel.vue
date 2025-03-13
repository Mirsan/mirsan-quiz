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
            :color="buzzersConnected ? 'success' : 'primary'"
            block
            class="mb-2"
            :class="{ 'connecting': isConnecting }"
            @click="buzzersConnected ? disconnectBuzzers() : connectBuzzers()"
            :loading="isConnecting"
            prepend-icon="mdi-bluetooth"
          >
            {{ buzzersConnected ? 'Odłącz kontroler buzzerów' : 'Podłącz kontroler buzzerów' }}
          </v-btn>
          <div v-if="connectionError" class="connection-error text-center mb-6">
            {{ connectionError }}
          </div>
          <v-divider v-else class="mb-6"></v-divider>

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
      ],
      bluetoothDevice: null,
      bluetoothCharacteristic: null,
      isConnecting: false,
      connectionError: null
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
      this.isConnecting = true;
      this.connectionError = null;

      const options = {
        filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }]
      };

      try {
        // Połączenie z urządzeniem
        this.bluetoothDevice = await navigator.bluetooth.requestDevice(options);
        const server = await this.bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        this.bluetoothCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

        // Nasłuchiwanie sygnałów
        this.bluetoothCharacteristic.addEventListener('characteristicvaluechanged', this.handleBuzzerSignal);
        await this.bluetoothCharacteristic.startNotifications();

        this.buzzersConnected = true;
        console.log("Połączono z HM-10 i nasłuchiwanie sygnałów...");
      } catch (error) {
        console.error("Błąd połączenia", error);
        this.connectionError = error.message;
        this.buzzersConnected = false;
      } finally {
        this.isConnecting = false;
      }
    },

    handleBuzzerSignal(event) {
      const value = event.target.value.getUint8(0);
      
      // Emitujemy sygnał do komponentu nadrzędnego
      if (value === 49) { // Sygnał "1"
        this.$emit('buzzer-signal', 1);
      } else if (value === 50) { // Sygnał "2"
        this.$emit('buzzer-signal', 2);
      }
    },

    async disconnectBuzzers() {
      if (this.bluetoothCharacteristic) {
        try {
          await this.bluetoothCharacteristic.stopNotifications();
          this.bluetoothCharacteristic.removeEventListener('characteristicvaluechanged', this.handleBuzzerSignal);
        } catch (error) {
          console.error("Błąd podczas zatrzymywania powiadomień", error);
        }
      }

      if (this.bluetoothDevice && this.bluetoothDevice.gatt.connected) {
        await this.bluetoothDevice.gatt.disconnect();
      }

      this.bluetoothDevice = null;
      this.bluetoothCharacteristic = null;
      this.buzzersConnected = false;
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
  },
  beforeUnmount() {
    this.disconnectBuzzers();
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

.v-btn.primary {
  position: relative;
}

.v-btn.primary.connecting {
  opacity: 0.7;
  pointer-events: none;
}

.v-btn.primary.connected {
  background-color: #4CAF50 !important;
}

.connection-error {
  color: #ff5252;
  font-size: 0.875rem;
  margin-top: 4px;
}
</style> 