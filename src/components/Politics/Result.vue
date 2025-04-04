<template>
  <v-card
    class="mx-auto my-4 voting-card"
    max-width="800"
    elevation="8"
  >
    <v-card-title class="text-h4 text-center pa-4 voting-title">
      GŁOSOWANIE NR {{ votingNumber }}
    </v-card-title>

    <v-card-text class="voting-results">
      <v-row class="text-h5 mb-2">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <span class="voting-label">GŁOSOWAŁO</span>
            <span class="voting-value">{{ totalVotes }}</span>
          </div>
        </v-col>
      </v-row>

      <v-row class="text-h5 mb-2">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <span class="voting-label">ZA</span>
            <span class="voting-value">{{ votesFor }}</span>
          </div>
          <v-progress-linear
            v-model="forPercentage"
            color="success"
            height="10"
            rounded
            class="mt-2"
          ></v-progress-linear>
        </v-col>
      </v-row>

      <v-row class="text-h5 mb-2">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <span class="voting-label">PRZECIW</span>
            <span class="voting-value">{{ votesAgainst }}</span>
          </div>
          <v-progress-linear
            v-model="againstPercentage"
            color="error"
            height="10"
            rounded
            class="mt-2"
          ></v-progress-linear>
        </v-col>
      </v-row>

      <v-row class="text-h5">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <span class="voting-label">WSTRZYMAŁO SIĘ</span>
            <span class="voting-value">{{ votesAbstain }}</span>
          </div>
          <v-progress-linear
            v-model="abstainPercentage"
            color="warning"
            height="10"
            rounded
            class="mt-2"
          ></v-progress-linear>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'Result',
  props: {
    votingNumber: {
      type: Number,
      required: true
    },
    votesFor: {
      type: Number,
      required: true
    },
    votesAgainst: {
      type: Number,
      required: true
    },
    votesAbstain: {
      type: Number,
      required: true
    }
  },
  computed: {
    totalVotes() {
      return this.votesFor + this.votesAgainst + this.votesAbstain;
    },
    forPercentage() {
      return (this.votesFor / this.totalVotes) * 100;
    },
    againstPercentage() {
      return (this.votesAgainst / this.totalVotes) * 100;
    },
    abstainPercentage() {
      return (this.votesAbstain / this.totalVotes) * 100;
    }
  }
}
</script>

<style scoped>
.voting-card {
  background-color: #f5f5f5;
  border: 2px solid #333;
}

.voting-title {
  background-color: #1976d2;
  color: white;
  font-weight: bold;
  letter-spacing: 2px;
}

.voting-results {
  padding: 20px;
}

.voting-label {
  font-weight: 500;
  color: #333;
}

.voting-value {
  font-weight: bold;
  font-size: 1.5em;
}

/* Animacja dla wartości */
.voting-value {
  transition: all 0.3s ease;
}

/* Hover efekt na karcie */
.voting-card:hover {
  transform: scale(1.01);
  transition: transform 0.2s ease;
}
</style>
