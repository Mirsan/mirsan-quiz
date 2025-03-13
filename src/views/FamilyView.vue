<template>
    <v-container class="flex-wrap">
        <v-row>
            <v-col cols="12" class="d-flex justify-center">
                <SmallDigitalScreen :value="32" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="2">
                        <SmallDigitalScreen :value="32" />
                    </v-col>
                    <v-col cols="8">
                        <v-card class="pa-4" outlined style="background-color: black; height: 100%; width: 100%;">
                            <ResultDigitalScreen :results="results" />
                        </v-card>
                    </v-col>
                    <v-col cols="2">
                        <SmallDigitalScreen :value="32" />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { defineComponent } from 'vue';
import SmallDigitalScreen from '@/components/SmallDigitalScreen.vue';
import ResultDigitalScreen from '@/components/ResultDigitalScreen.vue';

export default defineComponent({
  name: 'FamilyView',
  components: {
    SmallDigitalScreen,
    ResultDigitalScreen
  },
  data() {
    return {
      results: [
        { id: 1, name: 'SLASK WROCLAW', points: 35, pass: false },
        { id: 2, name: 'LEGIA WARSZAWA fdsadfsfdshhbdffddfs', points: 17, pass: true },
        { id: 3, name: 'ARKA GDYNIA', points: 12, pass: false },
        { id: 5, name: 'JAGIELONIA', points: 8, pass: true },
        { id: 6, name: 'PODBESKIDZIE', points: 4, pass: true },
        { id: 7, name: 'KRAKOWIA', points: 3, pass: true },
        { id: 8, name: 'ANASTAZJA', points: 2, pass: true },
        { id: 9, name: 'MOGILA', points: 1, pass: true }
      ]
    }
  },
  methods: {
  }
});
</script>
