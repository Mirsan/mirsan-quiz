<template>
    <v-chip :color="playerColor" variant="flat" class="d-flex justify-center text-h4 py-4 mt-2" style="font-family: 'PixelFont'; width: 90%; background-size: 10px 10px;">
        {{ teamName.toUpperCase() }}
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
        teamName: {
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