<template>
  <div class="home">
    <div class="logo-container">
      <img :src="require('@/assets/images/logo.jpg')" alt="Logo" class="background-logo">
      <div class="menu-container">
        <v-btn
          color="primary"
          size="x-large"
          to="/start-family"
          class="menu-button"
          elevation="4"
        >
          Familiada
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.logo-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.background-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.menu-container {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 0 20px;
}

.menu-button {
  min-width: 200px;
  font-family: 'PixelFont', sans-serif;
  font-size: 1.5rem;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(5px);
  border: 2px solid white;
  transition: transform 0.2s ease-in-out;
}

.menu-button:hover {
  transform: scale(1.05);
}
</style>
