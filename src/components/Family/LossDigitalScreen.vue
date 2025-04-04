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
        <span v-for="index in myLoss" :key="`my-${index}`" class="loss-x" :class="{'swipe-down': isNewLoss(index)}">
            X
        </span>
    </v-card-text>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'LossDigitalScreen',
    data() {
        return {
            previousLoss: 0,
            animatedLosses: [],
            animationTimeout: null
        }
    },
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
    mounted() {
        this.previousLoss = this.myLoss;
    },
    beforeUnmount() {
        clearTimeout(this.animationTimeout);
    },
    watch: {
        myLoss(newValue, oldValue) {
            if (newValue > oldValue) {
                // Nowe X-y zostały dodane
                for (let i = oldValue + 1; i <= newValue; i++) {
                    this.animatedLosses.push(i);
                }
                
                // Usuwamy animację po jej zakończeniu
                clearTimeout(this.animationTimeout);
                this.animationTimeout = setTimeout(() => {
                    this.animatedLosses = [];
                }, 600); // 0,6 sekund (czas trwania animacji)
            }
            
            this.previousLoss = newValue;
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
    },
    methods: {
        isNewLoss(index) {
            return this.animatedLosses.includes(index);
        }
    }
})
</script>

<style scoped>
.loss-x {
    position: relative;
    display: inline-block;
    overflow: hidden;
}

.swipe-down {
    animation: swipe-down 0.8s ease-out forwards;
}

@keyframes swipe-down {
    0% {
        clip-path: inset(0 0 100% 0);
    }
    100% {
        clip-path: inset(0 0 0 0);
    }
}
</style> 