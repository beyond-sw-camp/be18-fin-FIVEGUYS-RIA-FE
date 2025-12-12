<template>
  <v-container fluid class="pa-0 full-height">
    <v-row no-gutters class="full-height">
      <!-- 좌측 사이드바 -->
      <v-col cols="12" md="2" class="pa-4 sidebar">
        <v-card class="pa-6 sidebar-card" flat>
          <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="검색" variant="outlined" hide-details
            density="comfortable" class="mb-4 sidebar-input" />

          <v-select v-model="sort" :items="['최신순', '오래된순']" label="정렬" variant="outlined" hide-details
            density="comfortable" class="mb-4 sidebar-input" />

          <v-select v-model="filter" :items="filterItems" item-title="title" item-value="value" label="필터"
            variant="outlined" hide-details density="comfortable" class="mb-6 sidebar-input" />

          <div class="sidebar-checkbox-group mt-4">
            <div style="font-weight: 600;">진행 상태</div>
            <v-checkbox v-for="sidebar in sidebares" :key="sidebar.value" v-model="sidebar.checked"
              :label="sidebar.label" hide-details dense class="sidebar-checkbox" />
          </div>
        </v-card>
      </v-col>

      <!-- 메인 -->
      <v-col cols="12" md="10" class="pa-6 main-content">
        <div class="d-flex justify-end mb-4">
          <v-btn color="orange darken-2" class="white--text" elevation="4" rounded @click="goCreateProject">
            새 프로젝트
          </v-btn>
        </div>

        <v-row dense>
          <v-col v-for="(project, index) in projects" :key="index" cols="12" sm="6" md="4" class="project-col">
            <v-card outlined class="pa-4 project-card" @click="goToDetail(project.id)">
              <v-card-title class="d-flex justify-space-between align-start status-row">
                <div class="d-flex flex-column align-start">
                  <span class="status-text">[{{ project.status }}]</span>
                  <span class="project-title mt-1">{{ project.title }}</span>
                </div>
                <span class="progress-text">진행률: {{ project.progress }}%</span>
              </v-card-title>

              <v-card-text class="pa-0 pipeline-section">
                <div class="pipeline-container">
                  <template v-for="(step, i) in project.pipeline" :key="i">
                    <v-chip :color="step.completed ? 'orange darken-2' : 'grey lighten-2'" small class="pipeline-chip">
                      {{ step.name }}
                    </v-chip>

                    <div v-if="i < project.pipeline.length - 1" class="pipeline-line flex-grow-1" :style="{
                      backgroundColor: project.pipeline[i + 1].completed ? '#fb8c00' : '#ccc'
                    }"></div>
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

const search = ref('')
const sort = ref('최신순')

const filterItems = [
  { title: '모든 프로젝트', value: 'ALL' },
  { title: '내 프로젝트', value: 'MINE' },
  { title: '완료된 프로젝트', value: 'DONE' },
  { title: '취소된 프로젝트', value: 'CANCELLED' },
]
const filter = ref('ALL')

const page = ref(1)
const size = ref(12)
const totalPages = ref(0)
const totalElements = ref(0)

const sidebares = reactive([
  { label: '제안수신', value: 1, checked: false },
  { label: '내부검토', value: 2, checked: false },
  { label: '견적', value: 3, checked: false },
  { label: '협상', value: 4, checked: false },
  { label: '계약성공', value: 5, checked: false },
])

const checkedSidebarValues = computed(() =>
  sidebares.filter(s => s.checked).map(s => s.value),
)

const rawProjects = ref([])
const loading = ref(false)

const translateStatus = status => {
  switch (status) {
    case 'ACTIVE': return '진행중'
    case 'SUCCESS': return '계약 성공'
    case 'FAIL': return '실패'
    case 'CANCELLED': return '취소됨'
    default: return status
  }
}

const formatPeriod = (startDay, endDay) => {
  if (!startDay && !endDay) return '-'
  if (!startDay) return `~ ${endDay}`
  if (!endDay) return `${startDay} ~`
  return `${startDay} ~ ${endDay}`
}

const calcProgress = project => {
  if (project.pipelineInfo && project.pipelineInfo.progressRate != null) {
    return Math.round(project.pipelineInfo.progressRate)
  }
  const total = project.stageList ? project.stageList.length : 0
  if (!total) return 0
  const completed = project.stageList.filter(s => s.completed === true).length
  return Math.round((completed / total) * 100)
}

const mapToCard = p => {
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

const sortedCards = computed(() => {
  const mapped = rawProjects.value.map(mapToCard)
  if (sort.value === '최신순') return mapped
  return [...mapped].reverse()
})

const projects = computed(() => sortedCards.value)

const buildQueryParams = () => {
  const params = { page: page.value, size: size.value }

  if (search.value.trim()) params.keyword = search.value.trim()

  switch (filter.value) {
    case 'MINE': params.myProject = true; break
    case 'DONE': params.status = 'COMPLETED'; break
    case 'CANCELLED': params.status = 'CANCELLED'; break
  }

  const stages = checkedSidebarValues.value
  if (stages.length > 0) params.stages = stages.join(',')

  return params
}

const fetchProjects = async (resetPage = false) => {
  if (resetPage) page.value = 1
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

watch([search, filter, sort], () => fetchProjects(true))
watch(sidebares, () => fetchProjects(true), { deep: true })

const onPageChange = () => fetchProjects(false)

onMounted(() => fetchProjects())

const goToDetail = id => router.push(`/project/${id}`)
const goCreateProject = () => router.push({ name: 'CreateProject' })
</script>

<style scoped>
.project-col {
  margin-bottom: 20px;
}

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

.sidebar-checkbox .v-input--selection-controls__ripple {
  display: none;
}

.sidebar-checkbox .v-label {
  font-size: 0.75rem;
  color: #1c1c1e;
  font-weight: 500;
}

/* 카드 */
.project-card {
  transition: box-shadow 0.3s, transform 0.2s;
  font-size: 0.85rem;
  border-radius: 12px;
}

.project-card:hover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
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

/* 🔥 칩 크기 고정 */
.pipeline-chip {
  min-width: 64px;
  height: 22px;
  /* ↓ 높이 감소 */
  line-height: 20px;
  /* 텍스트 수직정렬 */
  padding: 0 6px;
  /* 상하 패딩 제거 */
  font-size: 0.7rem;
  /* 필요 시 글자 크기 소폭 축소 */
  justify-content: center;
}

.info-row {
  display: flex;
  justify-content: space-between;
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

.project-col {
  margin-bottom: 20px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
