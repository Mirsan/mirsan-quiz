<template>
  <div class="politician-panel-view">
    <VotingPanel
      :deputy-name="deputyName"
      :vote-id="voteId"
      @vote-cast="handleVote"
    />
  </div>
</template>

<script>
import VotingPanel from '@/components/Politics/VotingPanel.vue'

export default {
  name: 'PoliticianPanelView',
  components: {
    VotingPanel
  },
  data() {
    return {
      deputyName: 'Andrzej Szejnfeld',
      voteId: 4
    }
  },
  methods: {
    handleVote(choice) {
      console.log(`Poseł ${this.deputyName} zagłosował: ${choice}`)
      // Tu dodamy logikę zapisywania głosu
    }
  }
}
</script>

<style scoped>
.politician-panel-view {
  min-height: 100vh;
  background: #f0f0f0;
  padding: 20px;
}
</style> 