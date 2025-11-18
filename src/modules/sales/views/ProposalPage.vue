<template>
    <v-container fluid class="pa-0 full-height main-container">
        <v-row no-gutters class="full-height">

        <!-- 좌측 사이드바 -->
        <v-col cols="12" md="2" class="pa-4 sidebar">
            <v-card class="sidebar-card pa-6" flat>
                <v-text-field
                    v-model="search"
                    append-inner-icon="mdi-magnify"
                    label="검색"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    class="mb-4"
                />
            <!-- 즐겨찾기 버튼 -->
                <div class="d-flex justify-end mt-2">
                    <v-btn
                        small
                        class="favorite-toggle-btn"
                        @click="showFavoritesOnly = !showFavoritesOnly"
                        elevation="1"
                    >
                        <v-icon :color="showFavoritesOnly ? '#FFD60A' : '#8e8e93'">
                        {{ showFavoritesOnly ? 'mdi-star' : 'mdi-star-outline' }}
                        </v-icon>
                    </v-btn>
                </div>

                <!-- 상태 체크박스 그룹 -->
                <div class="sidebar-checkbox-group mt-4">진행 상태
                <v-checkbox
                    v-for="sidebar in sidebares"
                    :key="sidebar.value"
                    v-model="sidebar.checked"
                    :label="sidebar.label"
                    hide-details
                    dense
                    class="sidebar-checkbox"
                ></v-checkbox>
                </div>

            </v-card>
        </v-col>

        <!-- 메인 컨텐츠 -->
        <v-col cols="12" md="10" class="pa-6 main-content">
            <div class="d-flex justify-end mb-4">
            <v-btn color="#ff9500" class="white--text" rounded elevation="4" @click="showModal = true">
                새 제안 추가
            </v-btn>
            </div>

            <v-row dense>
            <v-col
                v-for="proposal in filteredProposals"
                :key="proposal.id"
                cols="12"
                sm="6"
                md="3"
                rounded="xl"
            >
                <v-card outlined class="proposal-card" @click="goToProposalDetail(proposal.id)" elevation="2" rounded="xl">

                <!-- 카드 우측 상단 즐겨찾기 -->
                <v-btn
                    small
                    class="favorite-btn"
                    @click.stop="toggleFavorite(proposal)"
                    elevation="0"
                >
                    <v-icon :color="proposal.isFavorite ? '#FFD60A' : '#8e8e93'">
                    {{ proposal.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
                    </v-icon>
                </v-btn>

                <!-- 카드 내용 -->
                <v-card-title class="proposal-title">{{ proposal.projectName }}</v-card-title>
                <v-divider class="my-2" />

                <v-card-text class="pa-0">
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">고객사</v-col>
                    <v-col cols="7">{{ proposal.clientCompany }}</v-col>
                    </v-row>
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">고객</v-col>
                    <v-col cols="7">{{ proposal.clientOwner }}</v-col>
                    </v-row>
                    <v-row dense>
                    <v-col cols="5" class="label">담당자</v-col>
                    <v-col cols="7">{{ proposal.salesManager }}</v-col>
                    </v-row>
                </v-card-text>

                <v-divider class="my-2" />

                <v-card-text class="pa-0 d-flex justify-space-between align-center">
                    <span :class="['sidebar-text', sidebarClass(proposal.sidebar)]">{{ proposal.sidebar }}</span>
                    <span class="period-text">기간: {{ proposal.startDate }} ~ {{ proposal.endDate }}</span>
                </v-card-text>

                </v-card>
            </v-col>
            </v-row>
        </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const search = ref('');
const categoryFilter = ref('');
const showFavoritesOnly = ref(false);

const proposals = reactive([
    { id: 1, projectName: '프로젝트 A', clientCompany: '삼성전자', clientOwner: '김영업', salesManager: '박팀장', startDate: '2025-11-01', endDate: '2025-11-30', sidebar: 'Draft', category: '서비스', isFavorite: false },
    { id: 2, projectName: '프로젝트 B', clientCompany: 'LG CNS', clientOwner: '이영희', salesManager: '최팀장', startDate: '2025-12-01', endDate: '2025-12-31', sidebar: 'Submitted', category: '패션', isFavorite: true },
    { id: 3, projectName: '프로젝트 C', clientCompany: '카카오', clientOwner: '홍길동', salesManager: '이팀장', startDate: '2025-11-05', endDate: '2025-12-05', sidebar: 'Completed', category: '뷰티', isFavorite: false }
]);

const goToProposalDetail = (id) => {
    router.push({ name: 'ProposalDetail', params: { id } });
};  

const toggleFavorite = (proposal) => {
    proposal.isFavorite = !proposal.isFavorite;
};

const sidebarClass = (sidebar) => {
    switch(sidebar) {
        case 'Draft': return 'sidebar-draft';
        case 'Submitted': return 'sidebar-submitted';
        case 'Completed': return 'sidebar-completed';
        case 'Canceled': return 'sidebar-canceled';
        default: return '';
    }
};

const sidebares = reactive([
    { label: 'Draft', value: 'Draft', checked: true },
    { label: 'Submitted', value: 'Submitted', checked: true },
    { label: 'Completed', value: 'Completed', checked: true },
    { label: 'Canceled', value: 'Canceled', checked: true },
]);

const filteredProposals = computed(() => {
    return proposals.filter(p => {
        const matchesSearch = !search.value || p.projectName.includes(search.value);
        const matchessidebar = sidebares.some(s => s.checked && s.value === p.sidebar);
        const matchesCategory = !categoryFilter.value || p.category === categoryFilter.value;
        const matchesFavorite = !showFavoritesOnly.value || p.isFavorite;
        return matchesSearch && matchessidebar && matchesCategory && matchesFavorite;
    });
});
</script>

<style scoped>
.main-container {
    background-color: #ffffff; /* 전체 배경 완전 흰색 */
    min-height: 100vh;
}

/* 사이드바 */
.sidebar-card {
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.12);
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    background-color: #ffffff; /* 회색 제거 */
}

/* 즐겨찾기 버튼 - 네모, 둥근 모서리, 배경 흰색 */
.favorite-toggle-btn {
    margin-top: 12px;
    border-radius: 8px;
    background-color: #ffffff; /* 회색 제거 */
    padding: 6px;
    border: 1px solid rgba(0,0,0,0.12);
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
    box-shadow: 0 6px 20px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    background-color: #ffffff;
}

.proposal-card:hover {
    sform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

/* 카드 우측 상단 즐겨찾기 - 네모, 둥근 모서리, 배경 흰색 */
.favorite-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
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
.sidebar-draft { color: #888; background-color: #f0f0f0; }
.sidebar-submitted { color: #1976d2; background-color: #e3f2fd; }
.sidebar-completed { color: #4caf50; background-color: #e8f5e9; }
.sidebar-canceled { color: #f44336; background-color: #ffebee; }

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
  display: none; /* 기본 ripple 제거 */
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
    border-color: rgba(0,0,0,0.2);
}

.sidebar-checkbox-group {
    font-weight: 600;
    color: #555;
    font-size: 14px;
    margin-bottom: 8px;
}
</style>
