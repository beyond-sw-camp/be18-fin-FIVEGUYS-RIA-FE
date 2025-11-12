<template>
    <div class="full-height w-100 page-wrapper">
        <!-- 좌측 사이드바 -->
        <div class="sidebar">
        <div class="card pa-4">
            <!-- 검색 -->
            <input
            v-model="search"
            type="text"
            placeholder="검색"
            class="text-field"
            />

            <!-- 정렬 -->
            <select v-model="sort" class="select-field mt-4">
            <option>이름순</option>
            <option>날짜순</option>
            <option>생성순</option>
            </select>

            <!-- 필터 -->
            <select v-model="filter" class="select-field mt-4">
            <option>모든 프로젝트</option>
            <option>내 프로젝트</option>
            <option>완료된 프로젝트</option>
            </select>
        </div>
        </div>

        <!-- 메인 컨텐츠 -->
        <div class="main-content">
        <!-- 상단 버튼 -->
        <div class="top-bar">
            <button class="btn-primary">새 프로젝트</button>
        </div>

        <!-- 프로젝트 카드 목록 -->
        <div class="card-grid">
            <div
            class="card-item"
            v-for="(project, i) in projects"
            :key="i"
            >
            <div class="card">
                <div class="card-title">{{ project.title }}</div>
                <div class="card-subtitle">{{ project.owner }}</div>
                <div class="card-text">{{ project.desc }}</div>
            </div>
            </div>
        </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const search = ref("");
const sort = ref("이름순");
const filter = ref("모든 프로젝트");

const projects = ref([
  { title: "프로젝트 A", owner: "김민수", desc: "첫 번째 프로젝트" },
  { title: "프로젝트 B", owner: "홍길동", desc: "두 번째 프로젝트" },
  { title: "프로젝트 C", owner: "이영희", desc: "세 번째 프로젝트" },
  { title: "프로젝트 D", owner: "박철수", desc: "네 번째 프로젝트" },
]);
</script>

<style scoped>
.page-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ==================== 사이드바 ==================== */
.sidebar {
  width: 25%; /* md=3 비율 */
  min-width: 200px;
  padding: 16px;
  border-right: 1px solid #ddd;
  box-sizing: border-box;
}

.card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

.text-field,
.select-field {
  width: 100%;
  padding: 8px 12px;
  margin-top: 8px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.mt-4 {
  margin-top: 16px;
}

/* ==================== 메인 컨텐츠 ==================== */
.main-content {
  width: 75%; /* md=9 비율 */
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.btn-primary {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #1565c0;
}

/* ==================== 카드 그리드 ==================== */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1;
  overflow-y: auto; /* 카드 많으면 스크롤 */
}

.card-item {
  width: calc(33.333% - 10.66px); /* 3열 배치, gap 고려 */
  min-width: 200px;
}

.card-item .card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.card-item .card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
</style>
