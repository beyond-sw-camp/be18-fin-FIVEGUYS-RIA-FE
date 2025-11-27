<template>
  <v-container fluid class="pa-0 full-height">
    <v-row no-gutters class="full-height">
      <!-- 좌측 사이드바 -->
      <v-col cols="12" md="2" class="pa-4 sidebar">
        <v-card class="pa-6 sidebar-card" flat>
          <!-- 검색 -->
          <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="검색" variant="outlined" hide-details
            density="comfortable" class="mb-4 sidebar-input" />

          <!-- 정렬 -->
          <v-select v-model="sort" :items="['최신순', '오래된순']" label="정렬" variant="outlined" hide-details
            density="comfortable" class="mb-4 sidebar-input" />

          <!-- 필터 (모든 / 내 / 완료) -->
          <v-select v-model="filter" :items="filterItems" item-title="title" item-value="value" label="필터"
            variant="outlined" hide-details density="comfortable" class="mb-6 sidebar-input" />

          <!-- 상태 체크박스 그룹 -->
          <div class="sidebar-checkbox-group mt-4">
            진행 상태
            <v-checkbox v-for="sidebar in sidebares" :key="sidebar.value" v-model="sidebar.checked"
              :label="sidebar.label" hide-details dense class="sidebar-checkbox" />
          </div>
        </v-card>
      </v-col>

      <!-- 메인 컨텐츠 -->
      <v-col cols="12" md="10" class="pa-6 main-content">
        <div class="d-flex justify-end mb-4">
          <v-btn color="orange darken-2" class="white--text" elevation="4" rounded @click="goCreateProject">
            새 프로젝트
          </v-btn>
        </div>

        <v-row dense>
          <v-col v-for="(project, index) in projects" :key="index" cols="12" sm="6" md="4">
            <v-card outlined class="pa-4 project-card" @click="goToDetail(project.id)">
              <!-- 상단: 진행 상태 + 프로젝트 제목 + 진행도 -->
              <v-card-title class="d-flex justify-space-between align-start status-row">
                <div class="d-flex flex-column align-start">
                  <span class="status-text">[{{ project.status }}]</span>
                  <span class="project-title mt-1">{{ project.title }}</span>
                </div>
                <span class="progress-text">진행률: {{ project.progress }}%</span>
              </v-card-title>

              <!-- 파이프라인 -->
              <v-card-text class="pa-0 pipeline-section">
                <div class="pipeline-container">
                  <template v-for="(step, i) in project.pipeline" :key="i">
                    <v-chip :color="step.completed ? 'orange darken-2' : 'grey lighten-2'" small
                      class="pa-1 text-center">
                      {{ step.name }}
                    </v-chip>
                    <div v-if="i < project.pipeline.length - 1" class="pipeline-line flex-grow-1"
                      :style="{ backgroundColor: project.pipeline[i + 1].completed ? '#fb8c00' : '#ccc' }"></div>
                  </template>
                </div>

                <v-divider class="my-2" />

                <div class="d-flex justify-space-between align-center info-row">
                  <div class="d-flex align-center">
                    <span class="owner-text">담당자: {{ project.owner }}</span>
                  </div>
                  <div class="period-text">{{ project.period }}</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 페이지네이션 -->
        <v-row justify="center" class="mt-6">
          <v-pagination v-model="page" :length="totalPages" @update:modelValue="onPageChange" />
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getProjectsWithPipelines } from '@/apis/project'

const router = useRouter()

// UI 상태
const search = ref('')
const sort = ref('최신순')

// 필터: 하나만 활성
const filterItems = [
  { title: '모든 프로젝트', value: 'ALL' },
  { title: '내 프로젝트', value: 'MINE' },
  { title: '완료된 프로젝트', value: 'DONE' },
  { title: '취소된 프로젝트', value: 'CANCELLED' },
]
const filter = ref('ALL')

// 페이지네이션 상태
const page = ref(1)      // 1-based
const size = ref(12)
const totalPages = ref(0)
const totalElements = ref(0)

const sidebares = reactive([
  { label: '제안수신', value: '제안수신', checked: false },
  { label: '내부검토', value: '내부검토', checked: false },
  { label: '견적', value: '견적', checked: false },
  { label: '협상', value: '협상', checked: false },
  { label: '계약성공', value: '계약성공', checked: false },
])

const checkedSidebarValues = computed(() =>
  sidebares.filter(s => s.checked).map(s => s.value),
)

// 서버에서 받은 원본 데이터(content만)
const rawProjects = ref([])

// 로딩 상태
const loading = ref(false)

// 상태 문자열 변환
const translateStatus = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return '진행중'
    case 'SUCCESS':
      return '계약 성공'
    case 'FAIL':
      return '실패'
    case 'CANCELLED':
      return '취소됨'
    default:
      return status
  }
}


// 기간 문자열
const formatPeriod = (startDay, endDay) => {
  if (!startDay && !endDay) return '-'
  if (!startDay) return `~ ${endDay}`
  if (!endDay) return `${startDay} ~`
  return `${startDay} ~ ${endDay}`
}

// 진행률 계산
const calcProgress = (project) => {
  if (project.pipelineInfo && project.pipelineInfo.progressRate != null) {
    return Math.round(project.pipelineInfo.progressRate)
  }

  const total = project.stageList ? project.stageList.length : 0
  if (!total) return 0

  const completed = project.stageList.filter(s => s.completed === true).length
  return Math.round((completed / total) * 100)
}

// DTO → 카드 모델
const mapToCard = (p) => {
  return {
    id: p.projectId,
    title: p.title,
    owner: p.salesManagerName,
    status: translateStatus(p.status),
    statusCode: p.status,
    currentStage: p.pipelineInfo?.currentStage || null,
    progress: calcProgress(p),
    period: formatPeriod(p.startDay, p.endDay),
    pipeline: (p.stageList || []).map(s => ({
      name: s.stageName,
      completed: s.completed === true,
    })),
  }
}

// 정렬
const sortedCards = computed(() => {
  const mapped = rawProjects.value.map(mapToCard)
  if (sort.value === '최신순') {
    return mapped
  }
  return [...mapped].reverse()
})

// 정렬 + 사이드바 필터
const projects = computed(() => {
  const base = sortedCards.value
  const selected = checkedSidebarValues.value

  if (!selected.length) return base
  return base.filter(p => selected.includes(p.currentStage))
})

// 쿼리 파라미터 변환
const buildQueryParams = () => {
  const params = {
    page: page.value,
    size: size.value,
  }

  if (search.value.trim()) {
    params.keyword = search.value.trim()
  }

  switch (filter.value) {
    case 'MINE':
      params.myProject = true
      break
    case 'DONE':
      // enum 이 COMPLETED / SUCCESS 중 뭔지에 맞춰서 문자열만 맞춰라
      params.status = 'COMPLETED'
      break
    case 'CANCELLED':
      params.status = 'CANCELLED'
      break
    case 'ALL':
    default:
      break
  }

  return params
}


// API 호출
const fetchProjects = async (resetPage = false) => {
  if (resetPage) {
    page.value = 1
  }

  loading.value = true
  try {
    const params = buildQueryParams()
    const res = await getProjectsWithPipelines(params)
    const data = res.data || {}

    rawProjects.value = data.content || []
    totalPages.value = data.totalPages || 0
    totalElements.value = data.totalElements || 0
  } finally {
    loading.value = false
  }
}

// 검색/필터/정렬 변경 시 재조회 (1페이지로)
watch([search, filter, sort], () => {
  fetchProjects(true)
})

// 페이지 변경
const onPageChange = () => {
  fetchProjects(false)
}

// 초기 로딩
onMounted(() => {
  fetchProjects()
})

const goToDetail = (id) => {
  router.push(`/project/${id}`)
}

const goCreateProject = () => {
  router.push({ name: 'CreateProject' })
}
</script>

<style scoped>
/* ==================== 사이드바 ==================== */
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

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: #ff7f00;
  letter-spacing: 0.5px;
}

.status-label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
  margin-bottom: 8px;
}

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

/* ==================== 프로젝트 카드 ==================== */
.project-card {
  transition: box-shadow 0.3s, transform 0.2s;
  font-size: 0.85rem;
  border-radius: 12px;
}

.project-card:hover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-left: 4px;
}

.status-text {
  font-size: 0.75rem;
  color: #888;
}

.project-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 2px;
}

.progress-text {
  font-size: 0.75rem;
  color: #000;
}

.pipeline-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pipeline-line {
  height: 2px;
  border-radius: 2px;
  flex-grow: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  margin-top: 2px;
}

.owner-text {
  font-size: 0.7rem;
}

.period-text {
  font-size: 0.7rem;
  color: #555;
}

.sidebar-checkbox-group {
  font-weight: 600;
  color: #555;
  font-size: 14px;
  margin-bottom: 8px;
}
</style>
