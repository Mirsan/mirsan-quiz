<template>
  <v-dialog
    v-model="dialog"
    width="800"
    height="500"
    @click:outside="isBlocked ? null : dialog = false"
  >
    <v-card class="text-center" style="background-color: #000; background-image: radial-gradient(#333 2px, transparent 3px); background-size: 10px 10px;">
      <v-card-text class="text-h2 pa-12" style="color: yellow; font-family: 'PixelFont';">
        <v-tooltip location="top" text="Buzz">
          <template v-slot:activator="{ props }">
            <span v-bind="props">BUZZ TIME!</span>
          </template>
        </v-tooltip>
        <v-row class="justify-center">
          <v-col cols="5">
            <v-tooltip location="top" text="[Lewy Shift]">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  :color="activeTeam === 1 ? '#0000ff' : '#ccccff'" 
                  class="text-white team-btn"
                  style="width: 100%; height: 100px;"
                  @click="selectTeam(1)"
                  :disabled="isBlocked && activeTeam !== 1"
                >
                  {{ team1Name }} <br>
                  [Lewy Shift]
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
          <v-col cols="5">
            <v-tooltip location="top" text="[Prawy Shift]">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  :color="activeTeam === 2 ? '#ff0000' : '#ffcccc'" 
                  class="text-white team-btn"
                  style="width: 100%; height: 100px;"
                  @click="selectTeam(2)"
                  :disabled="isBlocked && activeTeam !== 2"
                >
                  {{ team2Name }} <br>
                  [Prawy Shift]
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
      activeTeam: null,
      isBlocked: false,
      closeTimer: null
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    team1Name: {
      type: String,
      required: true
    },
    team2Name: {
      type: String,
      required: true
    }
  },
  methods: {
    selectTeam(team) {
      if (this.isBlocked) return;
      
      this.activeTeam = team;
      this.isBlocked = true;

      // Po 3 sekundach zamykamy dialog
      this.closeTimer = setTimeout(() => {
        this.dialog = false;
        this.isBlocked = false;
      }, 3000);
    },
    handleKeyPress(event) {
      if (!this.dialog || this.isBlocked) return;
      
      if (event.key === 'Shift') {
        if (event.location === 1) {
          this.selectTeam(1);
        } else if (event.location === 2) {
          this.selectTeam(2);
        }
      }
    },
    resetState() {
      this.activeTeam = null;
      this.isBlocked = false;
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
    }
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.resetState();
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
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

.team-btn:disabled {
  opacity: 0.1;
}
</style> 