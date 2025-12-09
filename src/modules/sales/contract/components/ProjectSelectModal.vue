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
        />

        <!-- 리스트 -->
        <v-list>
            <v-list-item
            v-for="p in filteredProjects"
            :key="p.projectId"
            @click="selectProject(p)"
            class="dialog-item"
            >
            {{ p.title }}
            </v-list-item>

            <div
            v-if="!loading && filteredProjects.length === 0"
            class="text-center pa-4 text-grey"
            >
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
import { ref, watch, computed } from "vue";
import { getProjectsWithPipelines } from "@/apis/project";

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

        if (val) {
        loadProjects();
        }
    }
);

watch(internalDialog, (val) => {
    emits("update:modelValue", val);

    if (!val) {
        search.value = "";
    }
});

/* 실제 프로젝트 조회 API */
const loadProjects = async () => {
    loading.value = true;

    try {
        const res = await getProjectsWithPipelines({
        myProject: true,
        page: 1,
        size: 100,
        });

        console.log("[PROJECT API RESPONSE]", res.data);

        // API 결과 → UI 표시용 표준화 (모든 정보 보존)
        projects.value = res.data.content.map((p) => ({
        projectId: p.projectId,
        title: p.title,
        clientCompanyName: p.clientCompanyName,
        clientName: p.clientName,
        startDay: p.startDay,
        endDay: p.endDay,
        salesManagerName: p.salesManagerName,
        stageList: p.stageList,
        pipelineInfo: p.pipelineInfo,
        status: p.status,
        planningDate: p.planningDate,
        }));
    } catch (err) {
        console.error("프로젝트 목록 조회 실패:", err);
    } finally {
        loading.value = false;
    }
};

/* 검색 필터링 */
const filteredProjects = computed(() => {
    if (!search.value.trim()) return projects.value;
    return projects.value.filter((p) =>
        p.title.toLowerCase().includes(search.value.toLowerCase())
    );
});

/* 프로젝트 선택 */
const selectProject = (project) => {
    emits("select", project);
    internalDialog.value = false;
};
</script>

<style scoped>
.text-grey {
    color: #999;
}

.dialog-item {
    cursor: pointer;
}

.dialog-item:hover {
    background: #f5f5f5;
}
</style>
