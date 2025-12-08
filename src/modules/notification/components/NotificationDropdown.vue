<template>
    <v-card
        elevation="2"   
        class="notif-dropdown pa-4"  
        rounded="xl"    
    >
        <div class="notif-list">
        <NotificationItem
            v-for="notif in filteredNotifications"
            :key="notif.id"
            :notification="notif"
            @click="$emit('click', notif)"
        />
        </div>

        <v-divider></v-divider>

        <v-card-actions>
        <v-btn text block @click="goToAllNotifications">
            목록으로
        </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/modules/notification/store/notificationStore'
import NotificationItem from './NotificationItem.vue'

const notificationStore = useNotificationStore()

const filteredNotifications = computed(() => notificationStore.filteredNotifications)

const goToAllNotifications = () => {
  // 나중에 클릭 핸들러 구현
}
</script>

<style scoped>
.notif-dropdown {
    border-radius: 16px;
    overflow: hidden;          
    background-color: #ffffff;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    max-height: 500px;
    min-width: 300px;
}

.notif-list {
    overflow-y: auto;          
    padding: 12px;             
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
}

.v-divider {
    margin: 0;
}

.v-card-actions {
    padding: 8px 12px;
    justify-content: center;
}
</style>
