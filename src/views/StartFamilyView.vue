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
      @team-selected="handleTeamSelected"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import StarterPanel from '@/components/StarterPanel.vue';
import BuzzCompetition from '@/components/BuzzCompetition.vue';
import backgroundVideo from '@/assets/video/background.mp4'

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
      isConnecting: false
    }
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
        console.log('Requesting Bluetooth device...');
        this.bluetoothDevice = await navigator.bluetooth.requestDevice(options);
        
        console.log('Connecting to GATT server...');
        const server = await this.bluetoothDevice.gatt.connect();
        
        console.log('Getting primary service...');
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        
        console.log('Getting characteristic...');
        this.bluetoothCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        
        console.log('Starting notifications...');
        await this.bluetoothCharacteristic.startNotifications();

        // Dodajemy nasłuchiwanie na charakterystykę
        this.bluetoothCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          const value = event.target.value.getUint8(0);
          console.log('Received value:', value);
          
          // Pokazujemy okno buzz i obsługujemy sygnały
          if (value === 49 || value === 50) { // ASCII dla "1" i "2"
            this.showBuzz = true;
            if (value === 49) {
              this.handleTeamSelected(1);
            } else if (value === 50) {
              this.handleTeamSelected(2);
            }
          }
        });
        
        this.isConnected = true;
        this.bluetoothError = null;
        console.log("Connected to HM-10 and listening for signals...");

        // Dodajemy nasłuchiwanie na rozłączenie
        this.bluetoothDevice.addEventListener('gattserverdisconnected', () => {
          console.log('Bluetooth device disconnected');
          this.handleDisconnection();
        });

      } catch (error) {
        console.error("Failed to connect:", error);
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
      // Czytamy zawartość pliku
      const reader = new FileReader();
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(config.questionsFile);
      });

      // Zapisujemy konfigurację w localStorage bez obiektu File
      localStorage.setItem('familyGameConfig', JSON.stringify({
        team1Name: config.team1Name,
        team2Name: config.team2Name,
        questionsData: JSON.parse(fileContent),
        isBluetoothConnected: this.isConnected
      }));

      // Zapisujemy stan Bluetooth w globalnym obiekcie
      window.bluetoothState = {
        device: this.bluetoothDevice,
        characteristic: this.bluetoothCharacteristic,
        isConnected: this.isConnected,
        server: this.bluetoothDevice?.gatt
      };

      // Usuwamy nasłuchiwanie na rozłączenie z tego komponentu
      this.bluetoothDevice?.removeEventListener('gattserverdisconnected', this.handleDisconnection);

      // Przekierowujemy do właściwej gry
      this.$router.push('/family');
    },

    handleTeamSelected(team) {
      console.log('Wybrano drużynę:', team);
      // Ustawiamy nazwę drużyny w zależności od wybranego przycisku
      if (team === 1) {
        this.team1Name = 'Drużyna 1';
      } else if (team === 2) {
        this.team2Name = 'Drużyna 2';
      }
      
      // Po 3 sekundach zamykamy okno buzz
      setTimeout(() => {
        this.showBuzz = false;
      }, 3000);
    }
  },
  beforeUnmount() {
    // Usuwamy automatyczne rozłączanie przy przejściu do następnego widoku
    if (this.$router.currentRoute.value.path === '/family') {
      return;
    }
    this.disconnectBluetooth();
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