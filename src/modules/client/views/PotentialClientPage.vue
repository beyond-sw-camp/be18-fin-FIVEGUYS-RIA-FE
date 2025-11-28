<template>
    <v-container fluid class="pa-0 full-height">
        <v-row no-gutters class="full-height">

            <!-- 좌측 사이드바 -->
            <v-col cols="12" md="2" class="pa-4 sidebar">
                <v-card class="pa-6 sidebar-card" flat>
                    <!-- 검색 -->
                    <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="검색" variant="outlined"
                        hide-details density="comfortable" class="mb-4 sidebar-input" />

                    <!-- 카테고리 셀렉트 -->
                    <v-select v-model="selectedCategory" :items="categoryItems" item-title="title" item-value="value"
                        label="카테고리" variant="outlined" density="comfortable" class="sidebar-input" clearable />
                </v-card>
            </v-col>

            <!-- 메인 컨텐츠 -->
            <v-col cols="12" md="10" class="pa-6 main-content">

                <!-- 잠재 고객 추가 버튼 -->
                <div class="d-flex justify-end mb-4">
                    <v-btn color="orange darken-2" class="white--text" elevation="4" rounded @click="showModal = true">
                        잠재 고객 추가
                    </v-btn>
                </div>

                <!-- 잠재 고객 카드 -->
                <v-row dense>
                    <v-col v-for="(customer, index) in potentialCustomers" :key="customer.id || index" cols="12" sm="6"
                        md="3">
                        <v-card outlined class="pa-4 customer-card" @click="goToCompanyDetail(customer)">
                            <v-card-title class="customer-title text-center">
                                {{ customer.company }}
                            </v-card-title>
                            <v-divider class="my-2" />
                            <v-card-text class="pa-0">
                                <v-row dense class="mb-1">
                                    <v-col cols="5" class="label">담당자</v-col>
                                    <v-col cols="7">{{ customer.owner }}</v-col>
                                </v-row>
                                <v-row dense class="mb-1">
                                    <v-col cols="5" class="label">연락처</v-col>
                                    <v-col cols="7">{{ customer.phone }}</v-col>
                                </v-row>
                                <v-row dense class="mb-1">
                                    <v-col cols="5" class="label">이메일</v-col>
                                    <v-col cols="7">{{ customer.email }}</v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col cols="5" class="label">최근 미팅일</v-col>
                                    <v-col cols="7">{{ customer.lastMeeting }}</v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- 페이지네이션 -->
                <div class="d-flex justify-center mt-4">
                    <v-pagination v-model="page" :length="totalPages" @update:model-value="fetchLeadCompanies" />
                </div>
            </v-col>
        </v-row>

        <!-- ==================== 잠재 고객 추가 모달 ==================== -->
        <v-dialog v-model="showModal" max-width="500">
            <v-card class="pa-6 modal-card">

                <!-- 타이틀 + 설명 -->
                <v-card-title class="text-center modal-title-container">
                    <div class="modal-title">잠재 고객 추가</div>
                    <div class="modal-subtitle">새로운 잠재 고객 정보를 입력해주세요.</div>
                </v-card-title>

                <v-card-text>
                    <!-- 백엔드 DTO랑 1:1 매칭 -->
                    <v-text-field v-model="form.companyName" label="고객사명" variant="outlined" class="modal-input" />

                    <v-select v-model="form.category" :items="categoryItems" item-title="title" item-value="value"
                        label="카테고리" variant="outlined" class="modal-input" />

                    <v-text-field v-model="form.businessNumber" label="사업자번호" placeholder="555-22-14444"
                        variant="outlined" class="modal-input" />

                    <v-text-field v-model="form.phone" label="연락처" placeholder="031-123-9999" variant="outlined"
                        class="modal-input" />

                    <v-text-field v-model="form.fax" label="팩스" placeholder="031-111-2222" variant="outlined"
                        class="modal-input" />

                    <v-text-field v-model="form.website" label="웹사이트" placeholder="https://example.co.kr"
                        variant="outlined" class="modal-input" />

                    <v-text-field v-model="form.zipCode" label="우편번호" placeholder="13529" variant="outlined"
                        class="modal-input" />

                    <v-text-field v-model="form.address" label="주소" placeholder="서울시 ..." variant="outlined"
                        class="modal-input" />
                </v-card-text>

                <v-card-actions class="justify-end modal-actions">
                    <v-btn text color="grey darken-1" class="cancel-btn" @click="showModal = false">
                        취소
                    </v-btn>
                    <v-btn color="orange darken-2" class="white--text add-btn" @click="addCustomer">
                        추가
                    </v-btn>
                </v-card-actions>

            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { registerLeadCompany, getLeadCompanies } from '@/apis/client'

const router = useRouter()

const goToCompanyDetail = (customer) => {
    if (!customer.id) {
        console.warn('고객사 id 없음, 이동 불가', customer)
        return
    }

    router.push({
        name: 'ClientCompanyDetail',
        params: { id: customer.id }
    })
}

// 검색
const search = ref('')

// 카테고리 필터
const selectedCategory = ref(null)

// 서버에서 가져올 잠재 고객사 목록
const leadCompanies = ref([])

// 화면 alias
const potentialCustomers = leadCompanies

// 페이지네이션
const page = ref(1)
const size = ref(20)
const totalCount = ref(0)

const totalPages = computed(() => {
    if (!totalCount.value || !size.value) return 1
    return Math.max(1, Math.ceil(totalCount.value / size.value))
})

// 모달
const showModal = ref(false)

// 폼 (백엔드 DTO와 1:1 매칭)
const form = reactive({
    companyName: '',
    category: '',
    businessNumber: '',
    phone: '',
    fax: '',
    website: '',
    zipCode: '',
    address: ''
})

// 카테고리 (client 등록과 동일)
const categoryItems = [
    { title: '패션', value: 'FASHION' },
    { title: '뷰티', value: 'BEAUTY' },
    { title: '식음료', value: 'FOOD' },
    { title: '리빙/라이프스타일', value: 'LIFESTYLE' },
    { title: '가전/디지털', value: 'ELECTRONICS' },
    { title: '잡화/액세서리', value: 'ACCESSORY' },
    { title: '스포츠/아웃도어', value: 'SPORTS' },
    { title: '서비스/기타', value: 'SERVICE' }
]

// 잠재 고객사 목록 조회
const fetchLeadCompanies = async () => {
    try {
        const params = {
            keyword: search.value || null,
            category: selectedCategory.value || null,
            page: page.value,
            size: size.value
        }

        const { data } = await getLeadCompanies(params)

        leadCompanies.value = (data.data || []).map(item => ({
            id: item.clientCompanyId,
            company: item.companyName,
            owner: '-',                 // 아직 필드 없으면 임시값
            phone: item.phone,
            email: item.website ?? '-',
            lastMeeting: '-'            // 프론트 전용
        }))

        totalCount.value = data.totalCount
        page.value = data.page
        size.value = data.size
    } catch (e) {
        console.error('잠재 고객사 목록 조회 실패', e)
    }
}

// 잠재 고객사 등록
const addCustomer = async () => {
    try {
        const payload = {
            companyName: form.companyName,
            category: form.category,
            businessNumber: form.businessNumber,
            phone: form.phone,
            fax: form.fax,
            website: form.website,
            zipCode: form.zipCode,
            address: form.address
        }

        await registerLeadCompany(payload)

        showModal.value = false
        Object.keys(form).forEach(k => (form[k] = ''))

        page.value = 1
        await fetchLeadCompanies()
    } catch (e) {
        console.error('잠재 고객사 등록 실패', e)
    }
}

// mount 시 최초 1회 조회
onMounted(() => {
    fetchLeadCompanies()
})

// 검색 변경 시 1페이지로 초기화 후 조회
watch(search, () => {
    page.value = 1
    fetchLeadCompanies()
})

// 카테고리 변경 시 1페이지로 초기화 후 조회
watch(selectedCategory, () => {
    page.value = 1
    fetchLeadCompanies()
})
</script>

<style scoped>
/* 사이드바 */
.sidebar-card {
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    padding: 24px;
    height: 100%;
    transition: all 0.2s ease-in-out;
}

.sidebar-card:hover {
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.sidebar-input {
    background-color: #fff;
    border-radius: 8px;
}

/* 잠재 고객 카드 */
.customer-card {
    transition: box-shadow 0.3s, transform 0.2s;
    font-size: 0.9rem;
    border-radius: 12px;
    padding: 16px;
    background-color: #ffffff;
    border: 1px solid #eee;
}

.customer-card:hover {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.customer-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0;
}

.label {
    font-weight: 500;
    color: #888;
}

/* 모달 카드 */
.modal-card {
    border-radius: 20px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.modal-title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 24px;
}

.modal-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #111;
}

.modal-subtitle {
    font-size: 0.85rem;
    color: #888;
    margin-top: 4px;
}

/* 모달 input 스타일 */
:deep(.modal-input) .v-field__control {
    background-color: #ffffff !important;
    border-radius: 12px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 모달 버튼 */
.modal-actions {
    margin-top: 12px;
}

.cancel-btn:hover {
    background-color: #f0f0f0;
    border-radius: 12px;
}

.add-btn:hover {
    box-shadow: 0 4px 12px rgba(251, 140, 0, 0.4);
    transform: translateY(-2px);
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
