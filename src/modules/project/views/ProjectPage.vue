<template>
  <v-container fluid class="pa-0 full-height">
    <v-row no-gutters class="full-height">

      <!-- 좌측 사이드바 -->
      <v-col cols="12" md="2" class="pa-4 sidebar">
        <v-card class="pa-6 sidebar-card" flat>

          <!-- 검색 -->
          <v-text-field
            v-model="search"
            append-inner-icon="mdi-magnify"
            label="검색"
            variant="outlined"
            hide-details
            density="comfortable"
            class="mb-4 sidebar-input"
          ></v-text-field>

          <!-- 정렬 -->
          <v-select
            v-model="sort"
            :items="['최신순', '오래된순']"
            label="정렬"
            variant="outlined"
            hide-details
            density="comfortable"
            class="mb-4 sidebar-input"
          ></v-select>

          <!-- 필터 -->
          <v-select
            v-model="filter"
            :items="['모든 프로젝트', '내 프로젝트', '완료된 프로젝트']"
            label="필터"
            variant="outlined"
            hide-details
            density="comfortable"
            class="mb-6 sidebar-input"
          ></v-select>


          <!-- 상태 체크박스 그룹 -->
            <div class="sidebar-checkbox-group mt-4">진행 상태
                <v-checkbox
                    v-for="sidebar in sidebares"
                    :key="sidebar.value"
                    v-model="sidebar.checked"
                    :label="sidebar.label"
                    hide-details
                    dense
                    class="sidebar-checkbox"
                ></v-checkbox>
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
                    <v-chip
                      :color="step.completed ? 'orange darken-2' : 'grey lighten-2'"
                      small
                      class="pa-1 text-center"
                    >
                      {{ step.name }}
                    </v-chip>
                    <div
                      v-if="i < project.pipeline.length - 1"
                      class="pipeline-line flex-grow-1"
                      :style="{ backgroundColor: project.pipeline[i + 1].completed ? '#fb8c00' : '#ccc' }"
                    ></div>
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
import { reactive } from 'vue'
import { useRouter } from 'vuetify/lib/composables/router'

const search = reactive('')
const sort = reactive('최신순')
const filter = reactive('모든 프로젝트')

const router = useRouter()

const sidebares = reactive([
  { label: '제안 수신', value: false },
  { label: '내부 검토', value: false },
  { label: '제안 작성', value: false },
  { label: '협상 시작', value: false },
  { label: '계약 성공', value: false }
])

const projects = reactive([
  {
    id: 1,
    title: '디올 신규 영입 협상',
    owner: '김민수',
    status: '진행중',
    progress: 60,
    period: '2025-11-01 ~ 2025-12-15',
    pipeline: [
      { name: '제안 수신', completed: true },
      { name: '내부 검토', completed: true },
      { name: '제안 작성', completed: true },
      { name: '협상 시작', completed: false },
      { name: '계약 성공', completed: false }
    ]
  },
  {
    id: 2,
    title: '폼페이 전시회 재계약',
    owner: '홍길동',
    status: '진행중',
    progress: 80,
    period: '2025-10-20 ~ 2025-12-01',
    pipeline: [
      { name: '제안 수신', completed: true },
      { name: '내부 검토', completed: true },
      { name: '제안 작성', completed: true },
      { name: '협상 시작', completed: true },
      { name: '계약 성공', completed: false }
    ]
  }
])

const goToDetail = (id) => {
  router.push(`/project/${id}`);
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
  display: none; /* 기본 ripple 제거 */
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
    border-color: rgba(0,0,0,0.2);
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
  display: none; /* 기본 ripple 제거 */
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
    border-color: rgba(0,0,0,0.2);
}

.sidebar-checkbox-group {
    font-weight: 600;
    color: #555;
    font-size: 14px;
    margin-bottom: 8px;
}
</style>
