<template>
  <v-card class="pa-4" outlined style="background-color: black; height: 100%; width: 100%;">
    <v-card-text style="color: yellow; font-size: 2em; font-family: 'PixelFont';">
      <div v-for="item in results" :key="item.id">
        {{ item.id }} &nbsp; 
        <span v-if="item.pass">
          {{ item.name }} {{ item.points }}
        </span>
        <span v-if="!item.pass">
          ...................................
        </span>
        <br>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'FamilyResultDigitalScreen',
  props: {
    results: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  mounted() {
    console.log('Results:', this.results)
  }
}
</script> 