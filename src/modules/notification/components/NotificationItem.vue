<template>
    <div
        class="notif-card"
        :class="{ 'notif-read': notification.read }"
        @click="emit('click', notification)"
    >
        <!-- 우측 상단 액션 -->
        <div class="notif-actions">
        <!-- 읽음 -->
        <button
            v-if="!notification.read"
            class="action-dot read-dot"
            title="읽음 처리"
            @click.stop="onRead"
        />

        <!-- 삭제 -->
        <button
            class="action-dot delete-dot"
            title="삭제"
            @click.stop="onDelete"
        />
        </div>

        <div class="notif-message">{{ notification.message }}</div>
        <div class="notif-time">{{ formattedTime }}</div>
    </div>
</template>


<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNotificationStore } from '../store/notificationStore';

dayjs.extend(relativeTime);

const store = useNotificationStore();

const props = defineProps({
    notification: { type: Object, required: true }
});

const emit = defineEmits(['refresh']);

const formattedTime = computed(() =>
    dayjs(props.notification.createdAt).fromNow()
);

const onRead = (e) => {
    e.stopPropagation()
    store.readNotificationOptimistic(props.notification.id)
}

const onDelete = (e) => {
    e.stopPropagation()
    store.deleteNotificationOptimistic(props.notification.id)
}
</script>


<style scoped>
.notif-card {
    position: relative;
    border-radius: 16px;
    padding: 16px;
    padding-right: 64px; /* 버튼 영역 확보 */
    margin-bottom: 12px;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}

.notif-card:hover {
    background-color: #f7f7f7;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.notif-read {
    background-color: #f0f0f0;
}

/* ===== 우측 상단 버튼 ===== */
.notif-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
}

/* 공통 동그라미 */
.action-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

/* hover 시 버튼도 반응 */
.action-dot:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
}

/* 읽음 (파랑/초록 중 선택) */
.read-dot {
    background-color: #34c759;
    /* background-color: #007aff; */
}

/* 삭제 */
.delete-dot {
    background-color: #ff3b30;
}

/* 텍스트 */
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
