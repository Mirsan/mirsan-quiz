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
  name: 'FamilyFreudView',
  data() {
    return {
      songs: []
    }
  },
  methods: {
    onFileSelect(event) {

    },
    async generateSongs() {

    }}
});
</script>
