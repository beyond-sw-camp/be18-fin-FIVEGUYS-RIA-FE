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
            <!-- 필터 -->
            <v-select
                v-model="category"
                :items="['뷰티', '서비스', '패션']"
                label="카테고리"
                variant="outlined"
                hide-details
                density="comfortable"
                class="mb-6 sidebar-input"
            ></v-select>

            <v-select
                v-model="contractStatus"
                :items="['활성', '종료']"
                label="계약 상태"
                variant="outlined"
                hide-details
                density="comfortable"
                class="mb-6 sidebar-input"
            ></v-select>

            <v-select
                v-model="floor"
                :items="['B1', '1F', '2F']"
                label="층"
                variant="outlined"
                hide-details
                density="comfortable"
                class="mb-6 sidebar-input"
            ></v-select>
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
                v-for="(client, index) in clients"
                :key="index"
                cols="12"
                sm="6"
                md="3"
            >
                <v-card outlined class="pa-4 client-card" @click="goToClientCompanyDetail(client.id)">
                <v-card-title class="client-title text-center">{{ client.company }}</v-card-title>
                <v-divider class="my-2" />
                <v-card-text class="pa-0">
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">산업 유형</v-col>
                    <v-col cols="7">{{ client.industry }}</v-col>
                    </v-row>
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">담당자</v-col>
                    <v-col cols="7">{{ client.owner }}</v-col>
                    </v-row>
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">층 수</v-col>
                    <v-col cols="7">{{ client.floor }}</v-col>
                    </v-row>
                    <v-row dense>
                    <v-col cols="5" class="label">계약 상태</v-col>
                    <v-col cols="7">
                        <span :class="client.status === '활성' ? 'status-active' : 'status-ended'">
                        {{ client.status }}
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
                <v-btn color="orange darken-2" class="white--text add-btn" @click="addClient">추가</v-btn>
                </v-card-actions>

            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const search = reactive('')

const category = ref('')
const contractStatus = ref('')
const floor = ref('')

const clients = reactive([
    { id: 1, company: '디올', industry: '패션', owner: '김민수', floor: '1F', status: '활성' },
    { id: 2, company: '에르메스', industry: '럭셔리', owner: '박영희', floor: '1F', status: '종료' },
    { id: 3, company: '샤넬', industry: '패션', owner: '이영희', floor: '2F', status: '활성' }
])

const showModal = ref(false)
const menu = ref(false)
const form = reactive({ company: '', owner: '', phone: '', email: '', lastMeeting: '' })

const addClient = () => {
    clients.push({
        id: clients.length + 1,
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
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    padding: 24px;
    height: 100%;
    transition: all 0.2s ease-in-out;
}
.sidebar-card:hover {
    box-shadow: 0 10px 28px rgba(0,0,0,0.12);
}

.sidebar-input {
    background-color: #fff;
    border-radius: 8px;
}

/* 고객사 카드 → client-card */
.client-card {
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    font-size: 0.9rem;
    transition: box-shadow 0.3s, transform 0.2s;
}
.client-card:hover {
    box-shadow: 0 8px 28px rgba(0,0,0,0.12);
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
}

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
    box-shadow: 0 12px 28px rgba(0,0,0,0.15);
}

:deep(.modal-input .v-field),
:deep(.modal-input .v-field__control) {
    background-color: #ffffff !important;
    border-radius: 12px;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
}
</style>
