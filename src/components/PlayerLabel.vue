<template>
    <div :class="['player-label', { active: isActive }]" :data-player="playerNumber">
        {{ teamName.toUpperCase() }}
    </div>
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
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        playerColor() {
            return this.playerNumber === '1' ? 'blue' : 'red'
        }
    }
})
</script>

<style>
.player-label {
    position: relative;
    padding: 10px;
    margin-top: 10px;
    text-align: center;
    color: white;
    font-family: 'PixelFont';
    font-size: 1.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    width: 90%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.player-label[data-player="1"] {
    background-color: rgba(0, 0, 255, 0.3);
}

.player-label[data-player="2"] {
    background-color: rgba(255, 0, 0, 0.3);
}

.player-label.active {
    animation: pulse 3s infinite;
}

.player-label.active[data-player="1"] {
    background-color: rgba(0, 0, 255, 0.5);
    box-shadow: 0 0 30px #0000ff;
}

.player-label.active[data-player="2"] {
    background-color: rgba(255, 0, 0, 0.5);
    box-shadow: 0 0 30px #ff0000;
}

.player-label.active::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 3px solid;
    border-radius: 12px;
    animation: borderPulse 3s infinite;
}

.player-label.active[data-player="1"]::before {
    border-color: #0000ff;
}

.player-label.active[data-player="2"]::before {
    border-color: #ff0000;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        text-shadow: 0 0 20px rgba(255,255,255,0.8);
    }
    50% {
        transform: scale(1.15);
        text-shadow: 0 0 30px rgba(255,255,255,1);
    }
    100% {
        transform: scale(1);
        text-shadow: 0 0 20px rgba(255,255,255,0.8);
    }
}

@keyframes borderPulse {
    0% {
        box-shadow: 0 0 20px rgba(255,255,255,0.5);
    }
    50% {
        box-shadow: 0 0 40px rgba(255,255,255,0.8);
    }
    100% {
        box-shadow: 0 0 20px rgba(255,255,255,0.5);
    }
}
</style> 