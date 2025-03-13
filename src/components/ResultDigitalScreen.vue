<template>
  <v-card class="pa-4" outlined style="background-color: black; height: 100%; width: 100%;">
    <v-card-text style="color: yellow; font-size: 2em; font-family: 'PixelFont';">
      <v-container class="pa-0" fluid>
        <v-row 
          v-for="item in results" 
          :key="item.id"
          no-gutters
          class="flex-nowrap"
        >
          <v-col cols="1" class="flex-grow-0">
            {{ item.id }}
          </v-col>
          <v-col cols="8" class="d-flex justify-center">
            <div class="text-left" style="width: 100%;">
              <template v-if="item.pass">
                <template v-if="item.name.length > 20">
                  {{ item.name.substring(0, 20) + '.' }}
                </template>
                <template v-else>
                  {{ item.name }}
                </template>
              </template>
              <template v-else>
                ...................................
              </template>
            </div>
          </v-col>
          <v-col cols="2" class="text-right">
            <template v-if="item.pass">
              {{ item.points }}
            </template>
          </v-col>
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