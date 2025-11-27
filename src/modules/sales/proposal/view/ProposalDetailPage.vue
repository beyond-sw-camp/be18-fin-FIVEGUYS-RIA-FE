<template>
    <v-container fluid class="pa-6 page-wrapper">
        <div class="page-title mb-6">제안 상세</div>

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
            {{ snackbarMessage }}
        </v-snackbar>


        <v-card elevation="3" class="project-card pa-8">
            <div class="section-title mb-6">제안 정보</div>

            <v-row dense>
                <!-- 제안명 -->
                <v-col cols="12" md="6">
                    <div class="input-label">제안명</div>
                    <v-text-field v-model="form.projectName" placeholder="제안명을 입력하세요" variant="outlined"
                        class="input-field" hide-details :readonly="!editMode" />
                </v-col>

                <!-- 고객사 -->
                <v-col cols="12" md="6">
                    <div class="input-label">고객사</div>
                    <v-text-field v-model="form.clientCompany" placeholder="고객사를 선택하세요" variant="outlined"
                        class="input-field" hide-details readonly @click="editMode && (companyDialog = true)" />
                </v-col>

                <!-- 영업 기회 -->
                <v-col cols="12" md="6">
                    <div class="input-label">영업 기회</div>
                    <v-text-field v-model="form.projectType" placeholder="영업 기회를 선택하세요" variant="outlined"
                        class="input-field" hide-details :readonly="!editMode"
                        @click="editMode && (opportunityDialog = true)" />
                </v-col>

                <!-- 고객 -->
                <v-col cols="12" md="6">
                    <div class="input-label">고객</div>
                    <v-text-field v-model="form.clientOwner" placeholder="고객을 선택하세요" variant="outlined"
                        class="input-field" hide-details :readonly="!editMode"
                        @click="editMode && (clientDialog = true)" />
                </v-col>

                <!-- 내용 -->
                <v-col cols="12">
                    <div class="input-label">내용</div>
                    <v-textarea v-model="form.content" placeholder="내용을 입력하세요" variant="outlined" class="input-field"
                        hide-details :readonly="!editMode" rows="4" />
                </v-col>

                <!-- 요청일 -->
                <v-col cols="12" md="3">
                    <div class="input-label">요청일</div>
                    <v-menu v-model="startMenu" :close-on-content-click="false" offset-y :disabled="!editMode">
                        <template #activator="{ props }">
                            <v-text-field v-model="form.startDate" placeholder="요청일" variant="outlined" hide-details
                                readonly v-bind="props" class="input-field" />
                        </template>
                        <v-date-picker v-model="form.startDate" @update:model-value="startMenu = false" />
                    </v-menu>
                </v-col>

                <!-- 제출일 -->
                <v-col cols="12" md="3">
                    <div class="input-label">제출일</div>
                    <v-menu v-model="endMenu" :close-on-content-click="false" offset-y :disabled="!editMode">
                        <template #activator="{ props }">
                            <v-text-field v-model="form.endDate" placeholder="제출일" variant="outlined" hide-details
                                readonly v-bind="props" class="input-field" />
                        </template>
                        <v-date-picker v-model="form.endDate" @update:model-value="endMenu = false" />
                    </v-menu>
                </v-col>

                <!-- 담당자 -->
                <v-col cols="12" md="6">
                    <div class="input-label">담당자</div>
                    <v-text-field v-model="form.salesManager" placeholder="담당자를 선택하세요" variant="outlined"
                        class="input-field" hide-details :readonly="!editMode"
                        @click="editMode && (managerDialog = true)" />
                </v-col>

                <!-- 비고 -->
                <v-col cols="12">
                    <div class="input-label">비고</div>
                    <v-textarea v-model="form.notes" placeholder="비고를 입력하세요" variant="outlined" class="input-field"
                        hide-details :readonly="!editMode" rows="4" />
                </v-col>
            </v-row>

            <!-- 버튼 그룹 -->
            <div class="text-right mt-8">
                <div v-if="!editMode" class="d-flex justify-end gap-3">
                    <v-btn color="orange darken-2" class="white--text px-6" rounded="lg" elevation="2"
                        @click="editMode = true">
                        편집
                    </v-btn>
                    <v-btn color="red darken-2" class="white--text px-6" rounded="lg" elevation="2"
                        @click="onDeleteProposal">
                        삭제
                    </v-btn>

                </div>
                <div v-else class="d-flex justify-end gap-3">
                    <v-btn color="orange darken-2" class="white--text px-6" rounded="lg" elevation="2"
                        @click="saveProposal">
                        저장
                    </v-btn>
                    <v-btn color="grey darken-1" class="white--text px-6" rounded="lg" elevation="2"
                        @click="cancelEdit">
                        취소
                    </v-btn>
                </div>
            </div>
        </v-card>

        <!-- 고객사 선택 모달 -->
        <v-dialog v-model="companyDialog" width="500">
            <v-card class="pa-4">
                <div class="dialog-title mb-4">고객사 선택</div>

                <!-- 타입 필터 -->
                <div class="mb-3 d-flex">
                    <v-chip class="mr-2" :color="clientTypeFilter === 'ALL' ? 'orange darken-2' : undefined"
                        :text-color="clientTypeFilter === 'ALL' ? 'white' : undefined"
                        @click="clientTypeFilter = 'ALL'">
                        전체
                    </v-chip>

                    <v-chip class="mr-2" :color="clientTypeFilter === 'CLIENT' ? 'orange darken-2' : undefined"
                        :text-color="clientTypeFilter === 'CLIENT' ? 'white' : undefined"
                        @click="clientTypeFilter = 'CLIENT'">
                        고객사
                    </v-chip>

                    <v-chip :color="clientTypeFilter === 'LEAD' ? 'orange darken-2' : undefined"
                        :text-color="clientTypeFilter === 'LEAD' ? 'white' : undefined"
                        @click="clientTypeFilter = 'LEAD'">
                        잠재고객사
                    </v-chip>
                </div>

                <!-- 검색 -->
                <v-text-field v-model="clientSearch" placeholder="고객사명을 입력하세요" prepend-inner-icon="mdi-magnify"
                    variant="outlined" hide-details class="mb-4" />

                <!-- 고객사 목록 -->
                <v-list>
                    <v-list-item v-for="item in filteredCompanies" :key="item.id" @click="selectCompany(item)"
                        class="dialog-item">
                        {{ item.name }}
                    </v-list-item>
                </v-list>
            </v-card>
        </v-dialog>

        <!-- 고객 모달 -->
        <!-- 고객 모달 -->
        <v-dialog v-model="clientDialog" width="500">
            <v-card class="pa-4">
                <div class="dialog-title mb-4">고객 선택</div>

                <!-- 검색 인풋: clientPersonSearch로 변경 -->
                <v-text-field v-model="clientPersonSearch" placeholder="고객명을 입력하세요" prepend-inner-icon="mdi-magnify"
                    variant="outlined" hide-details class="mb-4" />

                <!-- 실제 내려온 리스트 렌더링 -->
                <v-list>
                    <v-list-item v-for="p in filteredClientPersons" :key="p.id" @click="selectClient(p)"
                        class="dialog-item">
                        {{ p.name }}
                    </v-list-item>
                </v-list>
            </v-card>
        </v-dialog>


        <!-- 프로젝트(영업 기회) 모달 -->
        <v-dialog v-model="opportunityDialog" width="500">
            <v-card class="pa-4">
                <div class="dialog-title mb-4">영업 기회 선택</div>
                <v-list>
                    <v-list-item v-for="o in opportunityList" :key="o.id" @click="selectOpportunity(o)"
                        class="dialog-item">
                        {{ o.name }}
                    </v-list-item>
                </v-list>
            </v-card>
        </v-dialog>

        <!-- 담당자 모달 -->
        <v-dialog v-model="managerDialog" width="500">
            <v-card class="pa-4">
                <div class="dialog-title mb-4">담당자 선택</div>
                <v-list>
                    <v-list-item v-for="m in managerList" :key="m" @click="selectManager(m)" class="dialog-item">
                        {{ m }}
                    </v-list-item>
                </v-list>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import {
    createProposal,
    getProposalDetail,
    updateProposal,
    deleteProposal as deleteProposalApi,
} from '@/apis/proposal'

import { getProjectTitles, getProjectMeta } from '@/apis/project'
import {
    getSimpleClientCompanies,
    getSimpleClientsByCompany,
} from '@/apis/client'


const router = useRouter()
const route = useRoute()

// 편집 모드
const editMode = ref(false)

// 공통 상태
const startMenu = ref(false)
const endMenu = ref(false)

const companyDialog = ref(false)      // 고객사 모달
const clientDialog = ref(false)       // 고객(담당자) 모달
const opportunityDialog = ref(false)  // 영업기회 모달
const managerDialog = ref(false)      // 담당자 모달

const clientSearch = ref('')
const clientTypeFilter = ref('ALL')   // ALL / CLIENT / LEAD
const clientPersonSearch = ref('')

// 폼
const form = reactive({
    projectName: '',
    projectId: null,
    projectType: '',
    clientCompanyId: null,
    clientCompany: '',
    clientId: null,
    clientOwner: '',
    startDate: '',
    endDate: '',
    content: '',
    notes: '',
    salesManager: '',
})

// ───────────────── 영업기회 리스트 ─────────────────
const opportunityList = ref([])

const fetchProjectTitles = async (keyword = '') => {
    const { data } = await getProjectTitles(keyword)
    opportunityList.value = data.map((p) => ({
        id: p.projectId,
        name: p.projectTitle,
    }))
}

watch(opportunityDialog, (open) => {
    if (open) fetchProjectTitles()
})

const selectOpportunity = async (o) => {
    form.projectId = o.id
    form.projectType = o.name

    const { data } = await getProjectMeta(o.id)
    // { projectId, projectName, clientCompanyId, clientCompanyName, clientId, clientName }

    form.projectId = data.projectId
    form.projectType = data.projectName
    form.clientCompanyId = data.clientCompanyId
    form.clientCompany = data.clientCompanyName
    form.clientId = data.clientId
    form.clientOwner = data.clientName

    opportunityDialog.value = false
}

// ───────────────── 고객사 리스트 ─────────────────
const companyPage = ref(1)
const companyPageSize = ref(10)
const companyTotalCount = ref(0)

const companyList = ref([])

const loadCompanies = async () => {
    const params = {
        page: companyPage.value,
        size: companyPageSize.value,
    }

    if (clientTypeFilter.value && clientTypeFilter.value !== 'ALL') {
        params.type = clientTypeFilter.value
    }
    if (clientSearch.value.trim()) {
        params.keyword = clientSearch.value.trim()
    }

    const res = await getSimpleClientCompanies(params)
    companyList.value = res.data.content || []
    companyTotalCount.value = res.data.totalCount || 0
}

const filteredCompanies = computed(() =>
    (companyList.value || []).filter((c) =>
        c.name?.includes(clientSearch.value),
    ),
)

watch(companyDialog, (open) => {
    if (open) {
        companyPage.value = 1
        loadCompanies()
    }
})

watch([clientTypeFilter, clientSearch], () => {
    if (companyDialog.value) {
        companyPage.value = 1
        loadCompanies()
    }
})

const selectCompany = (item) => {
    form.clientCompanyId = item.id
    form.clientCompany = item.name

    form.clientId = null
    form.clientOwner = ''
    clientPersonSearch.value = ''
    clientList.value = []

    companyDialog.value = false
    loadClientsByCompany(item.id)
}

// ───────────────── 고객(담당자) 리스트 ─────────────────
const clientList = ref([])

const loadClientsByCompany = async (companyId) => {
    if (!companyId) return

    const params = { page: 1, size: 50 }
    if (clientPersonSearch.value.trim()) {
        params.keyword = clientPersonSearch.value.trim()
    }

    const res = await getSimpleClientsByCompany(companyId, params)
    clientList.value = res.data.content || []
}

const filteredClientPersons = computed(() =>
    (clientList.value || []).filter((p) =>
        p.name?.includes(clientPersonSearch.value),
    ),
)

watch(clientDialog, (open) => {
    if (open && form.clientCompanyId) {
        clientPersonSearch.value = ''
        loadClientsByCompany(form.clientCompanyId)
    }
})

watch(clientPersonSearch, () => {
    if (clientDialog.value && form.clientCompanyId) {
        loadClientsByCompany(form.clientCompanyId)
    }
})

const selectClient = (p) => {
    form.clientId = p.id
    form.clientOwner = p.name
    clientDialog.value = false
}

// ───────────────── 담당자(간단 버전) ─────────────────
const managerList = ref(['박팀장', '최팀장', '장팀장'])

const selectManager = (m) => {
    form.salesManager = m
    managerDialog.value = false
}
const showSuccess = (msg = '저장이 완료되었습니다.') => {
    snackbarMessage.value = msg
    snackbarColor.value = 'green'
    snackbar.value = true
}

// ───────────────── 날짜 유틸 ─────────────────
const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// ───────────────── 저장 / 편집 ─────────────────
const saveProposal = async () => {
    const payload = {
        title: form.projectName,
        clientCompanyId: form.clientCompanyId,
        clientId: form.clientId,
        projectId: form.projectId,
        data: form.content,
        requestDate: form.startDate || null,
        submitDate: form.endDate || null,
        remark: form.notes || null,
    }

    const id = route.params.id

    try {
        await updateProposal(id, payload)

        showSuccess('제안서 저장이 완료되었습니다.')

        editMode.value = false
        await loadDetail()
    } catch (err) {
        showError(err)
        editMode.value = false
    }
}



const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('red')

const showError = (err) => {
    const message =
        err?.response?.data?.message ||
        "요청 처리 중 오류가 발생했습니다."

    snackbarMessage.value = message
    snackbarColor.value = 'red'
    snackbar.value = true
}


const onDeleteProposal = async () => {
    const id = route.params.id
    if (!id) return

    const ok = window.confirm('제안을 삭제하시겠습니까?')
    if (!ok) return

    try {
        await deleteProposalApi(id)

        showSuccess('제안이 삭제되었습니다.')
        router.push({ name: 'Proposal' }) // 제안 목록 라우트 이름/경로에 맞게 조정
    } catch (err) {
        showError(err)
    }
}


const loadDetail = async () => {
    const id = route.params.id
    const { data } = await getProposalDetail(id)

    // 백엔드 DTO 필드 → 폼 매핑
    form.projectName = data.title           // 제안명
    form.projectId = data.projectId
    form.projectType = data.projectTitle || ''
    form.clientCompanyId = data.clientCompanyId
    form.clientCompany = data.clientCompanyName
    form.clientId = data.clientId
    form.clientOwner = data.clientName
    form.startDate = data.requestDate
    form.endDate = data.submitDate
    form.content = data.data
    form.notes = data.remark
    form.salesManager = data.createdUserName
}

const cancelEdit = async () => {
    await loadDetail()
    editMode.value = false
}

// 초기 로딩
onMounted(loadDetail)
</script>




<style scoped>
.page-wrapper {
    background: #fefefe;
    min-height: 100vh;
}

.page-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: #111;
}

.project-card {
    border-radius: 16px;
    background: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111;
}

.input-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #222;
    margin-bottom: 6px;
}

.input-field {
    border-radius: 12px;
    background: #fff;
}

.dialog-title {
    font-size: 1.2rem;
    font-weight: 600;
}

.dialog-item {
    padding: 12px 16px;
    cursor: pointer;
    border-radius: 8px;
}

.dialog-item:hover {
    background: #f9f9f9;
}

.company-button {
    padding: 12px 16px;
    margin-bottom: 8px;
    background: #f3f3f3;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    display: block;
}

.company-button:hover {
    background: #e8e8e8;
}
</style>