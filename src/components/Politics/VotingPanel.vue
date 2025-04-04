<template>
  <v-container class="voting-panel fill-height">
    <v-card class="voting-card" elevation="4">
      <!-- Górny pasek -->
      <v-card-title class="header-bar d-flex justify-space-between align-center pa-4">
        <div class="d-flex align-center">
          <v-icon icon="mdi-card-account-details" class="mr-2" />
          <span class="text-h6">{{ deputyName }}</span>
        </div>
        <div>
          <v-btn
            icon
            variant="text"
            @click="toggleContrast"
          >
            <v-icon>mdi-contrast-circle</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <!-- Numer głosowania -->
      <v-card-subtitle class="text-h6 pl-4 pt-4">
        Głosowanie nr {{ voteId }}
      </v-card-subtitle>

      <!-- Środkowy panel z wynikiem -->
      <v-card-text class="text-center pa-6">
        <div 
          class="vote-result-display"
          :class="{ 
            'vote-for': currentVote === 'ZA',
            'vote-against': currentVote === 'PRZECIW',
            'vote-abstain': currentVote === 'WSTRZYMAŁ SIĘ'
          }"
        >
          <span v-if="currentVote" class="text-h4">
            Głos: {{ currentVote }}
          </span>
        </div>
      </v-card-text>

      <!-- Panel przycisków -->
      <v-card-actions class="button-panel pa-4">
        <v-row justify="space-between" no-gutters>
          <v-col cols="4" class="px-1">
            <v-btn
              block
              color="success"
              size="x-large"
              @click="vote('ZA')"
              :disabled="!!currentVote"
            >
              Za
            </v-btn>
          </v-col>
          <v-col cols="4" class="px-1">
            <v-btn
              block
              color="error"
              size="x-large"
              @click="vote('PRZECIW')"
              :disabled="!!currentVote"
            >
              Przeciw
            </v-btn>
          </v-col>
          <v-col cols="4" class="px-1">
            <v-btn
              block
              color="warning"
              size="x-large"
              @click="vote('WSTRZYMAŁ SIĘ')"
              :disabled="!!currentVote"
            >
              Wstrzymaj się
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'VotingPanel',
  props: {
    deputyName: {
      type: String,
      required: true
    },
    voteId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      currentVote: '',
      highContrast: false
    }
  },
  methods: {
    vote(choice) {
      this.currentVote = choice
      this.$emit('vote-cast', choice)
    },
    toggleContrast() {
      this.highContrast = !this.highContrast
      // Tutaj możemy dodać logikę zmiany kontrastu
    }
  }
}
</script>

<style scoped>
.voting-panel {
  max-width: 800px;
  margin: 0 auto;
}

.voting-card {
  width: 100%;
  background: #f5f5f5;
}

.vote-result-display {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.vote-for {
  background: #4CAF50 !important;
  color: white;
}

.vote-against {
  background: #F44336 !important;
  color: white;
}

.vote-abstain {
  background: #FFC107 !important;
  color: white;
}

.button-panel {
  background: #eee;
  border-top: 1px solid #ddd;
}

/* Dodatkowe style dla wysokiego kontrastu */
.high-contrast {
  /* Tu dodamy style dla trybu wysokiego kontrastu */
}
</style> 