<template>
  <v-chip 
    density="compact" 
    class="text-h1 py-16 d-flex justify-center" 
    style="background-color: #000; color: yellow; font-family: 'PixelFont'; background-image: radial-gradient(#110 3px, transparent 1px); background-size: 10px 10px; border-radius: 40px; width: 250px;"
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