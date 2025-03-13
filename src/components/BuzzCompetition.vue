<template>
  <v-dialog
    v-model="dialog"
    width="800"
    height="500"
    @click:outside="dialog = false"
  >
    <v-card class="text-center" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-text class="text-h2 pa-12" style="color: yellow; font-family: 'PixelFont';">
        <v-tooltip location="top" text="Buzz - zgłaszanie drużyny [*]">
          <template v-slot:activator="{ props }">
            <span v-bind="props">BUZZ TIME!</span>
          </template>
        </v-tooltip>
        <v-row class="justify-center">
          <v-col cols="5">
            <v-tooltip location="top" text="Drużyna 1 - punkty [+]">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  :color="activeTeam === 1 ? '#0000ff' : '#ccccff'" 
                  class="text-white team-btn"
                  style="width: 100%; height: 100px;"
                  @click="selectTeam(1)"
                >
                  [1]
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
          <v-col cols="5">
            <v-tooltip location="top" text="Drużyna 2 - budzik [-]">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  :color="activeTeam === 2 ? '#ff0000' : '#ffcccc'" 
                  class="text-white team-btn"
                  style="width: 100%; height: 100px;"
                  @click="selectTeam(2)"
                >
                  [2]
                </v-btn>
              </template>
            </v-tooltip>
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
      activeTeam: null
    }
  },
  methods: {
    selectTeam(team) {
      console.log('Selecting team:', team);
      this.activeTeam = team;
      this.dialog = false;
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

<style scoped>
.team-btn {
  transition: all 0.3s ease;
  font-family: 'PixelFont';
  font-size: 2rem;
}
</style> 