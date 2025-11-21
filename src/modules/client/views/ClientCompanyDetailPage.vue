<template>
    <v-container fluid class="pa-0 full-height">
        <v-row no-gutters class="full-height">

            <!-- 좌측: 고객사 정보 -->
            <v-col cols="12" md="4" class="pa-4">
                <v-card outlined class="pa-3 full-height-card">
                    <v-card-title class="d-flex justify-space-between align-center mb-3">
                        <span class="text-h6">{{ clientCompany.name }}</span>
                        <v-icon small class="cursor-pointer pencil" @click="editCompany" title="고객사 정보 수정">
                            mdi-pencil-outline
                        </v-icon>
                    </v-card-title>

                    <v-divider class="mb-3" />
                    <div class="scroll-area">
                        <v-list dense>
                            <template v-for="(value, key) in clientCompany" :key="key">
                                <v-list-item
                                    v-if="!['id', 'name', 'category', 'type', 'createdAt', 'updatedAt'].includes(key)">
                                    <v-list-item-content>
                                        <div class="label">{{ formatCompanyLabel(key) }}</div>
                                        <div class="info-text">{{ value }}</div>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>

                        </v-list>
                    </div>
                </v-card>
            </v-col>

            <!-- 중앙 컬럼 -->
            <v-col cols="12" md="4" class="pa-4 d-flex flex-column">
                <v-card outlined class="pa-3 full-height-card"
                    style="display: flex; flex-direction: column; width:100%; box-sizing:border-box;">

                    <!-- 상단: 고객 검색 + 즐겨찾기 버튼 -->
                    <div class="d-flex mb-2">
                        <v-text-field v-model="customerSearch" append-inner-icon="mdi-magnify" placeholder="고객 검색" dense
                            outlined hide-details class="flex-grow-1 mr-2"></v-text-field>
                        <v-btn small outlined @click="showFavoritesOnly = !showFavoritesOnly">
                            <v-icon :color="showFavoritesOnly ? '#FFD60A' : '#8e8e93'">
                                {{ showFavoritesOnly ? 'mdi-star' : 'mdi-star-outline' }}
                            </v-icon>
                        </v-btn>
                    </div>

                    <!-- 고객 목록 -->
                    <div class="scroll-area list-area mb-2">
                        <v-row dense no-gutters>
                            <v-col v-for="customer in filteredCustomers" :key="customer.id" cols="12" class="mb-2">
                                <v-card outlined class="pa-2 customer-item-card"
                                    :class="{ 'selected-card': selectedCustomer && selectedCustomer.id === customer.id }"
                                    @click="toggleSelectCustomer(customer)">
                                    <v-row align="center" justify="space-between" no-gutters>
                                        <v-col class="pa-0">
                                            <div class="label text-caption mb-1">이름</div>
                                            <div class="font-weight-medium">{{ customer.name }}</div>
                                        </v-col>
                                        <v-col cols="auto" class="pa-0">
                                            <v-icon :color="customer.favorite ? 'yellow darken-3' : 'grey'"
                                                @click.stop="toggleFavorite(customer)" class="cursor-pointer">
                                                {{ customer.favorite ? 'mdi-star' : 'mdi-star-outline' }}
                                            </v-icon>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- 고객 등록 버튼 -->
                    <div class="d-flex justify-end mb-2">
                        <v-btn color="#ff9500" outlined @click="openModal">
                            고객 등록
                        </v-btn>
                    </div>

                    <!-- 하단: 선택된 고객 상세 정보 -->
                    <v-card v-if="selectedCustomer" outlined class="pa-3 detail-card">
                        <v-card-title class="d-flex align-center justify-space-between mb-3">
                            <div>
                                <div class="label text-caption">이름</div>
                                <div class="text-h6">{{ selectedCustomer.name }}</div>
                            </div>
                            <v-icon :color="selectedCustomer.favorite ? 'yellow darken-3' : 'grey'"
                                @click.stop="toggleFavorite(selectedCustomer)" class="cursor-pointer">
                                {{ selectedCustomer.favorite ? 'mdi-star' : 'mdi-star-outline' }}
                            </v-icon>
                        </v-card-title>

                        <v-divider class="mb-2" />

                        <div class="scroll-area detail-area">
                            <v-row dense no-gutters>
                                <v-col cols="6">
                                    <div class="label">이름</div>
                                    <div class="info-text">{{ selectedCustomer.name }}</div>
                                </v-col>

                                <v-col cols="6">
                                    <div class="label">직책</div>
                                    <div class="info-text">{{ selectedCustomer.position }}</div>
                                </v-col>

                                <v-col cols="6">
                                    <div class="label">이메일</div>
                                    <div class="info-text">{{ selectedCustomer.email }}</div>
                                </v-col>

                                <v-col cols="6">
                                    <div class="label">전화번호</div>
                                    <div class="info-text">{{ selectedCustomer.phone }}</div>
                                </v-col>
                            </v-row>
                        </div>

                    </v-card>

                </v-card>
            </v-col>

            <!-- 우측 컬럼 -->
            <v-col cols="12" md="4" class="pa-4">
                <v-card outlined class="pa-3 full-height-card">
                    <v-card-title class="text-h6 mb-2">History</v-card-title>
                    <v-divider class="mb-3" />

                    <div class="scroll-area">
                        <v-card v-for="(item, index) in filteredHistory" :key="index" outlined
                            class="pa-4 mb-5 history-card">
                            <v-row no-gutters>
                                <v-col>
                                    <div class="text-subtitle-2 font-weight-bold">{{ item.title }}</div>
                                    <div class="text-body-2 grey--text text--darken-1 mt-1">{{ item.content }}</div>
                                </v-col>
                                <v-col cols="4" class="d-flex flex-column align-end">
                                    <div class="text-caption font-weight-medium">{{ item.owner }}</div>
                                    <div class="text-caption grey--text mt-1">{{ item.date }}</div>
                                </v-col>
                            </v-row>
                        </v-card>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- ==================== 고객사 수정 모달 ==================== -->
        <v-dialog v-model="showEditModal" max-width="600">
            <v-card class="pa-6 modal-card">
                <v-card-title class="modal-title-container">
                    <div class="modal-title">고객사 정보 수정</div>
                    <div class="modal-subtitle">필요한 정보를 수정하고 저장하세요.</div>
                </v-card-title>

                <v-card-text>
                    <v-text-field v-for="field in editableFields" :key="field.key" v-model="editForm[field.key]"
                        :label="field.label" variant="outlined" class="modal-input"
                        @compositionend="onCompositionEnd(field.key, $event)" />
                </v-card-text>

                <v-card-actions class="modal-actions justify-end">
                    <v-btn text color="grey darken-1" class="cancel-btn" @click="showEditModal = false">취소</v-btn>
                    <v-btn color="#ff9500" class="white--text add-btn" @click="saveCompany">저장</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- ==================== 잠재 고객 추가 모달 ==================== -->
        <v-dialog v-model="showModal" max-width="500">
            <v-card class="pa-6 modal-card">
                <v-card-title class="modal-title-container">
                    <div class="modal-title">잠재 고객 추가</div>
                    <div class="modal-subtitle">새로운 잠재 고객 정보를 입력해주세요.</div>
                </v-card-title>

                <v-card-text>
                    <v-text-field v-model="form.name" label="고객명" variant="outlined" class="modal-input" />
                    <v-text-field v-model="form.clientCompany" label="고객사" variant="outlined" class="modal-input"
                        readonly />
                    <v-text-field v-model="form.department" label="부서" variant="outlined" class="modal-input" />
                    <v-text-field v-model="form.position" label="직책" variant="outlined" class="modal-input" />
                    <v-text-field v-model="form.phone" label="휴대폰" variant="outlined" class="modal-input" />
                    <v-text-field v-model="form.owner" label="담당자" variant="outlined" class="modal-input" />
                    <v-text-field v-model="form.email" label="이메일" variant="outlined" class="modal-input" />
                </v-card-text>

                <v-card-actions class="modal-actions justify-end">
                    <v-btn text color="grey darken-1" class="cancel-btn" @click="showModal = false">취소</v-btn>
                    <v-btn color="orange darken-2" class="white--text add-btn" @click="submitClient">추가</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClientCompanyDetail } from '@/apis/company'
import { getClientsByCompany } from '@/apis/company'

const route = useRoute()


// ==================== 고객사 정보 ====================
const clientCompany = reactive({
    id: null,
    name: '',
    website: '',
    businessNumber: '',
    fax: '',
    phone: '',
    zipCode: '',
    address: '',
    // 아래 필드들은 다른 쪽에서 채울 예정이라 그대로 유지
    tenantName: '',
    area: '',
    openingDate: '',
    contractPeriod: '',
    totalRent: '',
    commissionRate: '',
    avgSales: '',
    // 상세 DTO에서 내려오는 추가 필드
    category: '',
    type: '',
    createdAt: '',
    updatedAt: ''
})


const fetchClientCompany = async () => {
    try {
        const id = route.params.id

        const { data } = await getClientCompanyDetail(id)

        // 백엔드 DTO 매핑 (있는 것만 덮는다)
        clientCompany.id = data.clientCompanyId
        clientCompany.name = data.companyName
        clientCompany.website = data.website
        clientCompany.businessNumber = data.businessNumber
        clientCompany.fax = data.fax
        clientCompany.phone = data.phone
        clientCompany.zipCode = data.zipCode
        clientCompany.address = data.address
        clientCompany.category = data.category
        clientCompany.type = data.type
        clientCompany.createdAt = data.createdAt
        clientCompany.updatedAt = data.updatedAt

        // tenantName, area, openingDate, contractPeriod, totalRent, commissionRate, avgSales
        // 는 여기서 건드리지 않는다. (다른 API에서 채울 예정)
    } catch (e) {
        console.error('고객사 상세 조회 실패', e)
    }
}


onMounted(async () => {
    await fetchClientCompany()
    await fetchClients()
})

const customers = ref([])

// ==================== 고객 목록 조회 ====================
const fetchClients = async () => {
    try {
        const companyId = route.params.id

        const params = {
            page: 1,
            size: 20
        }

        const { data } = await getClientsByCompany(companyId, params)

        // DTO와 1:1로 맞추고, 화면용으로 id/favorite만 추가
        customers.value = data.data.map(c => ({
            id: c.clientId,               // 화면 key/선택용
            clientId: c.clientId,         // DTO 원본
            clientCompanyId: c.clientCompanyId,
            name: c.name,
            position: c.position,
            email: c.email,
            phone: c.phone,
            type: c.type,
            createdAt: c.createdAt,
            favorite: false               // 프론트에서만 쓰는 값
        }))
    } catch (e) {
        console.error('고객 목록 조회 실패', e)
    }
}




const history = ref([
    { title: "매출", content: "1월 매출 데이터 입력", owner: "김민수", date: "2025-01-20" },
    { title: "계약", content: "계약 체결 완료", owner: "박영희", date: "2025-01-15" },
    { title: "견적", content: "2차 견적서 전달", owner: "김민수", date: "2025-01-13" },
    { title: "제안", content: "신규 프로모션 제안", owner: "박영희", date: "2025-01-12" },
    { title: "고객 등록", content: "초기 고객 정보 등록", owner: "김민수", date: "2025-01-10" }
]);

const customerSearch = ref('');
const selectedCustomer = ref(null);
const showFavoritesOnly = ref(false);
const showModal = ref(false);

const form = reactive({
    name: '',
    clientCompany: '',
    department: '',
    position: '',
    phone: '',
    owner: '',
    email: ''
});

const openModal = () => {
    form.clientCompany = clientCompany.name;
    showModal.value = true;
};

const filteredCustomers = computed(() => {
    let list = customers.value;
    if (customerSearch.value) list = list.filter(c => c.name.includes(customerSearch.value));
    if (showFavoritesOnly.value) list = list.filter(c => c.favorite);
    return list;
});

const toggleSelectCustomer = (customer) => {
    if (selectedCustomer.value?.id === customer.id) {
        selectedCustomer.value = null;
    } else {
        selectedCustomer.value = customer;
    }
};

const filteredHistory = computed(() => {
    if (!selectedCustomer.value) return history.value;
    return history.value.filter(h => h.owner === selectedCustomer.value.owner);
});

const toggleFavorite = (customer) => {
    customer.favorite = !customer.favorite;
};

const submitClient = () => {
    const newId = customers.value.length + 1;

    customers.value.push({
        id: newId,
        name: form.name || `고객 ${newId}`,
        clientCompany: form.clientCompany,
        owner: form.owner,
        department: form.department,
        position: form.position,
        email: form.email,
        phone: form.phone,
        favorite: false
    });

    // 폼 초기화
    Object.assign(form, { name: '', department: '', position: '', phone: '', owner: '', email: '' });
    showModal.value = false;
};

const formatCompanyLabel = (key) => {
    const map = {
        website: '웹 사이트',
        businessNumber: '사업자 번호',
        fax: '팩스 번호',
        phone: '유선 번호',
        zipCode: '우편 번호',
        address: '주소',
        tenantName: '입주명',
        area: '면적',
        openingDate: '입점일',
        contractPeriod: '계약 기간',
        totalRent: '총 임대료',
        commissionRate: '매출 수수료율',
        avgSales: '평균 매출',
        category: '카테고리',
        type: '유형',
        createdAt: '생성일',
        updatedAt: '수정일'
    };
    return map[key] || key;
};


const formatCustomerLabel = (key) => {
    const map = {
        position: '직책',
        email: '이메일',
        phone: '전화번호',
        // type: '유형',       // 보여줄 거면 제외 리스트에서 빼고 여기 추가
        // createdAt: '등록일'
    }
    return map[key] || key
}


// ==================== 고객사 수정 모달 ====================
const showEditModal = ref(false);
const editForm = reactive({ ...clientCompany });

const editableFields = [
    { key: 'name', label: '고객사명' },
    { key: 'website', label: '웹 사이트' },
    { key: 'fax', label: '팩스 번호' },
    { key: 'phone', label: '전화번호' },
    { key: 'zipCode', label: '우편번호' },
    { key: 'address', label: '주소' },
];

const editCompany = () => {
    Object.assign(editForm, clientCompany);
    showEditModal.value = true;
};

// compositionend 이벤트로 IME 입력 처리
const onCompositionEnd = (field, event) => {
    editForm[field] = event.target.value;
};

const saveCompany = () => {
    // IME focus 강제 해제
    document.activeElement.blur();

    const editableKeys = editableFields.map(f => f.key);
    editableKeys.forEach(key => {
        clientCompany[key] = editForm[key];
    });

    showEditModal.value = false;
};
</script>

<style scoped>
/* ==================== 전체 레이아웃 ==================== */
.full-height-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    background-color: #ffffff;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 12px;
}

.scroll-area {
    overflow-y: auto;
    width: 100%;
    box-sizing: border-box;
}

/* ==================== 고객 리스트 영역 ==================== */
.list-area {
    max-height: 280px;
    /* 카드 4~5개 정도 */
    overflow-y: auto;
}

.customer-item-card {
    padding: 6px 8px;
    /* 촘촘하게 */
    border-radius: 10px;
    background-color: #ffffff;
    cursor: pointer;
    font-size: 0.85rem;
    transition: box-shadow 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
}

.customer-item-card .label {
    font-size: 0.65rem;
    margin-bottom: 2px;
    color: #8e8e93;
}

.customer-item-card .font-weight-medium {
    font-size: 0.8rem;
    color: #1c1c1e;
}

.customer-item-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
}

.selected-card {
    border: 1.5px solid #ff9500;
    box-shadow: 0 6px 16px rgba(255, 149, 0, 0.2);
}

/* ==================== 상세 정보 카드 ==================== */
.detail-card {
    min-height: 160px;
    max-height: 380px;
    overflow-y: auto;
    padding: 14px;
    border-radius: 14px;
    background-color: #fefefe;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.scroll-area.detail-area {
    max-height: 360px;
}

/* ==================== HISTORY 카드 ==================== */
.history-card {
    border-radius: 12px;
    background-color: #fefefe;
    padding: 14px;
    margin-bottom: 16px;
    transition: box-shadow 0.2s;
}

.history-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* ==================== 라벨 / 텍스트 ==================== */
.label {
    font-size: 0.65rem;
    color: #8e8e93;
    margin-bottom: 2px;
    font-weight: 500;
}

.info-text {
    font-size: 0.85rem;
    color: #1c1c1e;
    line-height: 1.3;
}

/* ==================== 모달 ==================== */
.modal-card {
    border-radius: 18px;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
    background-color: #ffffff;
    padding: 24px 20px;
}

.modal-title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 20px;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1c1c1e;
}

.modal-subtitle {
    font-size: 0.8rem;
    color: #8e8e93;
    margin-top: 4px;
}

:deep(.modal-input) .v-field__control {
    background-color: #f8f8f8 !important;
    border-radius: 10px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
    padding: 6px 10px !important;
    font-size: 0.85rem;
}

.modal-actions {
    margin-top: 12px;
}

.cancel-btn {
    font-size: 0.75rem;
    min-height: 28px;
    padding: 4px 12px;
    border-radius: 10px;
}

.cancel-btn:hover {
    background-color: #f2f2f7;
}

.add-btn {
    font-size: 0.75rem;
    min-height: 28px;
    padding: 4px 12px;
    border-radius: 10px;
}

.add-btn:hover {
    box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
    transform: translateY(-1px);
}

/* ==================== 즐겨찾기 별 UX ==================== */
.v-icon.cursor-pointer {
    transition: transform 0.2s, color 0.2s;
}

.v-icon.cursor-pointer:hover {
    transform: scale(1.15);
}

/* ==================== 중앙 컬럼 input / 버튼 ==================== */
.v-text-field.flex-grow-1 {
    font-size: 0.85rem;
}

.v-btn {
    font-size: 0.75rem;
    min-height: 28px;
    padding: 4px 10px;
}

/* ==================== 연필 아이콘 ==================== */
.pencil {
    font-size: 1.4rem;
    color: #8e8e93;
    transition: color 0.2s;
}

.pencil:hover {
    color: #111;
}
</style>