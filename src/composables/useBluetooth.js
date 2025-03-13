import { ref } from 'vue';

export function useBluetooth() {
    const bluetoothDevice = ref(null);
    const bluetoothCharacteristic = ref(null);
    const isBluetoothConnected = ref(false);

    // Stałe dla sygnałów buzzerów
    const BUZZER_SIGNALS = {
        49: 2, // Lewy buzzer -> Gracz 2
        50: 1  // Prawy buzzer -> Gracz 1
    };

    const handleDisconnection = async () => {
        isBluetoothConnected.value = false;
        
        try {
            if (bluetoothDevice.value) {
                await bluetoothDevice.value.gatt.connect();
                const service = await bluetoothDevice.value.gatt.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
                bluetoothCharacteristic.value = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
                await bluetoothCharacteristic.value.startNotifications();
                isBluetoothConnected.value = true;
            }
        } catch (error) {
            // Cicha obsługa błędu
        }
    };

    const handleBuzzerSignal = (event, callback) => {
        const value = event.target.value.getUint8(0);
        if (value in BUZZER_SIGNALS) {
            callback(BUZZER_SIGNALS[value]);
        }
    };

    const initializeBluetooth = async (onSignal) => {
        if (window.bluetoothState) {
            bluetoothDevice.value = window.bluetoothState.device;
            bluetoothCharacteristic.value = window.bluetoothState.characteristic;
            isBluetoothConnected.value = window.bluetoothState.isConnected;

            if (bluetoothCharacteristic.value) {
                try {
                    if (!bluetoothDevice.value.gatt.connected) {
                        await bluetoothDevice.value.gatt.connect();
                        const service = await bluetoothDevice.value.gatt.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
                        bluetoothCharacteristic.value = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
                    }
                    
                    await bluetoothCharacteristic.value.startNotifications();
                    if (onSignal) {
                        bluetoothCharacteristic.value.addEventListener('characteristicvaluechanged', 
                            (event) => handleBuzzerSignal(event, onSignal));
                    }
                    bluetoothDevice.value.addEventListener('gattserverdisconnected', handleDisconnection);
                    return true;
                } catch (error) {
                    handleDisconnection();
                    return false;
                }
            }
        }
        return false;
    };

    const cleanup = () => {
        if (bluetoothDevice.value) {
            bluetoothDevice.value.removeEventListener('gattserverdisconnected', handleDisconnection);
        }
    };

    return {
        bluetoothDevice,
        bluetoothCharacteristic,
        isBluetoothConnected,
        initializeBluetooth,
        cleanup,
        BUZZER_SIGNALS
    };
} 