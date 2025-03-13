<template>
  <v-chip 
    density="compact" 
    class="text-h1 px-16 py-16" 
    style="background-color: #000; color: yellow; font-family: 'PixelFont'; background-image: radial-gradient(#333 3px, transparent 3px); background-size: 10px 10px; border-radius: 40px;"
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