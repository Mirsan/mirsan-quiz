<template>
  <v-card
    class="mx-auto my-4 voting-card"
    max-width="800"
    elevation="8"
  >
    <v-card-text class="voting-results pa-4">
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
            <span class="voting-value">{{ currentVotesFor }}</span>
          </div>
          <v-progress-linear
            v-model="animatedForPercentage"
            color="success"
            height="40"
            rounded
            class="mt-1 progress-bar"
          >
            <template v-slot:default="{ value }">
              <span class="progress-text">{{ Math.ceil(value) }}%</span>
            </template>
          </v-progress-linear>
        </v-col>
      </v-row>

      <v-row class="text-h5 mb-2">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <span class="voting-label">PRZECIW</span>
            <span class="voting-value">{{ currentVotesAgainst }}</span>
          </div>
          <v-progress-linear
            v-model="animatedAgainstPercentage"
            color="error"
            height="40"
            rounded
            class="mt-1 progress-bar"
          >
            <template v-slot:default="{ value }">
              <span class="progress-text">{{ Math.ceil(value) }}%</span>
            </template>
          </v-progress-linear>
        </v-col>
      </v-row>

      <v-row class="text-h5">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <span class="voting-label">WSTRZYMANO SIĘ</span>
            <span class="voting-value">{{ currentVotesAbstain }}</span>
          </div>
          <v-progress-linear
            v-model="animatedAbstainPercentage"
            color="warning"
            height="40"
            rounded
            class="mt-1 progress-bar"
          >
            <template v-slot:default="{ value }">
              <span class="progress-text">{{ Math.ceil(value) }}%</span>
            </template>
          </v-progress-linear>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, watch, computed } from 'vue'

export default {
  name: 'VotingResult',
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
    },
    showCollective: {
      type: Boolean,
      default: false
    },
    collectiveVotes: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const animatedForPercentage = ref(0)
    const animatedAgainstPercentage = ref(0)
    const animatedAbstainPercentage = ref(0)
    const showCollectiveResults = ref(false)

    watch(() => props.showCollective, (newValue) => {
      if (newValue) {
        setTimeout(() => {
          showCollectiveResults.value = true;
        }, 500);
      } else {
        showCollectiveResults.value = false;
      }
    });

    const totalVotes = computed(() => {
      if (props.showCollective && props.collectiveVotes) {
        return Object.values(props.collectiveVotes).reduce((a, b) => a + b, 0);
      }
      return props.votesFor + props.votesAgainst + props.votesAbstain;
    });

    const currentVotesFor = computed(() => {
      if (props.showCollective && props.collectiveVotes) {
        return props.collectiveVotes.ZA || 0;
      }
      return props.votesFor;
    });

    const currentVotesAgainst = computed(() => {
      if (props.showCollective && props.collectiveVotes) {
        return props.collectiveVotes.PRZECIW || 0;
      }
      return props.votesAgainst;
    });

    const currentVotesAbstain = computed(() => {
      if (props.showCollective && props.collectiveVotes) {
        return props.collectiveVotes['WSTRZYMANO SIĘ'] || 0;
      }
      return props.votesAbstain;
    });

    const forPercentage = computed(() => {
      return totalVotes.value ? (currentVotesFor.value / totalVotes.value) * 100 : 0;
    });

    const againstPercentage = computed(() => {
      return totalVotes.value ? (currentVotesAgainst.value / totalVotes.value) * 100 : 0;
    });

    const abstainPercentage = computed(() => {
      return totalVotes.value ? (currentVotesAbstain.value / totalVotes.value) * 100 : 0;
    });

    // Animuj wartości gdy się zmieniają
    watch([() => props.votesFor, () => props.collectiveVotes], () => {
      animateValue(animatedForPercentage, forPercentage.value)
    }, { deep: true });

    watch([() => props.votesAgainst, () => props.collectiveVotes], () => {
      animateValue(animatedAgainstPercentage, againstPercentage.value)
    }, { deep: true });

    watch([() => props.votesAbstain, () => props.collectiveVotes], () => {
      animateValue(animatedAbstainPercentage, abstainPercentage.value)
    }, { deep: true });

    const animateValue = (ref, target) => {
      const duration = 1000;
      const start = ref.value;
      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
          ref.value = start + ((target - start) * elapsed / duration);
          requestAnimationFrame(animate);
        } else {
          ref.value = target;
        }
      };

      requestAnimationFrame(animate);
    };

    return {
      totalVotes,
      currentVotesFor,
      currentVotesAgainst,
      currentVotesAbstain,
      animatedForPercentage,
      animatedAgainstPercentage,
      animatedAbstainPercentage,
      showCollectiveResults
    };
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
  padding: 12px;
}

.voting-label {
  font-weight: 500;
  color: #333;
  font-size: 1.2em;
}

.voting-value {
  font-weight: bold;
  font-size: 1.3em;
}

.progress-text {
  color: white;
  font-weight: bold;
  font-size: 1.2em;
  line-height: 30px;
}

.voting-value {
  transition: all 0.3s ease;
}

.voting-card:hover {
  transform: scale(1.01);
  transition: transform 0.2s ease;
}

.progress-bar {
  border-radius: 15px;
}

:deep(.v-progress-linear__background) {
  opacity: 0.2 !important;
  border-radius: 15px !important;
}

:deep(.v-progress-linear__determinate) {
  transition: width 1s ease-in-out !important;
  border-radius: 15px !important;
}
</style> 