<template>
  <v-container fluid class="pa-0 full-height">
    <v-row no-gutters class="full-height">

      <!-- 좌측 사이드바 -->
      <v-col cols="12" md="2" class="pa-4 sidebar">
        <v-card class="pa-6 sidebar-card" flat>

          <!-- 검색 -->
          <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="검색" variant="outlined" hide-details
            density="comfortable" class="mb-4 sidebar-input"></v-text-field>

          <!-- 정렬 -->
          <v-select v-model="sort" :items="['최신순', '오래된순']" label="정렬" variant="outlined" hide-details
            density="comfortable" class="mb-4 sidebar-input"></v-select>

          <!-- 필터 -->
          <v-select v-model="filter" :items="['모든 프로젝트', '내 프로젝트', '완료된 프로젝트']" label="필터" variant="outlined"
            hide-details density="comfortable" class="mb-6 sidebar-input"></v-select>


          <!-- 상태 체크박스 그룹 -->
          <div class="sidebar-checkbox-group mt-4">진행 상태
            <v-checkbox v-for="sidebar in sidebares" :key="sidebar.value" v-model="sidebar.checked"
              :label="sidebar.label" hide-details dense class="sidebar-checkbox"></v-checkbox>
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

                <v-divider class="my-2"></v-divider>

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
const filter = ref('모든 프로젝트')

const sidebares = reactive([
  { label: '제안수신', value: '제안수신', checked: false },
  { label: '내부검토', value: '내부검토', checked: false },
  { label: '견적', value: '견적', checked: false },
  { label: '협상', value: '협상', checked: false },
  { label: '계약성공', value: '계약성공', checked: false },
])

const checkedSidebarValues = computed(() =>
  sidebares.filter(s => s.checked).map(s => s.value)
)


// 서버에서 받은 원본 데이터
const rawProjects = ref([])

// 로딩 상태
const loading = ref(false)

// 상태 문자열 변환 (백엔드 enum → 한글)
const translateStatus = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return '진행중'
    case 'SUCCESS':
      return '계약 성공'
    case 'FAIL':
      return '실패'
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

// 진행률 계산 (pipelineInfo.progressRate 사용)
const calcProgress = (project) => {
  if (project.pipelineInfo && project.pipelineInfo.progressRate != null) {
    return Math.round(project.pipelineInfo.progressRate)
  }

  const total = project.stageList ? project.stageList.length : 0
  if (!total) return 0

  const completed = project.stageList.filter((s) => s.completed === true).length
  return Math.round((completed / total) * 100)
}

// DTO → 화면 카드 모델 변환
const mapToCard = (p) => {
  return {
    id: p.projectId,
    title: p.title,
    owner: p.salesManagerName,
    status: translateStatus(p.status),   // ACTIVE → 한글 변환 (원하면 사용)
    statusCode: p.status,                // 원본 상태코드
    currentStage: p.pipelineInfo?.currentStage || null,  // ★ 여기
    progress: calcProgress(p),
    period: formatPeriod(p.startDay, p.endDay),
    pipeline: (p.stageList || []).map((s) => ({
      name: s.stageName,
      completed: s.completed === true,
    })),
  }
}


// 정렬 적용
const sortedCards = computed(() => {
  const mapped = rawProjects.value.map(mapToCard)
  if (sort.value === '최신순') {
    // createdAt desc 로 받아온다고 가정하면 그대로 사용
    return mapped
  }
  // 오래된순: 역순
  return [...mapped].reverse()
})

// 정렬 + 사이드바(파이프라인 단계) 필터 적용
const projects = computed(() => {
  const base = sortedCards.value
  const selected = checkedSidebarValues.value

  if (!selected.length) return base

  // currentStage 가 선택된 단계(제안수신/내부검토/...) 중 하나인 것만 노출
  return base.filter(p => selected.includes(p.currentStage))
})


// UI 상태 → 쿼리 파라미터 변환
const buildQueryParams = () => {
  const params = {
    page: 1,
    size: 12,
  }

  if (search.value.trim()) {
    params.keyword = search.value.trim()
  }

  if (filter.value === '완료된 프로젝트') {
    params.status = 'SUCCESS'
  } else if (filter.value === '내 프로젝트') {
    // 실제로는 로그인 유저 이름 사용
    // 예: params.managerName = authStore.user.name
    params.managerName = '김민수'
  }

  // 사이드바 단계 필터는 현재 백엔드 시그니처에 없으므로 여기서는 서버에 안 보낸다

  return params
}

// API 호출
const fetchProjects = async () => {
  loading.value = true
  try {
    const params = buildQueryParams()
    const res = await getProjectsWithPipelines(params)
    rawProjects.value = res.data || []
  } finally {
    loading.value = false
  }
}

// 검색/필터/정렬 변경 시 재조회
watch([search, filter, sort], () => {
  fetchProjects()
})

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
  /* 기본 ripple 제거 */
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

/* 상태 체크박스 디자인 */
.sidebar-checkbox .v-input--selection-controls__ripple {
  display: none;
  /* 기본 ripple 제거 */
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
