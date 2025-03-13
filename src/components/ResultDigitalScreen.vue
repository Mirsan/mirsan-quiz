<template>
  <v-card class="pa-2" outlined style="background-color: black; height: 100%; width: 100%;">
    <v-card-text style="color: yellow; font-size: 3em; font-family: 'PixelFont'; height: 100%;">
      <div class="results-container">
        <template v-for="result in results" :key="result.id">
          <v-row no-gutters class="result-row flex-nowrap">
            <v-col cols="2" class="flex-grow-0">
              {{ result.id }}
            </v-col>
            <v-col cols="9" class="d-flex justify-center">
              <div class="text-left" style="width: 100%;">
                <template v-if="result.pass">
                  <template v-if="result.name.length > 18">
                    {{ result.name.substring(0, 18) + '.' }}
                  </template>
                  <template v-else>
                    {{ result.name }}
                  </template>
                </template>
                <template v-else>
                  ................................................
                </template>
              </div>
            </v-col>
            <v-col cols="1" class="text-right">
              <template v-if="result.pass">
                {{ result.points }}
              </template>
              <template v-else>
                --
              </template>
            </v-col>
          </v-row>
        </template>

        <v-row no-gutters class="result-row flex-nowrap">
          <v-col cols="12">&nbsp;</v-col>
        </v-row>

        <v-row no-gutters class="result-row flex-nowrap">
          <v-col cols="6"></v-col>
          <v-col cols="4" class="text-right">SUMA:</v-col>
          <v-col cols="2" class="text-right">{{ results.filter(item => item.pass).reduce((acc, item) => acc + item.points, 0) }}</v-col>
        </v-row>

        <template v-for="index in (8 - results.length)" :key="'empty-'+index">
          <v-row no-gutters class="result-row flex-nowrap">
            <v-col cols="12">&nbsp;</v-col>
          </v-row>
        </template>
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
  }
}
</script>

<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(11 * 1.2em); /* zmniejszona wysokość wiersza */
  gap: 0; /* usuwa domyślne odstępy */
}

.result-row {
  min-height: 1.2em; /* zmniejszona wysokość wiersza */
  flex: 1;
  margin: 0; /* usuwa marginesy */
  padding: 0; /* usuwa padding */
}

.v-col {
  padding: 0 4px; /* minimalne boczne odstępy dla czytelności */
}
</style> 