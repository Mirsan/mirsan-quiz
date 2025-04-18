<template>
  <v-container fluid class="fill-height pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="elevation-8">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Ustawienia tematów</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text class="pa-4">
            <draggable
              v-model="topicsList"
              class="topics-container mb-4"
              handle=".handle"
              :animation="200"
              item-key="id"
              @end="handleReorder"
            >
              <template #item="{element, index}">
                <v-list-item class="topic-row">
                  <template v-slot:prepend>
                    <v-icon 
                      icon="mdi-drag" 
                      class="handle-icon handle mr-2"
                    ></v-icon>
                    <div class="topic-number">{{ index + 1 }}.</div>
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

            <div v-if="!topicsList.length" class="text-center my-4">
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

    const topicsList = computed({
      get: () => topicsRef.value || [],
      set: (newValue) => {
        saveTopics([...newValue])
      }
    })

    const handleReorder = () => {
      console.log('Topics reordered:', topicsList.value)
    }

    const updateTopicText = async (index, value) => {
      console.log('Updating topic text at index:', index, 'to:', value)
      const currentTopics = [...topicsList.value]
      currentTopics[index] = value
      await saveTopics(currentTopics)
    }

    const deleteTopic = async (index) => {
      console.log('Deleting topic at index:', index)
      try {
        const currentTopics = [...topicsList.value]
        const newTopics = currentTopics.filter((_, i) => i !== index)
        await saveTopics(newTopics)
      } catch (error) {
        console.error('Error deleting topic:', error)
      }
    }

    const addNewTopic = async () => {
      console.log('Adding new topic')
      try {
        const currentTopics = [...topicsList.value]
        const newTopics = [...currentTopics, 'Nowy temat']
        await saveTopics(newTopics)
      } catch (error) {
        console.error('Error adding new topic:', error)
      }
    }

    const goBack = () => {
      router.push('/politics')
    }

    onMounted(async () => {
      console.log('Component mounted')
      try {
        setupTopicsListener()
        await loadTopics()
      } catch (error) {
        console.error('Error in setup:', error)
      }
    })

    return {
      topicsList,
      handleReorder,
      updateTopicText,
      deleteTopic,
      addNewTopic,
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

.handle-icon {
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: move;
}

.topic-row:hover .handle-icon {
  opacity: 1;
}
</style> 