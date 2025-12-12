<template>
    <transition-group name="toast" tag="div" class="toast-container">
        <div
            v-for="t in notificationStore.toastList"
            :key="t.id"
            class="toast-wrapper"
            @click="handleClick(t.notification)"
        >
            <NotificationItem :notification="t.notification" />
        </div>
    </transition-group>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../store/notificationStore'
import NotificationItem from './NotificationItem.vue'

const notificationStore = useNotificationStore()
const router = useRouter()

const handleClick = async (notification) => {
    if (!notification.read) {
        notification.read = true
        await notificationStore.handleNotificationClick(notification, router)
    }
}
</script>

<style scoped>
.toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    z-index: 9999;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}
.toast-enter-from {
    opacity: 0;
    transform: translateY(20px);
}
.toast-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
.toast-wrapper {
    margin-bottom: 8px;
}
</style>
