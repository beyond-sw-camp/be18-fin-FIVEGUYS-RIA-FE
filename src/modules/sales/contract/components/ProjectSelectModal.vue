<template>
  <v-dialog v-model="internalDialog" width="500">
    <v-card class="pa-4">

      <!-- 제목 -->
      <div class="dialog-title mb-4">프로젝트 선택</div>

      <!-- 검색 -->
      <v-text-field
        v-model="search"
        placeholder="검색"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        class="mb-4"
        clearable
        @input="loadProjects"
      />

      <!-- 리스트 -->
      <v-list>
        <v-list-item
          v-for="p in projects"
          :key="p.projectId"
          @click="selectProject(p)"
          class="dialog-item"
        >
          {{ p.projectTitle }}
        </v-list-item>

        <div v-if="!loading && projects.length === 0" class="text-center pa-4 text-grey">
          검색 결과가 없습니다.
        </div>

        <div v-if="loading" class="text-center pa-4">
          <v-progress-circular indeterminate />
        </div>
      </v-list>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { getProjectTitles, getProjectMeta } from "@/apis/project";

/* props */
const props = defineProps({
  modelValue: { type: Boolean, required: true },
});

/* emits */
const emits = defineEmits(["update:modelValue", "select"]);

/* 내부 상태 */
const internalDialog = ref(props.modelValue);
const search = ref("");
const projects = ref([]);
const loading = ref(false);

/* 부모 → 자식 sync */
watch(
  () => props.modelValue,
  (val) => {
    internalDialog.value = val;
    if (val) loadProjects();
  }
);

watch(internalDialog, (val) => {
  emits("update:modelValue", val);
  if (!val) search.value = "";
});

/* 프로젝트 제목 목록 조회 */
const loadProjects = async () => {
  loading.value = true;
  try {
    const res = await getProjectTitles(search.value);
    projects.value = res.data; // 그대로 배열로 사용 (projectTitle, projectId 포함)
  } catch (err) {
    console.error("프로젝트 제목 목록 조회 실패:", err);
  } finally {
    loading.value = false;
  }
};

/* 프로젝트 선택 시 메타 정보 조회 */
const selectProject = async (project) => {
  try {
    const { data } = await getProjectMeta(project.projectId);

    console.log("프로젝트 상세 데이터:", data);

    emits("select", {
      projectId: data.projectId,
      projectName: data.projectName,
      clientCompanyId: data.clientCompanyId,
      clientCompanyName: data.clientCompanyName,
      clientId: data.clientId,
      clientName: data.clientName,
    });

  } catch (err) {
    console.error("프로젝트 상세 조회 실패:", err);
  } finally {
    internalDialog.value = false;
  }
};
</script>

<style scoped>
.text-grey { color: #999; }
.dialog-item { cursor: pointer; }
.dialog-item:hover { background: #f5f5f5; }
</style>
