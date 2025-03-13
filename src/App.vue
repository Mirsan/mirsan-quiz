<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    //
  }),
}
</script>

<style>
html {
  overflow-y: hidden !important;
}

.v-application {
  overflow: hidden !important;
}

.v-main {
  overflow: hidden !important;
}
</style>
