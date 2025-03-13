<template>
  <v-dialog
    v-model="dialog"
    width="800"
    height="300"
    @click:outside="dialog = false"
  >
    <v-card class="text-center" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-text class="text-h2 pa-12" style="color: yellow; font-family: 'PixelFont';">
        BUZZ TIME!
      <v-row class="justify-center">
        <v-col cols="5">
          <v-btn :color="activePlayer === 1 ? '#6666cc' : '#ccccff'" class="text-white" style="width: 100%; height: 100px;"></v-btn>
        </v-col>
        <v-col cols="5">
          <v-btn :color="activePlayer === 2 ? '#774444' : '#ffcccc'" class="text-white" style="width: 100%; height: 100px;"></v-btn>
        </v-col>
      </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'BuzzCompetition',
  data() {
    return {
      activePlayer: null
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  }
}
</script> 