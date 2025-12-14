<template>
    <v-card elevation="2" class="notif-dropdown" rounded="xl">
        <div class="top-filter-row">
            <v-text-field
                v-model="searchKeyword"
                placeholder="메시지 검색"
                density="compact"
                variant="solo"
                flat
                hide-details
                class="ios-search"
            />

            <!-- top-filter-row 내부 -->
            <div class="read-toggle-group">
                <div
                class="read-icon"
                :class="{ active: readFilter === 'UNREAD' }"
                title="읽지 않은 메시지만 보기"
                @click="toggleUnreadFilter"
                >
                ●
                </div>

                <!-- 전체 읽기 -->
                <div
                    class="read-icon read-all"
                    title="전체 읽기"
                    @click="handleReadAll"
                >
                    ✔
                </div>

                <!-- 전체 삭제 -->
                <div
                    class="read-icon delete-all"
                    title="전체 삭제"
                    @click="handleDeleteAll"
                >
                    ✖
                </div>
            </div>
        </div>

        <div class="type-filter-wrapper">
            <button
                class="nav-btn left"
                v-show="canScrollLeft"
                @click="scrollLeft"
                type="button"
            >
                <span class="arrow-icon">‹</span>
            </button>
            <div
                class="type-filter-scroll"
                ref="pillScrollRef"
                @scroll="onPillScroll"
            >
                <div class="pill-container" ref="pillContainerRef">
                    <div
                        v-for="type in targetTypes"
                        :key="type.key ?? 'all'"
                        class="pill"
                        :class="{ active: typeFilter === type.key }"
                        @click="selectPill(type.key)"
                    >
                        {{ type.label }}
                    </div>
                </div>
            </div>
            <button
                class="nav-btn right"
                v-show="canScrollRight"
                @click="scrollRight"
                type="button"
            >
                <span class="arrow-icon">›</span>
            </button>
        </div>

        <!-- 알림 리스트 -->
        <div class="notif-list">
            <NotificationItem
                v-for="notif in filteredNotifications"
                :key="notif.id"
                :notification="notif"
                @click="handleClick(notif)"
            />
            <div v-if="filteredNotifications.length === 0" class="empty-hint">
                알림이 없습니다.
            </div>
        </div>

        <v-divider />

        <v-card-actions>
            <v-btn text block @click="goToAllNotifications">
                알림 목록
            </v-btn>
        </v-card-actions>
    </v-card>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/modules/notification/store/notificationStore'
import { readAllNotifications, deleteAllNotifications } from '@/apis/notification'
import NotificationItem from './NotificationItem.vue'

const router = useRouter()
const notificationStore = useNotificationStore()

const searchKeyword = ref('')
const readFilter = ref(null)
const typeFilter = ref(null)

const targetTypes = [
    { key: null, label: '전체' },
    { key: 'PROJECT', label: '프로젝트' },
    { key: 'PROPOSAL', label: '제안' },
    { key: 'ESTIMATE', label: '견적' },
    { key: 'CONTRACT', label: '계약' },
    { key: 'REVENUE', label: '매출' },
    { key: 'FILE', label: '파일' },
    { key: 'POTENTIAL_CLIENT', label: '잠재고객' },
]

// 안읽음
const toggleUnreadFilter = () => {
    readFilter.value = readFilter.value === 'UNREAD' ? null : 'UNREAD'
}

// 전체 읽기
const handleReadAll = async () => {
    try {
        await readAllNotifications()
        notificationStore.notifications = notificationStore.notifications.map(n => ({
        ...n,
        read: true
        }))
        readFilter.value = null
    } catch (err) {
        console.error('전체 읽기 실패', err)
    }
}

// 전체 삭제
const handleDeleteAll = async () => {
    try {
        await deleteAllNotifications()
        // 프론트에서 알림 배열 비우기
        notificationStore.notifications = []
    } catch (err) {
        console.error('전체 삭제 실패', err)
    }
}

// refs for scrolling pills
const pillScrollRef = ref(null)       // scroll container
const pillContainerRef = ref(null)    // inner pill container

const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const updateScrollButtons = () => {
    const el = pillScrollRef.value
    if (!el) {
        canScrollLeft.value = false
        canScrollRight.value = false
        return
    }
    const maxScrollLeft = el.scrollWidth - el.clientWidth
    canScrollLeft.value = el.scrollLeft > 1
    canScrollRight.value = maxScrollLeft - el.scrollLeft > 1
}

let rafId = null
const onPillScroll = () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
        updateScrollButtons()
        rafId = null
    })
}

const SCROLL_RATIO = 0.7
const scrollLeft = () => {
    const el = pillScrollRef.value
    if (!el) return
    const step = Math.round(el.clientWidth * SCROLL_RATIO)
    el.scrollBy({ left: -step, behavior: 'smooth' })
    setTimeout(updateScrollButtons, 220)
}
const scrollRight = () => {
    const el = pillScrollRef.value
    if (!el) return
    const step = Math.round(el.clientWidth * SCROLL_RATIO)
    el.scrollBy({ left: step, behavior: 'smooth' })
    setTimeout(updateScrollButtons, 220)
}

const selectPill = async (key) => {
    typeFilter.value = key
    await nextTick()
    // center selected pill
    const container = pillScrollRef.value
    const list = pillContainerRef.value
    if (!container || !list) return
    const targetLabel = targetTypes.find(t => t.key === key)?.label ?? '전체'
    const children = Array.from(list.children)
    const targetEl = children.find(c => c.innerText.trim() === targetLabel)
    if (!targetEl) return
    const scrollTo =
        targetEl.offsetLeft - container.clientWidth / 2 + targetEl.clientWidth / 2
    container.scrollTo({ left: scrollTo, behavior: 'smooth' })
    setTimeout(updateScrollButtons, 260)
}

const filteredNotifications = computed(() => {
    let list = notificationStore.notifications ? [...notificationStore.notifications] : []

    if (searchKeyword.value) {
        const k = searchKeyword.value.toLowerCase()
        list = list.filter(n => n.message?.toLowerCase().includes(k))
    }

    if (readFilter.value === 'UNREAD') list = list.filter(n => !n.read)
    else if (readFilter.value === 'READ') list = list.filter(n => n.read)

    if (typeFilter.value) list = list.filter(n => n.targetType === typeFilter.value)

    return list
})

const goToAllNotifications = () => {
  // 구현 예정: 전체 알림 페이지로 이동
}

const handleClick = async (notification) => {
    await notificationStore.handleNotificationClick(notification, router)
}

// observe resize/content change
let resizeObserver = null
const onResizeOrMutate = () => {
    nextTick(() => updateScrollButtons())
}

onMounted(() => {
    nextTick(() => updateScrollButtons())

    window.addEventListener('resize', onResizeOrMutate)

    if (window.ResizeObserver && pillScrollRef.value) {
        resizeObserver = new ResizeObserver(() => onResizeOrMutate())
        resizeObserver.observe(pillScrollRef.value)
        // also observe pillContainer (children count/size changes)
        if (pillContainerRef.value) resizeObserver.observe(pillContainerRef.value)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResizeOrMutate)
    if (resizeObserver) {
        if (pillScrollRef.value) resizeObserver.unobserve(pillScrollRef.value)
        if (pillContainerRef.value) resizeObserver.unobserve(pillContainerRef.value)
        resizeObserver.disconnect()
    }
    if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* container */
.notif-dropdown {
    border-radius: 16px;
    overflow: hidden;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    max-height: 600px;
    min-width: 320px;
    padding: 10px;
}

/* 🔍 검색 + 읽음 토글 한 줄 */
.top-filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* iOS search bar */
.ios-search {
    flex: 1;
    background: #ffffff !important;
    border-radius: 14px !important;
    padding: 4px 10px !important;
    box-shadow: inset 0 0 0 1px #e5e5ea;
    min-height: 38px;
}

/* 읽음/안읽음 작은 아이콘 그룹 */
.read-toggle-group {
    display: flex;
    align-items: center;
    gap: 6px;
}

/* 기존 read-icon 공통 스타일 유지 */
.read-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f2f2f7;
    border: 1px solid #e5e5ea;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: #3a3a3c;
    user-select: none;
    transition: all 0.18s ease;
}

.read-icon:hover {
    background: #ebebef;
}

/* 활성화 스타일 */
.read-icon.active {
    background: #007aff;
    border-color: #007aff;
    color: #fff;
    box-shadow: 0 3px 10px rgba(0, 122, 255, 0.28);
}

.read-icon.read-all {
    background-color: #d6f5e0;
    border: 1px solid #34c759;
    color: #34c759;
    transition: all 0.2s ease;
}

.read-icon.read-all:hover {
    background-color: #34c759;
    border-color: #34c759;
    color: #fff;
}

/* 전체 삭제 버튼 */
.read-icon.delete-all {
    background-color: #fef0f0;
    border: 1px solid #ff3b30;
    color: #ff3b30;
    transition: all 0.2s ease;
}

.read-icon.delete-all:hover {
    background-color: #ff3b30;
    border-color: #ff3b30;
    color: #fff;
}


/* ────────────────────────────── */
/* 타입 pill + 좌우 버튼 레이아웃 */
/* ────────────────────────────── */
.type-filter-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    margin-top: 8px;
}

/* pill scroll */
.type-filter-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 4px 0px;
}
.type-filter-scroll::-webkit-scrollbar { display: none; }

.pill-container {
    display: inline-flex;
    gap: 8px;
    white-space: nowrap;
    align-items: center;
}

.pill {
    padding: 6px 12px;
    border-radius: 999px;
    background: #f2f2f7;
    font-size: 13px;
    cursor: pointer;
    color: #222;
    transition: all 0.18s ease;
    user-select: none;
}
.pill.active {
    background: #007aff;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.18);
}

/* 좌우 네비 버튼 */
.nav-btn {
    position: absolute;
    z-index: 20;
    width: 28px;
    height: 28px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;
    background: #ffffff;
    border: 1px solid #eaeaec;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);

    cursor: pointer;
    padding: 0;
    transition: opacity 0.2s ease, transform 0.15s ease;
}

.nav-btn.left { left: -4px; }
.nav-btn.right { right: -4px; }

.nav-btn:hover {
    transform: scale(1.04);
}

.nav-btn .arrow-icon {
    font-size: 16px;
    line-height: 1;
    margin-top: -1px;
}

/* fade-out 효과 */
.nav-btn.hidden {
    opacity: 0;
    pointer-events: none;
}

/* 알림 리스트 */
.notif-list {
    overflow-y: auto;
    padding: 8px 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
}

.empty-hint {
    text-align: center;
    color: #999;
    padding: 24px 8px;
}
</style>

