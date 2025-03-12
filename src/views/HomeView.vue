<template>
  <SelectGame />
</template>

<script>
import { defineComponent } from 'vue';

// Components
import SelectGame from '../components/SelectGame.vue';

export default defineComponent({
  name: 'HomeView',

  components: {
    SelectGame,
  },
});
</script>
