<template>
    <v-container fluid class="pa-0 full-height">
        <v-row no-gutters class="full-height">
            <!-- ==================== 좌측 사이드바 ==================== -->
            <v-col cols="12" md="2" class="pa-4 sidebar">
                <v-card class="pa-6 sidebar-card" flat>
                    <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="검색" variant="outlined"
                        hide-details density="comfortable" class="mb-4 sidebar-input" />

                    <!-- 카테고리: 첫 번째 옵션 '전체' -->
                    <v-select v-model="category" :items="categoryFilterItems" item-title="title" item-value="value"
                        label="카테고리" variant="outlined" hide-details density="comfortable" class="mb-6 sidebar-input" />

                    <!-- 계약 상태: '전체 / 활성(ACTIVE) / 종료(COMPLETED)' -->
                    <v-select v-model="contractStatus" :items="contractStatusItems" item-title="title"
                        item-value="value" label="계약 상태" variant="outlined" hide-details density="comfortable"
                        class="mb-6 sidebar-input" />
                </v-card>
            </v-col>

            <!-- ==================== 메인 컨텐츠 ==================== -->
            <v-col cols="12" md="10" class="pa-6 main-content">
                <!-- 고객사 추가 버튼 -->
                <div class="d-flex justify-end mb-4">
                    <v-btn color="orange darken-2" class="white--text" rounded elevation="4" @click="showModal = true">
                        고객사 추가
                    </v-btn>
                </div>

                <!-- 고객사 카드 목록 -->
                <v-row dense>
                    <v-col v-for="(client, index) in filteredClients" :key="index" cols="12" sm="6" md="3">
                        <v-card outlined class="pa-4 client-card" @click="goToClientCompanyDetail(client.id)">
                            <v-card-title class="client-title text-center">
                                {{ client.companyName }}
                            </v-card-title>

                            <v-divider class="my-2" />

                            <v-card-text class="pa-0">
                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">카테고리</v-col>
                                    <v-col cols="7" class="value-col">
                                        {{ client.categoryLabel }}
                                    </v-col>
                                </v-row>

                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">담당자</v-col>
                                    <v-col cols="7" class="value-col">
                                        {{ client.managerName || '-' }}
                                    </v-col>
                                </v-row>

                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">계약 기간</v-col>
                                    <v-col cols="7" class="value-col">
                                        <span class="period-badge">
                                            {{ client.contractStartDay }}<br />
                                            {{ client.contractEndDay }}
                                        </span>
                                    </v-col>
                                </v-row>

                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">계약 상태</v-col>
                                    <v-col cols="7" class="value-col">
                                        <span :class="client.isActive ? 'status-active' : 'status-ended'">
                                            {{ client.statusLabel }}
                                        </span>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- 페이지네이션 -->
                <div class="d-flex justify-center mt-4">
                    <v-pagination v-model="page" :length="totalPages" @update:model-value="fetchClients" />
                </div>
            </v-col>
        </v-row>

        <!-- ==================== 고객사 추가 모달 ==================== -->
        <v-dialog v-model="showModal" max-width="500">
            <v-card class="pa-6 modal-card">
                <v-card-title class="text-center modal-title-container">
                    <div class="modal-title">고객사 추가</div>
                    <div class="modal-subtitle">새로운 고객사 정보를 입력해주세요.</div>
                </v-card-title>

                <v-card-text>
                    <v-text-field v-model="form.companyName" label="고객사명" variant="outlined" class="modal-input" />

                    <!-- 등록 폼용 카테고리: '전체' 없이 enum만 -->
                    <v-select v-model="form.category" :items="categoryFormItems" item-title="title" item-value="value"
                        label="카테고리" variant="outlined" class="modal-input" />

                    <v-text-field v-model="form.businessNumber" label="사업자번호" placeholder="555-22-14444"
                        variant="outlined" class="modal-input" />

                    <v-text-field v-model="form.phone" label="연락처" placeholder="031-123-9999" variant="outlined"
                        class="modal-input" />

                    <v-text-field v-model="form.address" label="주소" placeholder="주소 입력" variant="outlined"
                        class="modal-input" />

                    <v-text-field v-model="form.website" label="웹사이트" placeholder="https://example.co.kr"
                        variant="outlined" class="modal-input" />

                    <v-text-field v-model="form.fax" label="팩스" placeholder="031-111-2222" variant="outlined"
                        class="modal-input" />

                    <v-text-field v-model="form.zipCode" label="우편번호" placeholder="13529" variant="outlined"
                        class="modal-input" />
                </v-card-text>

                <v-card-actions class="justify-end modal-actions">
                    <v-btn text color="grey darken-1" class="cancel-btn" @click="showModal = false">
                        취소
                    </v-btn>
                    <v-btn color="orange darken-2" class="white--text add-btn" @click="addClient">
                        추가
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { registerCustomer, getCustomerCompanies } from '@/apis/client'

const router = useRouter()

// ====================== 카테고리 enum <-> 라벨 맵 ======================
const CATEGORY_LABEL_MAP = {
    FASHION: '패션',
    BEAUTY: '뷰티',
    FOOD: '식음료',
    LIFESTYLE: '리빙/라이프스타일',
    ELECTRONICS: '가전/디지털',
    ACCESSORY: '잡화/액세서리',
    SPORTS: '스포츠/아웃도어',
    SERVICE: '서비스/기타'
}

// 사이드바 필터용: 제일 앞에 '전체'
const categoryFilterItems = [
    { title: '전체', value: '' },
    ...Object.entries(CATEGORY_LABEL_MAP).map(([value, title]) => ({
        title,
        value
    }))
]

// 등록 폼용: enum만
const categoryFormItems = Object.entries(CATEGORY_LABEL_MAP).map(([value, title]) => ({
    title,
    value
}))

// 계약 상태 필터용: '' = 전체, ACTIVE = 활성, COMPLETED = 종료
const contractStatusItems = [
    { title: '전체', value: '' },
    { title: '활성', value: 'ACTIVE' },
    { title: '종료', value: 'COMPLETED' }
]

const toKoreanCategory = (value) => {
    if (!value) return '-'
    return CATEGORY_LABEL_MAP[value] ?? value
}

const toKoreanProjectStatus = (value) => {
    switch (value) {
        case 'ACTIVE':
            return '활성'
        case 'COMPLETED':
            return '종료'
        case 'PENDING':
            return '계약 예정'
        case 'ENDED':
            return '종료'
        default:
            return value || '-'
    }
}

// 검색 / 필터
const search = ref('')
const category = ref('')          // '' = 전체, 나머지 = enum 이름
const contractStatus = ref('')    // '' = 전체, 'ACTIVE' | 'COMPLETED'

// DB에서 받아온 고객사 목록
const clients = ref([])

// 페이지 정보
const page = ref(1)
const size = ref(20)
const totalCount = ref(0)

const totalPages = computed(() => {
    if (!totalCount.value || !size.value) return 1
    return Math.max(1, Math.ceil(totalCount.value / size.value))
})

// 모달 / 폼
const showModal = ref(false)

const form = reactive({
    companyName: '',
    category: null, // enum 이름 (예: 'ACCESSORY')
    businessNumber: '',
    phone: '',
    address: '',
    website: '',
    fax: '',
    zipCode: ''
})

// 고객사 목록 조회
const fetchClients = async () => {
    try {
        const params = {
            keyword: search.value || null,
            // '' 선택 시 null 로 보내서 전체
            category: category.value || null,
            page: page.value,
            size: size.value
        }

        const { data } = await getCustomerCompanies(params)

        clients.value = (data.data || []).map((c) => ({
            id: c.clientCompanyId,
            companyName: c.companyName,
            category: c.category,
            categoryLabel: toKoreanCategory(c.category),
            managerName: c.managerName,
            contractStartDay: c.contractStartDay,
            contractEndDay: c.contractEndDay,
            projectStatus: c.projectStatus,                // 원본 상태 저장
            isActive: c.projectStatus === 'ACTIVE',
            statusLabel: toKoreanProjectStatus(c.projectStatus)
        }))

        totalCount.value = data.totalCount
        page.value = data.page
        size.value = data.size
    } catch (e) {
        console.error('고객사 목록 조회 실패', e)
    }
}

// 화면용 필터링 (계약 상태)
const filteredClients = computed(() => {
    let list = clients.value

    if (contractStatus.value === 'ACTIVE') {
        list = list.filter(c => c.projectStatus === 'ACTIVE')
    } else if (contractStatus.value === 'COMPLETED') {
        list = list.filter(c => c.projectStatus === 'COMPLETED')
    }

    return list
})

// 최초 진입 시 목록 조회
onMounted(() => {
    fetchClients()
})

// 카테고리, 검색 변경 시 1페이지부터 다시 조회
watch(category, () => {
    page.value = 1
    fetchClients()
})

watch(search, () => {
    page.value = 1
    fetchClients()
})

// 고객사 등록
const addClient = async () => {
    try {
        const payload = {
            companyName: form.companyName,
            category: form.category,
            businessNumber: form.businessNumber,
            phone: form.phone,
            address: form.address,
            website: form.website,
            fax: form.fax,
            zipCode: form.zipCode
        }

        await registerCustomer(payload)

        showModal.value = false

        Object.keys(form).forEach((k) => {
            form[k] = ''
        })

        page.value = 1
        await fetchClients()
    } catch (e) {
        console.error('고객사 등록 실패', e)
    }
}

const goToClientCompanyDetail = (id) => {
    router.push({
        name: 'ClientCompanyDetail',
        params: { id }
    })
}
</script>

<style scoped>
/* 사이드바 */
.sidebar-card {
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    padding: 24px;
    height: 100%;
}

.sidebar-input {
    background-color: #fff;
    border-radius: 8px;
}

/* 정보 행 공통 */
.info-row {
    margin-bottom: 2px;
}

.info-row:last-of-type {
    margin-bottom: 0;
}

.info-row>.v-col {
    padding-top: 0;
    padding-bottom: 0;
}

/* 고객사 카드 */
.client-card {
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    font-size: 0.9rem;
    transition: box-shadow 0.3s, transform 0.2s;
}

.client-card:hover {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.client-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0;
}

.label {
    font-weight: 500;
    color: #888;
    font-size: 0.7rem;
}

.value-col {
    padding-left: 0;
    font-weight: 500;
    color: #333;
    font-size: 0.8rem;
}

/* 계약기간 배지 */
.period-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 6px;
    background-color: #f2f2f7;
    font-size: 0.72rem;
    color: #555;
    line-height: 1.2;
}

/* 상태 색상 */
.status-active {
    color: green;
    font-weight: 600;
}

.status-ended {
    color: red;
    font-weight: 600;
}

/* 모달 */
.modal-card {
    border-radius: 20px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}
</style>
