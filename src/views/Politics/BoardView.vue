<template>
  <div class="board-container">
    <div class="background-image"></div>
    <div class="content-wrapper" :style="{ opacity: contentOpacity }">
      <VotingTopic />
      <VotingResult
        :voting-number="1"
        :votes-for="0"
        :votes-against="0"
        :votes-abstain="0"
      />
      <StatusPanel @stage-changed="handleStageChange" />
    </div>
  </div>
</template>

<script>
import VotingTopic from '@/components/Politics/VotingTopic.vue'
import VotingResult from '@/components/Politics/VotingResult.vue'
import StatusPanel from '@/components/Politics/StatusPanel.vue'

export default {
  name: 'BoardView',
  components: {
    VotingTopic,
    VotingResult,
    StatusPanel
  },
  data() {
    return {
      contentOpacity: 0.9 // Możesz dostosować tę wartość (0.0 - 1.0)
    }
  },
  methods: {
    handleStageChange(newStage) {
      console.log('Zmieniono etap na:', newStage)
      // Tu możemy dodać logikę reagującą na zmianę etapu
    }
  }
}
</script>

<style scoped>
.board-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/sejm.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 20px;
  backdrop-filter: blur(3px);
}

/* Dodajemy przezroczystość do kart w komponentach */
:deep(.v-card) {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
}

:deep(.status-panel) {
  background-color: rgba(255, 255, 255, 0.95) !important;
}
</style> 