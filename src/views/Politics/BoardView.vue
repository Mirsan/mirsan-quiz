<template>
  <div>
    <VotingTopic />
    <VotingResult
      :voting-number="1"
      :votes-for="0"
      :votes-against="0"
      :votes-abstain="0"
    />
  </div>
</template>

<script>
import VotingTopic from '@/components/Politics/VotingTopic.vue'
import VotingResult from '@/components/Politics/VotingResult.vue'

export default {
  name: 'BoardView',
  components: {
    VotingTopic,
    VotingResult
  }
}
</script> 