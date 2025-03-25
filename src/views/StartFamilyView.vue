<template>
  <div class="start-family-view">
    <video
      ref="videoPlayer"
      class="background-video"
      autoplay
      loop
      muted
      playsinline
    >
      <source :src="videoSrc" type="video/mp4">
    </video>
    
    <StarterPanel 
      @game-start="handleGameStart" 
      @toggle-bluetooth="toggleBluetooth"
      :is-connected="isConnected"
      :is-connecting="isConnecting"
      :bluetooth-error="bluetoothError"
    />
    <BuzzCompetition 
      v-model="showBuzz"
      :team1Name="team1Name"
      :team2Name="team2Name"
      :bluetooth-characteristic="bluetoothCharacteristic"
      :showKeyboardHints="gameConfig?.showKeyboardHints"
      @team-selected="handleTeamSelected"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import StarterPanel from '@/components/StarterPanel.vue';
import BuzzCompetition from '@/components/BuzzCompetition.vue';
import backgroundVideo from '@/assets/video/background.mp4'
import { useAudioManager } from '@/composables/useAudioManager';

export default defineComponent({
  name: 'StartFamilyView',
  components: {
    StarterPanel,
    BuzzCompetition
  },
  data() {
    return {
      videoSrc: backgroundVideo,
      bluetoothDevice: null,
      bluetoothCharacteristic: null,
      isConnected: false,
      showBuzz: false,
      team1Name: '',
      team2Name: '',
      bluetoothError: null,
      isConnecting: false,
      gameConfig: null
    }
  },
  setup() {
    const audioManager = useAudioManager();
    return { audioManager };
  },
  methods: {
    async toggleBluetooth() {
      if (this.isConnected) {
        await this.disconnectBluetooth();
      } else {
        await this.connectToBluetooth();
      }
    },
    async connectToBluetooth() {
      this.isConnecting = true;
      this.bluetoothError = null;

      const options = {
        filters: [{ 
          services: ['0000ffe0-0000-1000-8000-00805f9b34fb']
        }],
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
      };

      try {
        this.bluetoothDevice = await navigator.bluetooth.requestDevice(options);
        const server = await this.bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        this.bluetoothCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        await this.bluetoothCharacteristic.startNotifications();

        this.bluetoothCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          const value = event.target.value.getUint8(0);
          if (value === 49 || value === 50) {
            this.showBuzz = true;
            this.handleTeamSelected(value === 49 ? 1 : 2);
          }
        });
        
        this.isConnected = true;
        this.bluetoothError = null;

        this.bluetoothDevice.addEventListener('gattserverdisconnected', () => {
          this.handleDisconnection();
        });

      } catch (error) {
        this.bluetoothError = this.getBluetoothErrorMessage(error);
        this.isConnected = false;
      } finally {
        this.isConnecting = false;
      }
    },

    getBluetoothErrorMessage(error) {
      if (error.name === 'NotFoundError') {
        return 'Nie wybrano urządzenia. Spróbuj ponownie i wybierz HM-10.';
      } else if (error.name === 'SecurityError') {
        return 'Brak uprawnień do Bluetooth. Sprawdź ustawienia przeglądarki.';
      } else if (error.name === 'NotSupportedError') {
        return 'Twoja przeglądarka nie wspiera Web Bluetooth API.';
      } else {
        return `Błąd połączenia: ${error.message}`;
      }
    },

    handleDisconnection() {
      this.isConnected = false;
      this.bluetoothDevice = null;
      this.bluetoothCharacteristic = null;
      this.bluetoothError = 'Urządzenie zostało rozłączone';
    },

    async disconnectBluetooth() {
      if (this.bluetoothCharacteristic) {
        try {
          await this.bluetoothCharacteristic.stopNotifications();
        } catch (error) {
          console.error("Error stopping notifications", error);
        }
      }

      if (this.bluetoothDevice && this.bluetoothDevice.gatt.connected) {
        await this.bluetoothDevice.gatt.disconnect();
      }

      this.handleDisconnection();
    },

    async handleGameStart(config) {
      console.log('Otrzymana konfiguracja:', config);
      
      if (!config.questionsFile) {
        console.error('Brak pliku z pytaniami');
        alert('Brak pliku z pytaniami');
        return;
      }

      try {
        this.audioManager.stopAll();
        
        // Czytamy zawartość pliku
        const reader = new FileReader();
        
        const fileContent = await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            console.log('Plik wczytany pomyślnie');
            resolve(event.target.result);
          };
          reader.onerror = () => {
            console.error('Błąd podczas czytania pliku');
            reject(new Error('Błąd odczytu pliku'));
          };
          reader.readAsText(config.questionsFile);
        });

        const questionsData = JSON.parse(fileContent);
        
        if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
          throw new Error('Nieprawidłowy format pliku z pytaniami');
        }

        // Jeśli włączono losową kolejność, mieszamy pytania
        if (config.randomizeQuestions) {
          questionsData.questions = this.shuffleArray([...questionsData.questions]);
        }

        // Przygotuj konfigurację do zapisania
        const fullConfig = {
          team1Name: config.team1Name,
          team2Name: config.team2Name,
          questionsData: questionsData.questions,
          randomizeQuestions: config.randomizeQuestions,
          autoIncreaseMultiplier: config.autoIncreaseMultiplier,
          isBluetoothConnected: this.isConnected,
          gameEndCondition: config.gameEndCondition,
          gameEndLimit: config.gameEndLimit,
          showKeyboardHints: config.showKeyboardHints
        };

        // Zapisz konfigurację
        localStorage.setItem('familyGameConfig', JSON.stringify(fullConfig));

        // Zapisz stan Bluetooth
        if (this.bluetoothDevice) {
          window.bluetoothState = {
            device: this.bluetoothDevice,
            characteristic: this.bluetoothCharacteristic,
            isConnected: this.isConnected,
            server: this.bluetoothDevice?.gatt
          };
          this.bluetoothDevice.removeEventListener('gattserverdisconnected', this.handleDisconnection);
        }

        // Zmiana sposobu nawigacji
        try {
          await this.$router.replace('/family');
        } catch (navigationError) {
          console.error('Błąd nawigacji:', navigationError);
          // Spróbuj alternatywną metodę
          window.location.href = '/family';
        }
        
      } catch (error) {
        console.error('Szczegółowy błąd:', error);
        alert(`Błąd podczas uruchamiania gry: ${error.message}`);
      }
    },

    handleTeamSelected(team) {
      if (team === 1) {
        this.team1Name = 'Drużyna 1';
      } else if (team === 2) {
        this.team2Name = 'Drużyna 2';
      }
      
      setTimeout(() => {
        this.showBuzz = false;
      }, 3000);
    },

    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  },
  beforeUnmount() {
    // Zatrzymaj odtwarzanie dźwięku przed usunięciem komponentu
    this.audioManager.stopAll();
    
    // Usuwamy automatyczne rozłączanie przy przejściu do następnego widoku
    if (this.$router.currentRoute.value.path === '/family') {
      return;
    }
    this.disconnectBluetooth();
  },
  mounted() {
    // Odtwarzamy dźwięk intro po załadowaniu komponentu
    this.audioManager.playIntro();
  }
});
</script>

<style scoped>
.start-family-view {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.background-video {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: 1;
  object-fit: cover;
  transform: translateX(0) translateY(0);
}
</style> 