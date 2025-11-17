<template>
    <v-container fluid class="pa-0 full-height">
        <v-row no-gutters class="full-height">

        <!-- ==================== 좌측 사이드바 ==================== -->
        <v-col cols="12" md="2" class="pa-4 sidebar">
            <v-card class="pa-6 sidebar-card" flat>
            <v-text-field
                v-model="search"
                append-inner-icon="mdi-magnify"
                label="검색"
                variant="outlined"
                hide-details
                density="comfortable"
                class="mb-4 sidebar-input"
            />
            <div class="status-label mb-2">사업 유형</div>
            <v-checkbox
                v-for="(option, index) in options"
                :key="index"
                v-model="option.value"
                :label="option.label"
                class="my-0 sidebar-checkbox"
                density="compact"
            />
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
            <v-col
                v-for="(customer, index) in potentialCustomers"
                :key="index"
                cols="12"
                sm="6"
                md="4"
            >
                <v-card outlined class="pa-4 customer-card">
                <v-card-title class="customer-title text-center">{{ customer.company }}</v-card-title>
                <v-divider class="my-2" />
                <v-card-text class="pa-0">
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">산업 유형</v-col>
                    <v-col cols="7">{{ customer.industry }}</v-col>
                    </v-row>
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">담당자</v-col>
                    <v-col cols="7">{{ customer.owner }}</v-col>
                    </v-row>
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">층 수</v-col>
                    <v-col cols="7">{{ customer.floor }}</v-col>
                    </v-row>
                    <v-row dense>
                    <v-col cols="5" class="label">계약 상태</v-col>
                    <v-col cols="7">
                        <span :class="customer.status === '활성' ? 'status-active' : 'status-ended'">
                        {{ customer.status }}
                        </span>
                    </v-col>
                    </v-row>
                </v-card-text>
                </v-card>
            </v-col>
            </v-row>

        </v-col>
        </v-row>

        <!-- ==================== 고객사 추가 모달 ==================== -->
        <v-dialog v-model="showModal" max-width="500">
            <v-card class="pa-6 modal-card">

                <!-- 타이틀 + 설명 -->
                <v-card-title class="text-center modal-title-container">
                <div class="modal-title">고객사 추가</div>
                <div class="modal-subtitle">새로운 고객사 정보를 입력해주세요.</div>
                </v-card-title>

                <v-card-text>
                <v-text-field v-model="form.company" label="고객사명" variant="outlined" class="modal-input"/>
                <v-text-field v-model="form.owner" label="담당자명" variant="outlined" class="modal-input"/>
                <v-text-field v-model="form.phone" label="연락처" variant="outlined" class="modal-input"/>
                <v-text-field v-model="form.email" label="이메일" variant="outlined" class="modal-input"/>

                <!-- 달력 입력 필드 -->
                <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                    <template #activator="{ props }">
                    <v-text-field
                        v-model="form.lastMeeting"
                        label="최근 미팅일"
                        readonly
                        v-bind="props"
                        variant="outlined"
                        class="modal-input"
                    ></v-text-field>
                    </template>
                    <v-date-picker
                    v-model="form.lastMeeting"
                    no-title
                    scrollable
                    @input="menu = false"
                    ></v-date-picker>
                </v-menu>
                </v-card-text>

                <v-card-actions class="justify-end modal-actions">
                <v-btn text color="grey darken-1" class="cancel-btn" @click="showModal = false">취소</v-btn>
                <v-btn color="orange darken-2" class="white--text add-btn" @click="addCustomer">추가</v-btn>
                </v-card-actions>

            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { reactive, ref } from 'vue'

const search = reactive('')
const options = reactive([
    { label: '패션', value: false },
    { label: '뷰티', value: false },
    { label: 'F&B', value: false },
    { label: '라이프 스타일', value: false }
])

const potentialCustomers = reactive([
    { company: '디올', industry: '패션', owner: '김민수', floor: 3, status: '활성' },
    { company: '에르메스', industry: '럭셔리', owner: '박영희', floor: 2, status: '종료' },
    { company: '샤넬', industry: '패션', owner: '이영희', floor: 4, status: '활성' }
])

const showModal = ref(false)
const menu = ref(false) // 달력 메뉴 상태
const form = reactive({ company: '', owner: '', phone: '', email: '', lastMeeting: '' })

const addCustomer = () => {
    potentialCustomers.push({
        company: form.company,
        owner: form.owner,
        phone: form.phone,
        email: form.email,
        lastMeeting: form.lastMeeting,
        industry: '미정',
        floor: 1,
        status: '활성'
    })
    showModal.value = false
    Object.keys(form).forEach(k => form[k] = '')
}
</script>

<style scoped>
/* ==================== 사이드바 ==================== */
.sidebar-card {
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    padding: 24px;
    height: 100%;
    transition: all 0.2s ease-in-out;
}
.sidebar-card:hover { box-shadow: 0 10px 28px rgba(0,0,0,0.12); }

.status-label { font-weight: 600; color: #555; font-size: 14px; margin-bottom: 8px; }
.sidebar-input { background-color: #fff; border-radius: 8px; }
.sidebar-checkbox { margin:0 !important; padding:0 !important; min-height:18px !important; font-size:0.7rem !important; }
.sidebar-checkbox :deep(.v-input--selection-controls__ripple) { width:14px !important; height:14px !important; }
.sidebar-checkbox :deep(.v-label) { font-size:0.7rem !important; line-height:14px !important; padding-left:4px !important; }

/* ==================== 고객사 카드 ==================== */
.customer-card {
    transition: box-shadow 0.3s, transform 0.2s;
    font-size: 0.9rem;
    border-radius: 12px;
    padding: 16px;
}
.customer-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.12); transform: translateY(-2px); }
.customer-title { font-size: 1.2rem; font-weight:700; margin-bottom:0; }
.label { font-weight:500; color:#888; }
.status-active { color:green; font-weight:600; }
.status-ended { color:red; font-weight:600; }

/* ==================== 모달 ==================== */
.modal-card {
    border-radius: 20px;
    box-shadow: 0 12px 28px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.modal-title-container {
    display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:24px;
}
.modal-title { font-size:1.6rem; font-weight:700; color:#111; }
.modal-subtitle { font-size:0.85rem; color:#888; margin-top:4px; }

/* 모달 input 배경 흰색 적용 */
:deep(.modal-input) :deep(.v-field),
:deep(.modal-input) :deep(.v-field__control) {
    background-color: #ffffff !important;
    border-radius: 12px;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
}

.modal-actions { margin-top:12px; }
.cancel-btn { font-weight:500; transition:0.2s; }
.cancel-btn:hover { background-color:#f0f0f0; border-radius:12px; }
.add-btn { font-weight:600; transition:0.2s; }
.add-btn:hover { box-shadow:0 4px 12px rgba(251,140,0,0.4); transform:translateY(-2px); }
</style>
