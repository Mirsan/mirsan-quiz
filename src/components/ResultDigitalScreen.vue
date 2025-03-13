<template>
  <v-card class="pa-2" outlined style="background-color: black; height: 100%; width: 100%;">
    <v-card-text style="color: yellow; font-size: 3em; font-family: 'PixelFont';">
      <v-container class="pa-0" fluid>
        <v-row 
          v-for="item in results" 
          :key="item.id"
          no-gutters
          class="flex-nowrap"
        >
          <v-col cols="2" class="flex-grow-0">
            {{ item.id }}
          </v-col>
          <v-col cols="9" class="d-flex justify-center">
            <div class="text-left" style="width: 100%;">
              <template v-if="item.pass">
                <template v-if="item.name.length > 18">
                  {{ item.name.substring(0, 18) + '.' }}
                </template>
                <template v-else>
                  {{ item.name }}
                </template>
              </template>
              <template v-else>
                ................................................
              </template>
            </div>
          </v-col>
          <v-col cols="1" class="text-right">
            <template v-if="item.pass">
              {{ item.points }}
            </template>
            <template v-else>
              --
            </template>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6"></v-col>
          <v-col cols="4" class="text-right">SUMA:</v-col>
          <v-col cols="2" class="text-right">{{ results.filter(item => item.pass).reduce((acc, item) => acc + item.points, 0) }}</v-col>
        </v-row>
      </v-container>
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
.v-row {
  min-height: 1.5em;
}
</style> 