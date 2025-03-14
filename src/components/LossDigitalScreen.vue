<template>
    <v-card-text :style="{
        color: 'yellow',
        fontSize: '8em',
        fontFamily: 'DigitalFont',
        opacity: 0.85,
        marginTop: '3rem',
        display: 'inline-block',
        transformOrigin: 'top',
        transform: `scaleY(${scaleYPropert})`,
        lineHeight: '0.9'
    }">
        <template v-for="index in myLoss" :key="`my-${index}`">
            X
        </template>
    </v-card-text>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'LossDigitalScreen',
    props: {
        myLoss: {
            type: Number,
            required: true,
            validator: (value) => value >= 0 && value <= 3
        },
        oponentLoss: {
            type: Number,
            default: 0,
            validator: (value) => value >= 0 && value <= 3
        }
    },
    computed: {
        LostTakeover() {
            return this.oponentLoss === 3 && this.myLoss === 1;
        },
        scaleYPropert() {
            if(!this.LostTakeover) return 1.5 
            else return 3.5;
        }
    }
})
</script> 