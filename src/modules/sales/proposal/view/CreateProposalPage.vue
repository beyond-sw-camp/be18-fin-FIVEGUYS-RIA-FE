<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 페이지 타이틀 -->
    <div class="page-title">새 제안 추가</div>

    <!-- 카드 -->
    <v-card elevation="1" class="project-card">
      <div class="section-title">제안 정보</div>

      <v-row dense class="container">
        <!-- 제안명 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안명</div>
          <v-text-field v-model="form.projectName" placeholder="제안명을 입력하세요" variant="outlined" class="input-field"
            density="compact" hide-details />
        </v-col>

        <!-- 영업 기회 -->
        <v-col cols="12" md="6">
          <div class="input-label">영업 기회</div>
          <v-text-field v-model="form.projectType" placeholder="영업 기회를 선택하세요" variant="outlined" class="input-field"
            density="compact" hide-details readonly @click="opportunityDialog = true" />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field v-model="form.clientCompany" placeholder="고객사를 선택하세요" variant="outlined" class="input-field"
            density="compact" hide-details readonly @click="clientDialog = true" />
        </v-col>

        <!-- 고객(담당자) -->
        <v-col cols="12" md="6">
          <div class="input-label">고객 담당자</div>
          <v-text-field v-model="form.client" placeholder="고객 담당자를 선택하세요" variant="outlined" class="input-field"
            density="compact" hide-details readonly @click="clientPersonDialog = true" />
        </v-col>

        <!-- 내용 -->
        <v-col cols="12">
          <div class="input-label">내용</div>
          <v-textarea v-model="form.content" placeholder="내용을 입력하세요" variant="outlined" class="input-field"
            density="compact" hide-details rows="4" />
        </v-col>

        <!-- 요청일 -->
        <v-col cols="12" md="3">
          <div class="input-label">요청일</div>
          <v-menu v-model="startMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field :model-value="formatDate(form.startDate)" placeholder="요청일" variant="outlined"
                class="input-field" density="compact" hide-details readonly v-bind="props" />
            </template>
            <v-date-picker v-model="form.startDate" @update:model-value="startMenu = false" />
          </v-menu>
        </v-col>

        <!-- 제출일 -->
        <v-col cols="12" md="3">
          <div class="input-label">제출일</div>
          <v-menu v-model="endMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field :model-value="formatDate(form.endDate)" placeholder="제출일" variant="outlined"
                class="input-field" density="compact" hide-details readonly v-bind="props" />
            </template>
            </v-list>
        </v-card>
        </v-dialog>

        <!-- 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea v-model="form.notes" placeholder="비고를 입력하세요" variant="outlined" class="input-field"
            density="compact" hide-details rows="3" />
        </v-col>
      </v-row>

      <!-- 저장 버튼 -->
      <div class="actions-row">
        <v-btn color="orange darken-2" class="white--text px-5" size="small" rounded="lg" elevation="1"
          @click="saveProposal">
          저장
        </v-btn>
      </div>
    </v-card>

    <!-- 고객사 선택 모달 -->
    <v-dialog v-model="clientDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객사 선택</div>

        <div class="mb-3 d-flex">
          <v-chip class="mr-2" :color="clientTypeFilter === 'ALL' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'ALL' ? 'white' : undefined" @click="clientTypeFilter = 'ALL'">
            전체
          </v-chip>
          <v-chip class="mr-2" :color="clientTypeFilter === 'CLIENT' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'CLIENT' ? 'white' : undefined" @click="clientTypeFilter = 'CLIENT'">
            고객사
          </v-chip>
          <v-chip :color="clientTypeFilter === 'LEAD' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'LEAD' ? 'white' : undefined" @click="clientTypeFilter = 'LEAD'">
            잠재고객사
          </v-chip>
        </div>

        <v-text-field v-model="clientSearch" placeholder="고객사명을 입력하세요" prepend-inner-icon="mdi-magnify"
          variant="outlined" density="compact" hide-details class="mb-4" />

        <v-list>
          <v-list-item v-for="item in filteredClients" :key="item.id" @click="selectClient(item)" class="dialog-item">
            {{ item.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 고객 담당자 선택 모달 -->
    <v-dialog v-model="clientPersonDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객 담당자 선택</div>

        <v-text-field v-model="clientPersonSearch" placeholder="검색" prepend-inner-icon="mdi-magnify" variant="outlined"
          density="compact" hide-details class="mb-4" />

        <v-list>
          <v-list-item v-for="p in filteredClientPersons" :key="p.id" @click="selectClientPerson(p)"
            class="dialog-item">
            {{ p.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 영업 기회 모달 -->
    <v-dialog v-model="opportunityDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">영업 기회 선택</div>

        <v-text-field v-model="opportunitySearch" placeholder="검색" prepend-inner-icon="mdi-magnify" variant="outlined"
          density="compact" hide-details class="mb-4" />

        <v-list>
          <v-list-item v-for="o in filteredOpportunities" :key="o.id" @click="selectOpportunity(o)" class="dialog-item">
            {{ o.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createProposal } from '@/apis/proposal'
import { getProjectTitles, getProjectMeta } from '@/apis/project'
import { getSimpleClientCompanies } from '@/apis/client'
import { getSimpleClientsByCompany } from '@/apis/client'

const router = useRouter()

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('red')

const showError = (err, fallbackMessage = '요청 처리 중 오류가 발생했습니다.') => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.errorMessage ||
    fallbackMessage

  snackbarMessage.value = msg
  snackbarColor.value = 'red'
  snackbar.value = true
}

const showSuccess = (msg = '제안이 생성되었습니다.') => {
  snackbarMessage.value = msg
  snackbarColor.value = 'green'
  snackbar.value = true
}

const startMenu = ref(false)
const endMenu = ref(false)

const clientDialog = ref(false)
const clientPersonDialog = ref(false)
const opportunityDialog = ref(false)

const clientSearch = ref('')
const clientPersonSearch = ref('')
const opportunitySearch = ref('')

// 고객사 타입 필터
const clientTypeFilter = ref('ALL')

// 페이지네이션 (필요하면 UI 추가)
const clientPage = ref(1)
const clientPageSize = ref(10)

// 고객사 목록
const clientList = ref([])

// 고객 담당자 목록
const clientPersonList = ref([])

// 영업 기회 목록
const opportunityList = ref([])

// 폼
const form = reactive({
  projectName: '',
  projectId: null,
  projectType: '',
  clientCompany: '',
  clientCompanyId: null,
  client: '',
  clientId: null,
  startDate: null,
  endDate: null,
  content: '',
  notes: '',
})

/**
 * 고객사 로딩
 */
const loadClients = async () => {
  const params = {
    page: clientPage.value,
    size: clientPageSize.value,
  }

  if (clientTypeFilter.value && clientTypeFilter.value !== 'ALL') {
    params.type = clientTypeFilter.value
  }

  if (clientSearch.value.trim()) {
    params.keyword = clientSearch.value.trim()
  }

  const res = await getSimpleClientCompanies(params)
  clientList.value = res.data.content || []
}

const filteredClients = computed(() =>
  clientList.value.filter((c) => c.name.includes(clientSearch.value)),
)

watch(clientDialog, (open) => {
  if (open) {
    clientPage.value = 1
    loadClients()
  }
})

watch([clientTypeFilter, clientSearch], () => {
  if (clientDialog.value) {
    clientPage.value = 1
    loadClients()
  }
})

/**
 * 고객 담당자 로딩
 */
const loadClientPersons = async (companyId) => {
  if (!companyId) return

  const params = {
    page: 1,
    size: 50,
  }

  if (clientPersonSearch.value.trim()) {
    params.keyword = clientPersonSearch.value.trim()
  }

  const res = await getSimpleClientsByCompany(companyId, params)
  clientPersonList.value = res.data.content || []
}

watch(clientPersonDialog, (open) => {
  if (open && form.clientCompanyId) {
    clientPersonSearch.value = ''
    loadClientPersons(form.clientCompanyId)
  }
})

watch(clientPersonSearch, () => {
  if (!form.clientCompanyId) return
  if (!clientPersonDialog.value) return
  loadClientPersons(form.clientCompanyId)
})

const filteredClientPersons = computed(() => clientPersonList.value)

/**
 * 영업 기회 로딩
 */
const loadOpportunities = async () => {
  const { data } = await getProjectTitles(opportunitySearch.value || '')
  opportunityList.value = data.map((p) => ({
    id: p.projectId,
    name: p.projectTitle,
  }))
}

watch(opportunityDialog, (open) => {
  if (open) {
    opportunitySearch.value = ''
    loadOpportunities()
  }
})

watch(opportunitySearch, () => {
  if (opportunityDialog.value) {
    loadOpportunities()
  }
})

const filteredOpportunities = computed(() =>
  opportunityList.value.filter((o) => o.name.includes(opportunitySearch.value)),
)

/**
 * 선택 핸들러
 */
const selectClient = (item) => {
  form.clientCompany = item.name
  form.clientCompanyId = item.id

  form.client = ''
  form.clientId = null
  clientPersonSearch.value = ''
  clientPersonList.value = []

  clientDialog.value = false

  loadClientPersons(item.id)
}

const selectClientPerson = (p) => {
  form.client = p.name
  form.clientId = p.id
  clientPersonDialog.value = false
}

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
  form.client = data.clientName

  clientPersonList.value = []
  if (data.clientCompanyId) {
    await loadClientPersons(data.clientCompanyId)
  }

  opportunityDialog.value = false
}

/**
 * 유틸
 */
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const toLocalDateString = (date) => {
  if (!date) return null
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 저장
 */
const saveProposal = async () => {
  const payload = {
    title: form.projectName,
    clientCompanyId: form.clientCompanyId,
    clientId: form.clientId,
    projectId: form.projectId,
    data: form.content,
    requestDate: toLocalDateString(form.startDate),
    submitDate: toLocalDateString(form.endDate),
    remark: form.notes || null,
  }

  try {
    await createProposal(payload)
    showSuccess()
    router.push({ name: 'Proposal' })
  } catch (err) {
    showError(err, '제안을 생성할 수 없습니다.')
  }
}
</script>

<style scoped>
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
  padding: 16px 24px 24px;
}

.page-title {
  max-width: 1200px;
  margin: 8px auto 16px;
  font-size: 1.4rem;
  font-weight: 700;
  color: #111;
}

.project-card {
  max-width: 1200px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e7e7e7;
  padding: 16px 20px 18px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.input-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 3px;
}

.project-card :deep(.v-col) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.input-field {
  border-radius: 8px !important;
  font-size: 0.9rem;
}

.input-field :deep(.v-field) {
  min-height: 34px !important;
}

.input-field :deep(.v-field__input) {
  padding-top: 3px !important;
  padding-bottom: 3px !important;
}

:deep(textarea) {
  min-height: 52px !important;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-title {
  font-size: 1rem;
  font-weight: 600;
}

.dialog-item {
  padding: 8px 6px !important;
  cursor: pointer;
  font-size: 0.9rem;
}

.dialog-item:hover {
  background: #fff3e0 !important;
}
</style>
