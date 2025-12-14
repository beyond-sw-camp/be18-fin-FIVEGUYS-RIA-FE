<template>
    <v-container fluid class="pa-0 full-height main-container">
        <v-row no-gutters class="full-height">

            <!-- 좌측 사이드바 -->
            <v-col cols="12" md="2" class="pa-4 sidebar">
                <v-card class="sidebar-card pa-6" flat>

                    <!-- 즐겨찾기 버튼 -->
                    <div class="d-flex justify-end mb-4">
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

                    <!-- 검색 -->
                    <v-text-field
                        v-model="search"
                        append-inner-icon="mdi-magnify"
                        label="검색"
                        variant="outlined"
                        hide-details
                        density="comfortable"
                        class="mb-4"
                    />

                    <v-select
                        v-model="selectedUser"
                        :items="users"
                        item-title="name"
                        item-value="userId"
                        label="작성자"
                        variant="outlined"
                        hide-details
                        density="comfortable"
                        class="mb-4 sidebar-input"
                    />

                    <!-- 상태 체크박스 -->
                    <div class="sidebar-checkbox-group mt-4">
                        진행 상태
                        <v-checkbox
                            v-for="sidebar in sidebares"
                            :key="sidebar.value"
                            v-model="sidebar.checked"
                            :label="sidebar.label"
                            hide-details
                            dense
                            class="sidebar-checkbox"
                        />
                    </div>

                </v-card>
            </v-col>

            <!-- 메인 컨텐츠 -->
            <v-col cols="12" md="10" class="pa-6 main-content">

                <div class="d-flex justify-end mb-4">
                    <v-btn
                        color="#ff9500"
                        class="white--text"
                        rounded
                        elevation="4"
                        @click="goToCreateContract"
                    >
                        새 계약 추가
                    </v-btn>
                </div>

                <v-row dense>
                    <v-col
                        v-for="contract in filteredContracts"
                        :key="contract.contractId"
                        cols="12"
                        sm="6"
                        md="3"
                    >
                        <v-card
                            class="contract-card"
                            elevation="2"
                            rounded="xl"
                            @click="goToContractDetail(contract.contractId)"
                        >
                            <!-- 즐겨찾기 -->
                            <v-btn
                                small
                                class="favorite-btn"
                                @click.stop="toggleFavorite(contract)"
                                elevation="0"
                            >
                                <v-icon :color="contract.isFavorite ? '#FFD60A' : '#8e8e93'">
                                    {{ contract.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
                                </v-icon>
                            </v-btn>

                            <!-- 제목 -->
                            <v-card-title class="contract-title">
                                {{ contract.contractTitle }}
                            </v-card-title>

                            <v-divider class="my-2" />

                            <!-- 기본 정보 -->
                            <v-card-text class="pa-0">
                                <v-row dense class="mb-1">
                                    <v-col cols="5" class="label">고객사</v-col>
                                    <v-col cols="7">{{ contract.clientCompanyName }}</v-col>
                                </v-row>
                                <v-row dense class="mb-1">
                                    <v-col cols="5" class="label">고객</v-col>
                                    <v-col cols="7">{{ contract.clientName }}</v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col cols="5" class="label">담당자</v-col>
                                    <v-col cols="7">{{ contract.createUserName }}</v-col>
                                </v-row>
                            </v-card-text>

                            <v-divider class="my-2" />

                            <!-- 상태 + 금액 -->
                            <v-card-text class="pa-0 d-flex justify-space-between align-center">
                                <span :class="['sidebar-text', sidebarClass(contract.status)]">
                                    {{ statusLabel(contract.status) }}
                                </span>

                                <span class="period-text d-flex flex-column">
                                    <span class="meta-row">
                                        계약일: {{ formatDate(contract.contractDate) }}
                                    </span>

                                    <span class="meta-row">
                                        계약금액:
                                        <span class="meta-amount">
                                            {{ formatCurrencyAmount(contract.totalAmount, contract.currency) }}
                                        </span>

                                        <span class="commission-text">
                                            + α × {{ contract.commissionRate ?? 0 }}%
                                        </span>
                                    </span>
                                </span>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- 페이지네이션 -->
                <v-row justify="center" class="mt-6">
                    <v-pagination
                        v-model="page"
                        :length="totalPages"
                        @update:modelValue="onPageChange"
                    />
                </v-row>

            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue';
import { getContracts } from '@/apis/contract';
import { getUserList } from '@/apis/user';
import { useRouter } from 'vue-router';

const router = useRouter();

const search = ref('');
const showFavoritesOnly = ref(false);
const selectedUser = ref('');
const users = ref([]);

const contracts = ref([]);
const page = ref(1);
const size = ref(12);
const totalPages = ref(1);
const loading = ref(false);

const sidebares = reactive([
    { label: '제출됨', value: 'SUBMITTED', checked: false },
    { label: '완료', value: 'COMPLETED', checked: false },
    { label: '취소', value: 'CANCELED', checked: false },
]);


const toggleFavorite = (contract) => {
    contract.isFavorite = !contract.isFavorite;
};

const sidebarClass = (status) => {
    switch (String(status || '').toUpperCase()) {
        case 'SUBMITTED': return 'sidebar-submitted';
        case 'COMPLETED': return 'sidebar-completed';
        case 'CANCELED': return 'sidebar-canceled';
        default: return '';
    }
};

const statusLabel = (status) => {
    switch (String(status || '').toUpperCase()) {
        case 'SUBMITTED': return '제출됨';
        case 'COMPLETED': return '완료';
        case 'CANCELED': return '취소';
        default: return status;
    }
};

const formatCurrencyAmount = (amount, currency = 'KRW') => {
    const value = Number(amount || 0);

    const currencyMap = {
        KRW: { locale: 'ko-KR', symbol: '₩' },
        USD: { locale: 'en-US', symbol: '$' },
        EUR: { locale: 'de-DE', symbol: '€' },
    };

    const config = currencyMap[currency] || currencyMap.KRW;

    return `${config.symbol}${value.toLocaleString(config.locale)}`;
};

const formatDate = (d) =>
    d ? new Date(d).toISOString().slice(0, 10) : '';

const fetchContracts = async (resetPage = false) => {
    if (resetPage) page.value = 1;
    loading.value = true;

    try {
        const activeStatuses = sidebares
        .filter(s => s.checked)
        .map(s => s.value);

        const { data } = await getContracts({
        keyword: search.value || undefined,
        status: activeStatuses.length ? activeStatuses : undefined,
        userId: selectedUser.value || undefined,
        page: page.value,
        size: size.value,
        });

        contracts.value = (data?.data || []).map(c => ({
        ...c,
        isFavorite: c.isFavorite ?? false,
        commissionRate: c.commissionRate ?? null,
        }));

        totalPages.value = Math.max(
        1,
        Math.ceil((data?.totalCount ?? 0) / size.value)
        );
    } finally {
        loading.value = false;
    }
};

const filteredContracts = computed(() => {
    const activeStatuses = sidebares
        .filter(s => s.checked)
        .map(s => s.value);

    return contracts.value.filter(c =>
        (!search.value || c.contractTitle?.includes(search.value)) &&
        (activeStatuses.length === 0 || activeStatuses.includes(c.status)) &&
        (!showFavoritesOnly.value || c.isFavorite)
    );
});

watch([search, selectedUser], () => fetchContracts(true));

watch(
    () => sidebares.map(s => s.checked),
    () => fetchContracts(true),
    { deep: true }
);

onMounted(async () => {
    fetchContracts();
    const res = await getUserList();
    users.value = [{ userId: '', name: '전체' }, ...(res?.data || [])];
});

const goToCreateContract = () =>
    router.push({ name: 'CreateContract' });

const goToContractDetail = (id) =>
    router.push({ name: 'ContractDetail', params: { id } });

const onPageChange = () => fetchContracts(false);
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


/* 즐겨찾기 */
.favorite-toggle-btn {
    border-radius: 8px;
    background-color: #ffffff;
    padding: 6px;
    border: 1px solid rgba(0, 0, 0, 0.12);
}

/* 카드 */
.contract-card {
    position: relative;
    padding: 12px;
    /* 패딩 줄여서 Proposal/Estimate와 동일하게 */
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    background-color: #ffffff;
    min-height: 180px;
    /* Proposal/Estimate 카드 높이와 동일하게 */
}

.contract-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 즐겨찾기 버튼 (카드) */
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
}

/* 상태 */
.sidebar-text {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 6px;
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

/* 계약 제목 */
.contract-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 기간 / 금액 */
.period-text {
    font-size: 0.75rem;
    color: #888888;
    font-weight: 400;
}

/* 라벨 */
.label {
    font-size: 0.7rem;
    color: #8e8e93;
}

/* 체크박스 */
.sidebar-checkbox .v-label {
    font-size: 0.75rem;
}

.commission-text {
    font-size: 0.7rem;
    color: #777;
}
</style>
