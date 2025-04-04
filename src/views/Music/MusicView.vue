<template>
    <v-container>
        <v-row>
            <v-col cols="8">
                <v-file-input label="Wybierz plik .txt" prepend-icon="mdi-file" variant="filled" accept=".txt" @change="onFileSelect"></v-file-input>
            </v-col>    
            <v-col  cols="4">
                <v-btn prepend-icon="mdi-checkbox-marked" color="success" block @click="generateSongs">Generuj</v-btn>
            </v-col>
        </v-row>
        <v-row v-for="song in songs" :key="song.category">
            <v-col>
                <v-btn prepend-icon="mdi-music" color="primary" block> {{ song.category }} </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MusicView',
  data() {
    return {
      songs: [],
      selectedFile: null
    }
  },
  methods: {
    onFileSelect(event) {
      this.selectedFile = event.target.files[0];
    },
    async generateSongs() {
      if (!this.selectedFile) return;
      
      try {

        // Symulacja listy plików MP3 (w rzeczywistej aplikacji użyj API backendu)
        const mp3Files = [
          'pixar/You\'ve Got a Friend in Me.mp3',
          'kobitki/Girls Just Want to Have Fun.mp3',
          'straszne/Thriller.mp3'
        ];

        this.songs = mp3Files.map(filePath => {
          const [category, fileName] = filePath.split('/');
          return {
            file: fileName,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            name: fileName.replace('.mp3', '')
          };
        });
      } catch (error) {
        console.error('Błąd podczas przetwarzania pliku:', error);
      }
    }
  }
});
</script>
