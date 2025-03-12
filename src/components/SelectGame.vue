<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.jpg')"
          class="my-3"
          contain
          height="500"
        />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Mirsan Games
        </h1>

        <p class="subheading font-weight-regular">
          Welcome in my games
          <br><br>
          <v-btn>Mirsaliadada</v-btn>
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'SelectGame',

  data: () => ({

  })
}
</script>
