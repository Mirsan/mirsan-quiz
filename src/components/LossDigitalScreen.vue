<template>
    <v-card-text style="color: yellow; font-size: 8em; font-family: 'DigitalFont'; text-align: center; opacity: 0.7;">
        <template v-for="index in loss" :key="index">
            X <br>
        </template>
    </v-card-text>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'LossDigitalScreen',
    props: {
        loss: {
            type: Number,
            required: true,
            validator: (value) => value >= 0 && value <= 3
        }
    }
})
</script> 