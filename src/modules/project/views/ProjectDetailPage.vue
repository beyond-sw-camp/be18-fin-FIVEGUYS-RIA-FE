<template>
  <v-container fluid class="pa-6 detail-container">

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 상단 제목 -->
    <v-row class="align-center justify-space-between mb-6">
      <v-col cols="auto">
        <h2 class="project-title">{{ form.projectName }}</h2>
        <v-chip :color="project.status === '진행중' ? 'orange darken-2' : 'grey'" size="small" class="mr-2 white--text">
          {{ project.status }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- 파이프라인 -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="pipeline-full">
          <template v-for="(step, i) in project.pipeline" :key="i">
            <div class="pipeline-step" :class="step.completed ? 'completed' : 'pending'"
              @click="changePipelineStage(i + 1)">

              {{ step.name }}
            </div>
            <div v-if="i < project.pipeline.length - 1" class="pipeline-line"
              :class="project.pipeline[i + 1].completed ? 'completed' : 'pending'"></div>
          </template>
          <div class="progress-text">{{ project.progress }}%</div>
        </div>
      </v-col>
    </v-row>

    <v-row dense>
      <!-- 좌측 입력폼 -->
      <v-col cols="12" md="6">
        <v-card class="pa-6 mb-4 project-card" elevation="2">
          <v-card-title class="text-h6 mb-4">프로젝트 정보</v-card-title>
          <v-card-text>
            <v-row dense>
              <!-- 읽기 전용 프로젝트 ID -->
              <!-- <v-col cols="6">
                <div class="input-label">프로젝트 ID</div>
                <v-text-field :model-value="project.id" readonly class="readonly-field input-field" hide-details />
              </v-col> -->

              <!-- 프로젝트명 -->
              <v-col cols="6">
                <div class="input-label">프로젝트명</div>
                <v-text-field v-model="form.projectName" placeholder="프로젝트명을 입력하세요" variant="outlined"
                  class="input-field" hide-details />
              </v-col>

              <!-- 고객사 -->
              <v-col cols="6">
                <div class="input-label">고객사</div>
                <v-text-field v-model="form.clientCompany" placeholder="고객사를 선택하세요" variant="outlined"
                  class="input-field" hide-details readonly @click="clientDialog = true" />
              </v-col>

              <!-- 고객사 담당자 -->
              <v-col cols="6">
                <div class="input-label">고객사 담당자</div>
                <v-text-field v-model="form.client" placeholder="고객사 담당자를 선택하세요" variant="outlined" class="input-field"
                  hide-details readonly @click="clientPersonDialog = true" />
              </v-col>

              <!-- 설명 -->
              <v-col cols="12">
                <div class="input-label">설명(메모)</div>
                <v-textarea v-model="form.description" placeholder="프로젝트 관련 메모를 입력하세요" variant="outlined" rows="3"
                  class="input-field" hide-details />
              </v-col>

              <!-- 영업 담당 -->
              <v-col cols="6">
                <div class="input-label">영업 담당</div>
                <v-text-field v-model="form.salesManager" placeholder="담당 직원을 선택하세요" variant="outlined"
                  class="input-field" hide-details readonly @click="managerDialog = true" />
              </v-col>

              <!-- 유형 -->
              <v-col cols="6">
                <div class="input-label">유형</div>
                <v-select v-model="form.salesType" :items="typeList" placeholder="판매 유형을 선택하세요" variant="outlined"
                  class="input-field" hide-details dense solo />
              </v-col>

              <!-- 상태 (읽기 전용) -->
              <v-col cols="6">
                <div class="input-label">상태</div>
                <v-text-field :model-value="project.status" readonly class="input-field readonly-field" hide-details />
              </v-col>

              <!-- 시작일 -->
              <v-col cols="6">
                <div class="input-label">시작일</div>
                <v-menu v-model="startMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                  min-width="auto">
                  <template #activator="{ props }">
                    <v-text-field :model-value="formattedStartDate" label="시작일" readonly v-bind="props"
                      class="input-field" hide-details />
                  </template>
                  <v-date-picker v-model="form.startDate" @update:model-value="startMenu = false" />
                </v-menu>
              </v-col>

              <!-- 종료일 -->
              <v-col cols="6">
                <div class="input-label">종료일</div>
                <v-menu v-model="endMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                  min-width="auto">
                  <template #activator="{ props }">
                    <v-text-field :model-value="formattedEndDate" label="종료일" readonly v-bind="props"
                      class="input-field" hide-details />
                  </template>
                  <v-date-picker v-model="form.endDate" @update:model-value="endMenu = false" />
                </v-menu>
              </v-col>

              <!-- 예상 매출 -->
              <v-col cols="6">
                <div class="input-label">예상 매출액</div>
                <v-text-field :model-value="formattedRevenue" placeholder="금액을 입력하세요" variant="outlined" suffix="원"
                  class="input-field" hide-details @update:model-value="updateRevenue" />
              </v-col>

              <!-- 마진율 -->
              <v-col cols="6">
                <div class="input-label">예상 마진율</div>
                <v-text-field v-model.number="form.expectedMarginRate" placeholder="0~100" type="number" suffix="%"
                  variant="outlined" class="input-field" hide-details />
              </v-col>

              <!-- 자동계산 예상 이익 -->
              <v-col cols="6">
                <div class="input-label">예상 이익</div>
                <v-text-field :model-value="formattedProfit" readonly variant="outlined"
                  class="input-field result-field" hide-details />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="red darken-2" class="white--text mr-2" small @click="onDeleteProject">
              삭제하기
            </v-btn>
            <v-btn color="orange darken-2" class="white--text" small @click="saveProject">
              저장하기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 우측 제안 카드 영역 -->
      <v-col cols="12" md="6">
        <div class="cards-container">
          <v-card v-for="(card, index) in cards" :key="index" class="mb-4 project-card" elevation="2">
            <v-card-title>{{ card.title }}</v-card-title>
            <v-card-text>
              <div v-if="card.items && card.items.length">
                <v-list dense>
                  <v-list-item v-for="(item, i) in card.items" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.date }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else>{{ card.content }}</div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>

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
          variant="outlined" hide-details class="mb-4" />

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
          hide-details class="mb-4" />

        <v-list>
          <v-list-item v-for="p in filteredClientPersons" :key="p.id" @click="selectClientPerson(p)"
            class="dialog-item">
            {{ p.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 영업 관리자 선택 모달 -->
    <v-dialog v-model="managerDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">영업 관리자 선택</div>

        <v-text-field v-model="managerSearch" placeholder="검색" prepend-inner-icon="mdi-magnify" variant="outlined"
          hide-details class="mb-4" />

        <v-list>
          <v-list-item v-for="m in filteredManagers" :key="m.userId" @click="selectManager(m)" class="dialog-item"
            :class="{ 'selected-item': selectedManagerId === m.userId }">
            <v-list-item-title>{{ m.name }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-card-actions class="justify-end mt-2">
          <v-btn color="orange darken-2" class="white--text" :disabled="!selectedManagerId"
            @click="confirmManagerSelect">
            선택하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {
  reactive,
  ref,
  computed,
  watch,
  onMounted,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getProjectDetail,
  updateProject,
  updateProjectManager,
  deleteProject,
} from '@/apis/project'
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from '@/apis/client'
import { getUserList } from '@/apis/user'
import { updatePipelineStage } from '@/apis/pipeline'

const route = useRoute()
const router = useRouter()
const startMenu = ref(false)
const endMenu = ref(false)

const clientDialog = ref(false)
const managerDialog = ref(false)
const clientPersonDialog = ref(false)

const clientSearch = ref('')
const managerSearch = ref('')
const clientPersonSearch = ref('')

const project = reactive({
  id: null,
  status: '',
  statusCode: '',
  progress: 0,
  pipeline: [],
  pipelineId: null,
})

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

const changePipelineStage = async (targetStageNo) => {
  try {
    if (!project.pipelineId) {
      showError(null, '파이프라인 ID를 찾을 수 없습니다.')
      return
    }

    await updatePipelineStage(project.pipelineId, { targetStageNo })

    const res = await getProjectDetail(project.id)
    applyDetailDto(res.data)

    showSuccess('진행 단계가 변경되었습니다.')
  } catch (err) {
    showError(err, '단계를 변경할 수 없습니다.')
  }
}

const form = reactive({
  projectName: '',
  clientCompany: '',
  clientCompanyId: null,
  client: '',
  clientId: null,
  salesManager: '',
  salesManagerId: null,
  salesType: '',
  startDate: null,
  endDate: null,
  expectedRevenue: null,
  expectedMarginRate: null,
  expectedProfit: null,
  description: '',
})

const showSuccess = (msg = '저장이 완료되었습니다.') => {
  snackbarMessage.value = msg
  snackbarColor.value = 'green'
  snackbar.value = true
}


const cards = ref([])

const clientTypeFilter = ref('ALL')

const clientPage = ref(1)
const clientPageSize = ref(10)
const clientTotalCount = ref(0)
const clientList = ref([])

const clientPersonList = ref([])

const managerList = ref([])
const selectedManagerId = ref(null)

const typeList = ['팝업 스토어', '전시회', '임대']

const translateStatus = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '진행중'
    case 'SUCCESS':
      return '계약 성공'
    case 'FAIL':
      return '실패'
    default:
      return status
  }
}

const toLocalDateString = (date) => {
  if (!date) return null
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`   // 로컬 기준 "YYYY-MM-DD"
}

const translateType = (type) => {
  switch (type) {
    case 'POPUP':
      return '팝업 스토어'
    case 'EXHIBITION':
      return '전시회'
    case 'RENTAL':
      return '임대'
    default:
      return type
  }
}

const mapSalesTypeToEnum = (label) => {
  switch (label) {
    case '팝업 스토어':
      return 'POPUP'
    case '전시회':
      return 'EXHIBITION'
    case '임대':
      return 'RENTAL'
    default:
      return null
  }
}

const applyDetailDto = (dto) => {
  project.id = dto.projectId
  project.statusCode = dto.status
  project.status = translateStatus(dto.status)
  project.progress = dto.pipelineInfo?.progressRate ?? 0
  project.pipeline = (dto.stageList || []).map((s) => ({
    name: s.stageName,
    completed: s.completed === true,
  }))
  project.pipelineId = dto.pipelineInfo?.pipelineId ?? null   // ← 추가

  form.projectName = dto.title
  form.clientCompany = dto.clientCompanyName
  form.client = dto.clientName
  form.description = dto.description || ''
  form.salesManager = dto.salesManagerName
  form.salesType = translateType(dto.type)
  form.startDate = dto.startDay
  form.endDate = dto.endDay
  form.expectedRevenue = dto.expectedRevenue
  form.expectedMarginRate = dto.expectedMarginRate
  form.expectedProfit =
    dto.expectedRevenue && dto.expectedMarginRate
      ? (dto.expectedRevenue * dto.expectedMarginRate) / 100
      : null

  cards.value = [
    {
      title: '제안 목록',
      items: (dto.proposals || []).map((p) => ({
        name: `${p.title} (${p.writerName})`,
        date: p.submitDate || p.requestDate || '',
      })),
    },
  ]
}


const loadClients = async () => {
  const params = {
    page: clientPage.value,
    size: clientPageSize.value,
  }

  if (clientTypeFilter.value !== 'ALL') {
    params.type = clientTypeFilter.value
  }

  if (clientSearch.value.trim()) {
    params.keyword = clientSearch.value.trim()
  }

  const res = await getSimpleClientCompanies(params)
  clientList.value = res.data.content || []
  clientTotalCount.value = res.data.totalCount || 0
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

const loadClientPersons = async (companyId) => {
  if (!companyId) return

  const params = { page: 1, size: 50 }

  if (clientPersonSearch.value.trim()) {
    params.keyword = clientPersonSearch.value.trim()
  }

  const res = await getSimpleClientsByCompany(companyId, params)
  clientPersonList.value = res.data.content || []
}

const filteredClientPersons = computed(() => clientPersonList.value)

watch(clientPersonDialog, (open) => {
  if (open && form.clientCompanyId) {
    clientPersonSearch.value = ''
    loadClientPersons(form.clientCompanyId)
  }
})

watch(clientPersonSearch, () => {
  if (form.clientCompanyId && clientPersonDialog.value) {
    loadClientPersons(form.clientCompanyId)
  }
})

const loadManagers = async () => {
  const res = await getUserList()
  managerList.value = res.data || []
}

watch(managerDialog, async (open) => {
  if (open) {
    managerSearch.value = ''
    selectedManagerId.value = form.salesManagerId
    await loadManagers()
  }
})

const filteredManagers = computed(() =>
  managerList.value.filter((m) =>
    m.name.includes(managerSearch.value),
  ),
)

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

const selectManager = (item) => {
  selectedManagerId.value = item.userId
}

const confirmManagerSelect = async () => {
  if (!selectedManagerId.value) return

  const selected = managerList.value.find(
    (m) => m.userId === selectedManagerId.value,
  )
  if (!selected) return

  try {
    await updateProjectManager(project.id, selected.userId)

    form.salesManagerId = selected.userId
    form.salesManager = selected.name
    managerDialog.value = false

    showSuccess('담당자가 변경되었습니다.')
  } catch (err) {
    showError(err, '담당자를 변경할 수 없습니다.')
  }
}




const formattedRevenue = computed(() => {
  if (!form.expectedRevenue) return ''
  return Number(form.expectedRevenue).toLocaleString()
})

const onDeleteProject = async () => {
  if (!project.id) return

  const ok = window.confirm('프로젝트를 삭제하시겠습니까?')
  if (!ok) return

  try {
    await deleteProject(project.id)

    showSuccess('프로젝트가 삭제되었습니다.')
    router.push('/project')   // 프로젝트 목록 URL에 맞게 필요하면 수정
  } catch (err) {
    showError(err, '프로젝트를 삭제할 수 없습니다.')
  }
}


const updateRevenue = (val) => {
  const numeric = Number((val || '').replace(/[^0-9]/g, ''))
  form.expectedRevenue = numeric || null
}

const formattedProfit = computed(() => {
  if (!form.expectedRevenue || !form.expectedMarginRate) return ''
  const profit = (form.expectedRevenue * form.expectedMarginRate) / 100
  form.expectedProfit = profit
  return profit.toLocaleString() + ' 원'
})

const toDateString = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formattedStartDate = computed(() => toDateString(form.startDate))
const formattedEndDate = computed(() => toDateString(form.endDate))

const saveProject = async () => {
  const payload = {
    title: form.projectName,
    description: form.description || '',
    type: mapSalesTypeToEnum(form.salesType),
    expectedRevenue: form.expectedRevenue,
    expectedMarginRate: form.expectedMarginRate,
    startDay: toLocalDateString(form.startDate),
    endDay: toLocalDateString(form.endDate),
  }

  try {
    await updateProject(project.id, payload)

    const res = await getProjectDetail(project.id)
    applyDetailDto(res.data)

    showSuccess('프로젝트 저장이 완료되었습니다.')
  } catch (err) {
    showError(err, '프로젝트를 저장할 수 없습니다.')
  }
}



onMounted(async () => {
  const projectId = route.params.projectId || route.params.id
  if (!projectId) return
  const res = await getProjectDetail(projectId)
  applyDetailDto(res.data)
})
</script>


<style scoped>
.detail-container {
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.project-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #fff;
}

.pipeline-full {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  margin-bottom: 24px;
}

.pipeline-step {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

.pipeline-step.completed {
  background-color: orange;
  color: white;
}

.pipeline-step.pending {
  background-color: #eee;
  color: #555;
}

.pipeline-line {
  flex-grow: 1;
  height: 2px;
  margin: 0 4px;
  border-radius: 2px;
  background-color: #ccc;
}

.pipeline-line.completed {
  background-color: orange;
}

.progress-text {
  position: absolute;
  right: 0;
  bottom: -20px;
  font-size: 0.75rem;
  color: #888;
}

.readonly-field input {
  background-color: #eee !important;
  color: #555 !important;
}
</style>
