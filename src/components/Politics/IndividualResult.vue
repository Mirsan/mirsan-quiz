<template>
  <v-card class="mx-auto my-4 voting-card" max-width="800" elevation="8">
    <v-card-title class="text-h4 text-center pa-4 voting-title">
      WYNIKI INDYWIDUALNE GŁOSOWANIA
    </v-card-title>

    <v-card-text class="voting-results">
      <div class="table-container">
        <v-table>
          <thead>
            <tr>
              <th class="text-center" style="width: 80px">Lp.</th>
              <th class="text-center">Poseł</th>
              <th class="text-center">Głosowanie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(deputy, index) in sortedDeputies" :key="deputy.name">
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ formatName(deputy.name) }}</td>
              <td class="text-center">
                <v-chip
                  :color="getVoteColor(deputy.vote)"
                  :text="getVoteText(deputy.vote)"
                  class="font-weight-bold text-center"
                  variant="elevated"
                ></v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'IndividualResult',
  props: {
    votes: {
      type: Object,
      required: true
    }
  },
  computed: {
    sortedDeputies() {
      return Object.entries(this.votes)
        .map(([name, vote]) => ({
          name,
          vote: vote.option
        }))
        .sort((a, b) => {
          const nameA = this.formatName(a.name).toLowerCase()
          const nameB = this.formatName(b.name).toLowerCase()
          return nameA.localeCompare(nameB)
        })
    }
  },
  methods: {
    formatName(name) {
      const parts = name.split(' ')
      if (parts.length === 1) return name
      const lastName = parts[parts.length - 1]
      const rest = parts.slice(0, -1).join(' ')
      return `${lastName} ${rest}`
    },
    getVoteColor(vote) {
      switch (vote) {
        case 'ZA':
          return 'success'
        case 'PRZECIW':
          return 'error'
        case 'WSTRZYMANO SIĘ':
          return 'warning'
        default:
          return 'grey'
      }
    },
    getVoteText(vote) {
      return vote || 'Nie głosowano'
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

.table-container {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.v-table) {
  background-color: transparent !important;
}

:deep(.v-table th) {
  background-color: #1976d2 !important;
  color: white !important;
  font-weight: bold !important;
  font-size: 1.1em !important;
  text-align: center !important;
}

:deep(.v-table td) {
  font-size: 1.1em !important;
  text-align: center !important;
}

:deep(.v-chip) {
  min-width: 120px;
  justify-content: center;
  margin: 0 auto;
}
</style> 