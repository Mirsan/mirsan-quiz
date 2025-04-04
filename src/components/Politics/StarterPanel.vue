<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="text-center pa-6" elevation="8">
          <v-card-title class="text-h4 mb-6">Symulator Sejmu</v-card-title>
          <v-btn
            color="primary"
            x-large
            @click="startSimulation"
            size="x-large"
            class="px-8"
          >
            Start
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'StarterPanel',
  methods: {
    startSimulation() {
      this.$router.push('/politics/board')
    }
  }
}
</script> 