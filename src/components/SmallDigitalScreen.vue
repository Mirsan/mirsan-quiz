<template>
  <div class="screen-container" :class="{ 'animate-border': activeColor }" :data-color="activeColor">
    <div class="inner-container">
      <v-chip 
        density="compact" 
        class="text-h1 py-16 d-flex justify-center digital-screen" 
        style="background-color: #000; color: yellow; font-family: 'PixelFont'; background-image: radial-gradient(#110 3px, transparent 1px); background-size: 10px 10px; border-radius: 50px;"
      >
        {{ displayValue }}
      </v-chip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmallDigitalScreen',
  props: {
    value: {
      type: [Number, String],
      required: true,
      default: 0
    },
    activeColor: {
      type: String,
      default: null,
      validator: (value) => ['blue', 'red', null].includes(value)
    }
  },
  computed: {
    displayValue() {
      return Number(this.value) > 999 ? 999 : this.value
    }
  }
}
</script>

<style scoped>
.screen-container {
  position: relative;
  width: 280px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 60px;
  overflow: hidden;
  background: #000;
}

.inner-container {
  position: relative;
  z-index: 2;
  width: 250px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 40px;
}

.screen-container.animate-border::before {
  content: "";
  position: absolute;
  width: 500px;
  height: 500px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: rotate 3s infinite linear;
}

.screen-container[data-color="blue"]::before {
  background-image: conic-gradient(
    #0000ff 20deg,
    transparent 120deg
  );
}

.screen-container[data-color="red"]::before {
  background-image: conic-gradient(
    #ff0000 20deg,
    transparent 120deg
  );
}

@keyframes rotate {
  100% {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}

.digital-screen {
  width: 100%;
  height: 100%;
  background-color: #000;
  border-radius: 40px;
}
</style> 