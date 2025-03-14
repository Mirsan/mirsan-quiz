<template>
    <v-card-text style="color: yellow; font-size: 8em; font-family: 'DigitalFont'; opacity: 0.85; 
       margin-top: 3rem; padding-left: 3rem; padding-right: 3rem;
       display: inline-block; transform-origin: top; transform: scaleY(1.5); line-height: 0.9;">
        <template v-for="index in loss" :key="index">
            X
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