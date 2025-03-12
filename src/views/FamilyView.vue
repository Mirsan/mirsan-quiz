<template>
    <v-container>
        <SmallDigitalScreen :value="32" />
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
