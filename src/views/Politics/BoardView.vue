<template>
  <div>
    <VotingTopic />
    <VotingResult
      :voting-number="1"
      :votes-for="0"
      :votes-against="0"
      :votes-abstain="0"
    />
    <StatusPanel @stage-changed="handleStageChange" />
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
  methods: {
    handleStageChange(newStage) {
      console.log('Zmieniono etap na:', newStage)
      // Tu możemy dodać logikę reagującą na zmianę etapu
    }
  }
}
</script> 