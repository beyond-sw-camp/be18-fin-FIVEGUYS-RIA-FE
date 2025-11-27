<template>
    <v-container fluid class="pa-0 full-height main-container">
        <v-row no-gutters class="full-height">

            <!-- 좌측 사이드바 -->
            <v-col cols="12" md="2" class="pa-4 sidebar">
                <v-card class="sidebar-card pa-6" flat>
                    <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="검색" variant="outlined"
                        hide-details density="comfortable" class="mb-4" />

                    <!-- 즐겨찾기 버튼 -->
                    <div class="d-flex justify-end mt-2">
                        <v-btn small class="favorite-toggle-btn" @click="showFavoritesOnly = !showFavoritesOnly"
                            elevation="1">
                            <v-icon :color="showFavoritesOnly ? '#FFD60A' : '#8e8e93'">
                                {{ showFavoritesOnly ? 'mdi-star' : 'mdi-star-outline' }}
                            </v-icon>
                        </v-btn>
                    </div>

                    <!-- 상태 체크박스 그룹 -->
                    <div class="sidebar-checkbox-group mt-4">
                        진행 상태
                        <v-checkbox v-for="sidebar in sidebares" :key="sidebar.value" v-model="sidebar.checked"
                            :label="sidebar.label" hide-details dense class="sidebar-checkbox" />
                    </div>
                </v-card>
            </v-col>

            <!-- 메인 컨텐츠 -->
            <v-col cols="12" md="10" class="pa-6 main-content">
                <div class="d-flex justify-end mb-4">
                    <v-btn color="#ff9500" class="white--text" rounded elevation="4" @click="goToCreateProposal()">
                        새 제안 추가
                    </v-btn>
                </div>

                <v-row dense>
                    <v-col v-for="proposal in filteredProposals" :key="proposal.proposalId" cols="12" sm="6" md="3"
                        rounded="xl">
                        <v-card outlined class="proposal-card" @click="goToProposalDetail(proposal.proposalId)"
                            elevation="2" rounded="xl">
                            <!-- 즐겨찾기 -->
                            <v-btn small class="favorite-btn" @click.stop="toggleFavorite(proposal)" elevation="0">
                                <v-icon :color="proposal.isFavorite ? '#FFD60A' : '#8e8e93'">
                                    {{ proposal.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
                                </v-icon>
                            </v-btn>

                            <!-- 제목 -->
                            <v-card-title class="proposal-title">
                                {{ proposal.proposalTitle }}
                            </v-card-title>
                            <v-divider class="my-2" />

                            <v-card-text class="pa-0">
                                <v-row dense class="mb-1">
                                    <v-col cols="5" class="label">고객사</v-col>
                                    <v-col cols="7">{{ proposal.clientCompanyName }}</v-col>
                                </v-row>
                                <v-row dense class="mb-1">
                                    <v-col cols="5" class="label">고객</v-col>
                                    <v-col cols="7">{{ proposal.clientName }}</v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col cols="5" class="label">담당자</v-col>
                                    <v-col cols="7">{{ proposal.createdUserName }}</v-col>
                                </v-row>
                            </v-card-text>

                            <v-divider class="my-2" />

                            <v-card-text class="pa-0 d-flex justify-space-between align-center">
                                <span :class="['sidebar-text', statusClass(proposal.status)]">
                                    {{ statusLabel(proposal.status) }}
                                </span>
                                <span class="period-text d-flex flex-column">
                                    <span>요청일: {{ proposal.requestDate }}</span>
                                    <span>제출일: {{ proposal.submitDate }}</span>
                                </span>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- 페이지네이션 -->
                <v-row justify="center" class="mt-6">
                    <v-pagination v-model="page" :length="totalPages" @update:modelValue="onPageChange" />
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getProposals } from '@/apis/proposal'

const router = useRouter()

const search = ref('')
const showFavoritesOnly = ref(false)

// 서버 데이터
const proposals = ref([])

// 페이징
const page = ref(1)
const size = ref(12)
const totalElements = ref(0)
const totalPages = ref(0)

const loading = ref(false)

// 상태 필터 (value는 BE enum 값과 동일하게)
const sidebares = reactive([
    { label: '작성중', value: 'DRAFT', checked: false },
    { label: '제출됨', value: 'SUBMITTED', checked: false },
    { label: '완료', value: 'COMPLETED', checked: false },
    { label: '취소됨', value: 'CANCELED', checked: false },
])

// 즐겨찾기 토글
const toggleFavorite = (proposal) => {
    proposal.isFavorite = !proposal.isFavorite
}

// 상태에 따른 클래스
const statusClass = (status) => {
    const s = String(status || '').toUpperCase()
    switch (s) {
        case 'DRAFT': return 'sidebar-draft'
        case 'SUBMITTED': return 'sidebar-submitted'
        case 'COMPLETED': return 'sidebar-completed'
        case 'CANCELED': return 'sidebar-canceled'
        default: return ''
    }
}

const statusLabel = (status) => {
    const s = String(status || '').toUpperCase()
    switch (s) {
        case 'DRAFT': return '작성중'
        case 'SUBMITTED': return '제출됨'
        case 'COMPLETED': return '완료'
        case 'CANCELED': return '취소됨'
        default: return status
    }
}

// 목록 조회 (BE 페이지네이션 사용)
const fetchProposals = async (resetPage = false) => {
    if (resetPage) {
        page.value = 1
    }

    loading.value = true
    try {
        const { data } = await getProposals({
            keyword: search.value || undefined,
            page: page.value,
            size: size.value,
            // 상태를 서버로 넘기고 싶으면 여기서 status 추가 가능
        })

        // 백엔드 응답: { page, size, totalCount, data: [...] } 라고 가정
        const list = data.data || []

        proposals.value = list.map((p) => ({
            ...p,
            isFavorite: p.isFavorite ?? false,
        }))

        page.value = data.page
        size.value = data.size
        totalElements.value = data.totalCount
        totalPages.value = Math.ceil(data.totalCount / data.size)
    } finally {
        loading.value = false
    }
}

// 검색어 바뀌면 1페이지부터 재조회
watch(search, () => {
    fetchProposals(true)
})

// FE 필터링 (상태 / 즐겨찾기 / 검색 텍스트)
const filteredProposals = computed(() => {
    const searchText = (search.value || '').trim()
    const activeStatuses = sidebares
        .filter((s) => s.checked)
        .map((s) => s.value) // ['DRAFT','SUBMITTED',...]

    return proposals.value.filter((p) => {
        const matchesSearch =
            !searchText ||
            p.proposalTitle?.includes(searchText) ||
            p.clientCompanyName?.includes(searchText) ||
            p.clientName?.includes(searchText)

        const statusStr = String(p.status || '').toUpperCase()

        const matchesStatus =
            activeStatuses.length === 0 || activeStatuses.includes(statusStr)

        const matchesFavorite =
            !showFavoritesOnly.value || p.isFavorite

        return matchesSearch && matchesStatus && matchesFavorite
    })
})

// 페이지 변경 시 재조회
const onPageChange = () => {
    fetchProposals(false)
}

const goToProposalDetail = (id) => {
    router.push({ name: 'ProposalDetail', params: { id } })
}

const goToCreateProposal = () => {
    router.push({ name: 'CreateProposal' })
}

onMounted(() => {
    fetchProposals()
})
</script>

<style scoped>
.main-container {
    background-color: #ffffff;
    min-height: 100vh;
}

/* 사이드바 */
.sidebar-card {
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    background-color: #ffffff;
}

/* 즐겨찾기 토글 버튼 */
.favorite-toggle-btn {
    margin-top: 12px;
    border-radius: 8px;
    background-color: #ffffff;
    padding: 6px;
    border: 1px solid rgba(0, 0, 0, 0.12);
}

.favorite-toggle-btn .v-icon {
    font-size: 1.2rem;
    transition: color 0.2s;
}

/* 카드 */
.proposal-card {
    position: relative;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    background-color: #ffffff;
}

.proposal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 카드 우측 상단 즐겨찾기 */
.favorite-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.favorite-btn .v-icon {
    font-size: 1.1rem;
    transition: color 0.2s;
}

/* 상태 */
.sidebar-text {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 6px;
}

.sidebar-draft {
    color: #888;
    background-color: #f0f0f0;
}

.sidebar-submitted {
    color: #1976d2;
    background-color: #e3f2fd;
}

.sidebar-completed {
    color: #4caf50;
    background-color: #e8f5e9;
}

.sidebar-canceled {
    color: #f44336;
    background-color: #ffebee;
}

.period-text {
    font-size: 0.75rem;
    color: #888888;
    font-weight: 400;
}

.label {
    font-size: 0.7rem;
    color: #8e8e93;
}

.proposal-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 4px;
}

/* 상태 체크박스 디자인 */
.sidebar-checkbox .v-input--selection-controls__ripple {
    display: none;
}

.sidebar-checkbox .v-input--selection-controls__input {
    min-width: 28px;
    min-height: 28px;
}

.sidebar-checkbox .v-label {
    font-size: 0.75rem;
    color: #1c1c1e;
    font-weight: 500;
}

.sidebar-checkbox {
    background-color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s, border-color 0.2s;
}

.sidebar-checkbox:hover {
    background-color: #f9f9f9;
    border-color: rgba(0, 0, 0, 0.2);
}

.sidebar-checkbox-group {
    font-weight: 600;
    color: #555;
    font-size: 14px;
    margin-bottom: 8px;
}
</style>
