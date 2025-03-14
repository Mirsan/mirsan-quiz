<template>
  <v-card class="pa-2" outlined style="height: 100%; width: 100%;" color="transparent">
    <v-card-text style="color: yellow; font-size: 3em; font-family: 'PixelFont'; height: 100%;">
      <div class="results-container">
        <!-- Pytanie -->
        <v-row no-gutters class="result-row flex-nowrap">
          <v-col cols="12" class="text-center question-row marquee-wrapper">
            <div class="question-container">
              <div ref="questionText" :class="{'scrolling-text': shouldScroll}" class="question-text" style="font-size: smaller;">
                <span class="duplicate-text">{{ question }}</span>
                <span v-if="shouldScroll" class="duplicate-text">{{ question }}</span>
                <span v-if="shouldScroll" class="duplicate-text">{{ question }}</span>
                <span v-if="shouldScroll" class="duplicate-text">{{ question }}</span>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Wyniki -->
        <template v-for="result in results" :key="result.id">
          <v-row no-gutters class="result-row flex-nowrap">
            <v-col cols="2" class="flex-grow-0 text-center">
              {{ result.id }}
            </v-col>
            <v-col cols="8" class="d-flex justify-center">
              <div class="text-left" style="width: 100%;">
                <template v-if="result.pass">
                  <template v-if="result.name.length > 18">
                    {{ result.name.substring(0, 18) + '.' }}
                  </template>
                  <template v-else>
                    {{ result.name }}
                  </template>
                </template>
                <template v-else>
                  ................................................
                </template>
              </div>
            </v-col>
            <v-col cols="2" class="text-center">
              <template v-if="result.pass">
                {{ result.points }}
              </template>
              <template v-else>
                --
              </template>
            </v-col>
          </v-row>
        </template>

        <v-row no-gutters class="result-row flex-nowrap">
          <v-col cols="12">&nbsp;</v-col>
        </v-row>

        <v-row no-gutters class="result-row flex-nowrap">
          <v-col cols="6"></v-col>
          <v-col cols="4" class="text-right">SUMA:</v-col>
          <v-col cols="2" class="text-center">{{ results.filter(item => item.pass).reduce((acc, item) => acc + item.points, 0) }}</v-col>
        </v-row>

        <template v-for="index in (6 - results.length)" :key="'empty-'+index">
          <v-row no-gutters class="result-row flex-nowrap">
            <v-col cols="12">&nbsp;</v-col>
          </v-row>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'FamilyResultDigitalScreen',
  data() {
    return {
      shouldScroll: false
    }
  },
  props: {
    results: {
      type: Array,
      required: true,
      default: () => []
    },
    question: {
      type: String,
      required: true
    }
  },
  mounted() {
    window.addEventListener('resize', this.checkOverflow)
    this.$nextTick(() => {
      this.checkOverflow()
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkOverflow)
  },
  watch: {
    question: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.checkOverflow()
        })
      }
    }
  },
  methods: {
    checkOverflow() {
      const element = this.$refs.questionText
      const container = element?.parentElement
      if (element && container) {
        const textWidth = element.getBoundingClientRect().width
        const containerWidth = container.getBoundingClientRect().width
        console.log('textWidth:', textWidth)
        console.log('containerWidth:', containerWidth)
        this.shouldScroll = textWidth > containerWidth
        console.log('shouldScroll:', this.shouldScroll)
      }
    }
  }
}
</script>

<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(12 * 1em);
  gap: 0;
}

.result-row {
  min-height: 1em;
  flex: 1;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.v-col {
  padding: 0 4px;
}

.question-row {
  padding-bottom: 0.1em;
  margin-bottom: 0.1em;
}

.marquee-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.question-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.question-text {
  display: inline-flex;
  white-space: nowrap;
  position: relative;
}

.duplicate-text {
  padding: 0 25px;
}

.scrolling-text {
  animation: scroll-text 60s linear infinite;
}

@keyframes scroll-text {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style> 