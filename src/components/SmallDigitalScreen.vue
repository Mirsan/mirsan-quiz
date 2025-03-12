<template>
  <v-chip 
    density="compact" 
    class="text-h1 px-16 py-16" 
    style="background-color: black; color: yellow; font-family: 'PixelFont'; width: 3em; text-align: right; display: flex; justify-content: flex-end;"
  >
    {{ displayValue }}
  </v-chip>
</template>

<script>
export default {
  name: 'SmallDigitalScreen',
  props: {
    value: {
      type: [Number, String],
      required: true,
      default: 0
    }
  },
  computed: {
    displayValue() {
      return Number(this.value) > 999 ? 999 : this.value
    }
  }
}
</script> 