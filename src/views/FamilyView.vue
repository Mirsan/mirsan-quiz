<template>
    <v-container>
        <SmallDigitalScreen :value="32" />

        <br>

        <v-card class="pa-4" outlined style="background-color: black; height: 100%; width: 100%;">
            <v-card-text style="color: yellow; font-size: 2em; font-family: 'PixelFont';">
                1 &nbsp; SLASK WROCLAW 35 <br>
                2 &nbsp; LEGIA WARSZAWA 17 <br>
                3 &nbsp; ARKA GDYNIA KURWA S 12 <br>
                4 &nbsp; ........................................... <br>
                5 &nbsp; ........................................... <br>
            </v-card-text>
        </v-card>

    </v-container>
</template>

<script>
import { defineComponent } from 'vue';
import SmallDigitalScreen from '@/components/SmallDigitalScreen.vue';

export default defineComponent({
  name: 'FamilyView',
  components: {
    SmallDigitalScreen
  },
  data() {
    return {
      songs: []
    }
  },
  methods: {
  }
});
</script>
