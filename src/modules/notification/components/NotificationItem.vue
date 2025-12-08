<template>
    <div class="notif-card" @click="$emit('click', notification)">
        <v-list-item-content>
        <div class="notif-message">{{ notification.message }}</div>
        <div class="notif-time">{{ formattedTime }}</div>
        </v-list-item-content>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const props = defineProps({
    notification: {
        type: Object,
        required: true
    }
})

const { notification } = props

const formattedTime = computed(() => dayjs(notification.createdAt).fromNow())
</script>

<style scoped>
.notif-card {
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    background-color: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.notif-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    background-color: #f7f7f7;
}

.notif-message {
    font-weight: 500;
    font-size: 15px;
    color: #1c1c1e;
    line-height: 1.5;
}

.notif-time {
    font-size: 13px;
    color: #8e8e93;
    margin-top: 4px;
}
</style>
