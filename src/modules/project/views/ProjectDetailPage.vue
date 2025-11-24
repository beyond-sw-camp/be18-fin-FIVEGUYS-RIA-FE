<template>
  <v-container fluid class="pa-6 detail-container">

    <!-- 상단 제목 -->
    <v-row class="align-center justify-space-between mb-6">
      <v-col cols="auto">
        <h2 class="project-title">{{ project.name }}</h2>
        <v-chip :color="project.status === '진행중' ? 'orange darken-2' : 'grey'" size="small" class="mr-2 white--text">
          {{ project.status }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- 파이프라인 전체 폭 -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="pipeline-full">
          <template v-for="(step, i) in project.pipeline" :key="i">
            <div class="pipeline-step" :class="step.completed ? 'completed' : 'pending'">
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
              <!-- 읽기 전용 필드 -->
              <v-col cols="6"><v-text-field v-model="project.id" label="프로젝트 ID" readonly
                  class="readonly-field"></v-text-field></v-col>
              <!-- <v-col cols="6"><v-text-field v-model="project.createdAt" label="생성일" readonly
                  class="readonly-field"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="project.updatedAt" label="수정일" readonly
                  class="readonly-field"></v-text-field></v-col> -->

              <!-- 입력 가능 필드 -->
              <v-col cols="6"><v-text-field v-model="project.name" label="프로젝트 명" /></v-col>
              <v-col cols="6"><v-text-field v-model="project.customerCompany" label="고객사" /></v-col>
              <v-col cols="6"><v-text-field v-model="project.customer" label="고객" /></v-col>
              <v-col cols="12"><v-textarea v-model="project.description" label="설명(메모)" rows="3" /></v-col>
              <v-col cols="6"><v-text-field v-model="project.salesPerson" label="영업 담당" /></v-col>
              <v-col cols="6"><v-text-field v-model="project.type" label="유형" /></v-col>
              <v-col cols="6"><v-text-field v-model="project.status" label="상태" /></v-col>

              <!-- 시작일/종료일 -->
              <v-col cols="6">
                <v-menu v-model="startMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                  min-width="auto">
                  <template #activator="{ props }">
                    <v-text-field v-model="project.startDate" label="시작일" readonly v-bind="props"></v-text-field>
                  </template>
                  <v-date-picker v-model="project.startDate" @input="startMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu v-model="endMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                  min-width="auto">
                  <template #activator="{ props }">
                    <v-text-field v-model="project.endDate" label="종료일" readonly v-bind="props"></v-text-field>
                  </template>
                  <v-date-picker v-model="project.endDate" @input="endMenu = false"></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="6"><v-text-field v-model="project.estimatedRevenue" label="예상 매출액" /></v-col>
              <v-col cols="6"><v-text-field v-model="project.estimatedMargin" label="예상 마진율" /></v-col>
              <v-col cols="6"><v-text-field v-model="project.estimatedProfit" label="예상 수익" /></v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="orange darken-2" class="white--text" small>저장하기</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 우측 카드 영역 -->
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
  </v-container>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectDetail } from '@/apis/project'

const route = useRoute()

const startMenu = ref(false)
const endMenu = ref(false)

// 화면용 프로젝트 모델
const project = reactive({
  id: null,
  name: '',
  customerCompany: '',
  customer: '',
  description: '',
  salesPerson: '',
  type: '',          // POPUP → 팝업 스토어 등으로 바꾸고 싶으면 아래 mapType에서 처리
  status: '',        // 한글 상태명 (진행중/계약 성공 등)
  statusCode: '',    // 백엔드 enum 그대로 (ACTIVE/SUCCESS/FAIL ...)
  startDate: null,   // '2025-11-01'
  endDate: null,
  estimatedRevenue: null,
  estimatedMargin: null,
  estimatedProfit: null,
  progress: 0,
  pipeline: [],      // [{ name, completed }]
})

// 우측 카드: 제안 목록 등
const cards = ref([])

// 상태 코드 → 한글
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

// 타입 코드 → 한글
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

// DTO → 화면 모델 매핑
const applyDetailDto = (dto) => {
  project.id = dto.projectId
  project.name = dto.title
  project.customerCompany = dto.clientCompanyName
  project.customer = dto.clientName
  project.description = dto.description || ''
  project.salesPerson = dto.salesManagerName
  project.type = translateType(dto.type)
  project.statusCode = dto.status
  project.status = translateStatus(dto.status)
  project.startDate = dto.startDay        // '2025-11-01'
  project.endDate = dto.endDay
  project.estimatedRevenue = dto.expectedRevenue
  project.estimatedMargin = dto.expectedMarginRate
  project.estimatedProfit =
    dto.expectedRevenue && dto.expectedMarginRate
      ? Math.round(dto.expectedRevenue * dto.expectedMarginRate / 100)
      : null
  project.progress = dto.pipelineInfo?.progressRate ?? 0

  project.pipeline = (dto.stageList || []).map(s => ({
    name: s.stageName,
    completed: s.completed === true,
  }))

  // 우측 카드: 제안 목록 한 카드로 구성 (원하면 더 쪼개라)
  cards.value = [
    {
      title: '제안 목록',
      items: (dto.proposals || []).map(p => ({
        name: `${p.title} (${p.writerName})`,
        date: p.submitDate || p.requestDate || '',
      })),
    },
  ]
}

// 초기 로딩
onMounted(async () => {
  const projectId = route.params.projectId || route.params.id

  if (!projectId) {
    console.error('projectId 없음', route.params)
    return
  }

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
