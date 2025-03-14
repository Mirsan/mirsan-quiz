<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent max-width="500px">
    <v-card class="text-center pa-4">
      <v-card-title class="text-h4 justify-center mb-4">
        Następna runda!
      </v-card-title>
      <v-card-text class="text-h5">
        {{ teamName }} zdobywa {{ points }} punktów!
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="primary"
          @click="$emit('update:modelValue', false)"
          class="text-h6 px-8"
        >
          Kontynuuj
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RoundNext',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    teamName: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue']
}
</script> 