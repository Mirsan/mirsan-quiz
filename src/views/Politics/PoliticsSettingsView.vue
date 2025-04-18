<template>
  <v-container fluid class="fill-height pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="elevation-8">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Ustawienia tematów</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text class="pa-4">
            <v-list v-if="topics" class="topics-container mb-4">
              <draggable
                v-model="topics"
                item-key="index"
                @end="handleDragEnd"
                handle=".drag-handle"
              >
                <template #item="{ element, index }">
                  <v-list-item
                    class="topic-row"
                  >
                    <template v-slot:prepend>
                      <div class="topic-number">{{ index + 1 }}.</div>
                      <v-icon
                        class="drag-handle"
                        icon="mdi-drag"
                        color="grey"
                      ></v-icon>
                    </template>
                    
                    <v-text-field
                      :model-value="element"
                      @update:model-value="(value) => updateTopicText(index, value)"
                      hide-details
                      density="compact"
                      variant="outlined"
                      class="topic-input mx-2"
                      placeholder="Wpisz temat..."
                    ></v-text-field>

                    <template v-slot:append>
                      <v-btn
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        density="compact"
                        @click="deleteTopic(index)"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </template>
              </draggable>
            </v-list>

            <div v-if="!topics?.length" class="text-center my-4">
              <v-alert type="info" variant="tonal">
                Lista tematów jest pusta. Dodaj nowy temat.
              </v-alert>
            </div>

            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              class="mb-4"
              block
              @click="addNewTopic"
            >
              Dodaj nowy temat
            </v-btn>

            <v-btn
              color="secondary"
              prepend-icon="mdi-arrow-left"
              block
              @click="goBack"
            >
              Powrót do menu
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTopics } from '@/firebase/topics'
import draggable from 'vuedraggable'

export default {
  name: 'PoliticsSettingsView',
  components: {
    draggable
  },
  setup() {
    const router = useRouter()
    const { topics: topicsRef, loadTopics, saveTopics, setupTopicsListener } = useTopics()

    const topics = computed({
      get: () => topicsRef.value || [],
      set: (newValue) => {
        topicsRef.value = newValue
      }
    })

    const updateTopicText = async (index, value) => {
      const currentTopics = [...topics.value]
      currentTopics[index] = value
      await saveTopics(currentTopics)
    }

    const deleteTopic = async (index) => {
      try {
        const currentTopics = [...topics.value]
        const newTopics = currentTopics.filter((_, i) => i !== index)
        await saveTopics(newTopics)
      } catch (error) {
        console.error('Error deleting topic:', error)
      }
    }

    const addNewTopic = async () => {
      try {
        const currentTopics = [...topics.value]
        const newTopics = [...currentTopics, 'Nowy temat']
        await saveTopics(newTopics)
      } catch (error) {
        console.error('Error adding new topic:', error)
      }
    }

    const handleDragEnd = async () => {
      try {
        await saveTopics(topics.value)
      } catch (error) {
        console.error('Error saving topics after drag:', error)
      }
    }

    const goBack = () => {
      router.push('/politics')
    }

    onMounted(async () => {
      try {
        setupTopicsListener()
        await loadTopics()
      } catch (error) {
        console.error('Error in setup:', error)
      }
    })

    return {
      topics,
      updateTopicText,
      deleteTopic,
      addNewTopic,
      handleDragEnd,
      goBack
    }
  }
}
</script>

<style scoped>
.topics-container {
  max-height: 60vh;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: white;
}

.topic-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  min-height: 64px;
  cursor: move;
}

.topic-row:last-child {
  border-bottom: none;
}

.topic-input {
  flex: 1;
}

.topic-number {
  min-width: 30px;
  text-align: right;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  margin: 0 8px;
}

.drag-handle {
  cursor: move;
  margin-right: 8px;
}
</style> 