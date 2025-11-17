<template>
  <v-container fluid class="pa-6 detail-container">

    <!-- 상단 제목 -->
    <v-row class="align-center justify-space-between mb-6">
      <v-col cols="auto">
        <h2 class="project-title">{{ project.name }}</h2>
        <v-chip
          :color="project.status === '진행중' ? 'orange darken-2' : 'grey'"
          size="small"
          class="mr-2 white--text"
        >
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
            <div v-if="i < project.pipeline.length -1" class="pipeline-line" :class="project.pipeline[i+1].completed ? 'completed' : 'pending'"></div>
          </template>
          <div class="progress-text">{{ project.progress }}%</div>
        </div>
      </v-col>
    </v-row>

    <v-row dense>
      <!-- 좌측 입력폼 -->
      <v-col cols="12" md="6">
        <v-card class="pa-6 mb-4 apple-card" elevation="2">
          <v-card-title class="text-h6 mb-4">프로젝트 정보</v-card-title>
          <v-card-text>
            <v-row dense>
              <!-- 읽기 전용 필드 -->
              <v-col cols="6"><v-text-field v-model="project.id" label="프로젝트 ID" readonly class="readonly-field"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="project.createdAt" label="생성일" readonly class="readonly-field"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="project.updatedAt" label="수정일" readonly class="readonly-field"></v-text-field></v-col>

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
                <v-menu v-model="startMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                  <template #activator="{ props }">
                    <v-text-field v-model="project.startDate" label="시작일" readonly v-bind="props"></v-text-field>
                  </template>
                  <v-date-picker v-model="project.startDate" @input="startMenu=false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu v-model="endMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                  <template #activator="{ props }">
                    <v-text-field v-model="project.endDate" label="종료일" readonly v-bind="props"></v-text-field>
                  </template>
                  <v-date-picker v-model="project.endDate" @input="endMenu=false"></v-date-picker>
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
          <v-card v-for="(card, index) in cards" :key="index" class="mb-4 apple-card" elevation="2">
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()

const startMenu = ref(false)
const endMenu = ref(false)

const project = reactive({
  id: 'PRJ-001',
  createdAt: '2025-11-01',
  updatedAt: '2025-11-05',
  name: '디올 신규 영입 협상',
  customerCompany: '디올',
  customer: '김철수',
  description: '',
  salesPerson: '김민수',
  type: 'POPUP',
  status: '진행중',
  startDate: '2025-11-01',
  endDate: '2025-12-15',
  estimatedRevenue: '',
  estimatedMargin: '',
  estimatedProfit: '',
  progress: 60,
  pipeline: [
    { name: '제안 수신', completed: true },
    { name: '내부 검토', completed: true },
    { name: '제안 작성', completed: true },
    { name: '협상 시작', completed: false },
    { name: '계약 성공', completed: false }
  ]
})

// 우측 카드 예시
const cards = reactive([
  { title: '잠재 고객 등록', content: '잠재 고객 정보를 입력했습니다.' },
  { title: '제안', items: [{ name: '제안서 A', date: '2025-11-02' }, { name: '제안서 B', date: '2025-11-05' }] },
  { title: '견적', items: [{ name: '견적서 1', date: '2025-11-03' }] },
  { title: '계약', items: [{ name: '계약서 1', date: '2025-11-06' }] },
  { title: '정식 고객 등록', content: '계약 완료 후 정식 고객으로 등록됨' },
  { title: '매출', content: '첫 매출 발생: 50,000,000원' }
])
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

/* Apple 스타일 카드 */
.apple-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  background-color: #fff;
}

/* 전체 폭 파이프라인 */
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
.pipeline-step.completed { background-color: orange; color: white; }
.pipeline-step.pending { background-color: #eee; color: #555; }
.pipeline-line {
  flex-grow: 1;
  height: 2px;
  margin: 0 4px;
  border-radius: 2px;
  background-color: #ccc;
}
.pipeline-line.completed { background-color: orange; }
.progress-text { position: absolute; right: 0; bottom: -20px; font-size: 0.75rem; color: #888; }

/* 읽기 전용 필드 */
.readonly-field input { background-color: #eee !important; color: #555 !important; }
</style>
