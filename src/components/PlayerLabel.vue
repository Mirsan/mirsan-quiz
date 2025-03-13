<template>
    <v-chip :color="playerColor" variant="flat" class="d-flex justify-center" style="width: 100%; font-size: 1.5em; margin-top: 0.25em;">
        {{ playerName.toUpperCase() }}
    </v-chip>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'PlayerLabel',
    props: {
        playerNumber: {
            type: String,
            required: true,
            validator: (value) => ['1', '2'].includes(value)
        },
        playerName: {
            type: String,
            required: true
        }
    },
    computed: {
        playerColor() {
            return this.playerNumber === '1' ? 'blue' : 'red'
        }
    }
})
</script> 