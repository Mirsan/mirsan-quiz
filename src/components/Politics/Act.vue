<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="10" md="8">
        <v-card class="text-center pa-6" elevation="8">
          <v-card-title class="text-h5 mb-4">
            Głosowanie nr {{ actNumber }} | {{ actQuestion }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Act',
  data() {
    return {
      actNumber: 1,
      actQuestion: 'Czy jesteś za legalizacją marihuany?'
    }
  }
}
</script>

<style scoped>
.v-card-title {
  word-break: normal;
  white-space: normal;
  line-height: 1.4;
}
</style> 