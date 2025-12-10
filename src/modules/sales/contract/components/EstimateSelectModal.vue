<template>
  <v-dialog v-model="internalDialog" width="500">
    <v-card class="pa-4">
      <!-- 제목 -->
      <div class="dialog-title mb-4">견적 선택</div>

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
          v-for="e in filteredEstimates"
          :key="e.estimateId"
          @click="selectEstimate(e)"
          class="dialog-item"
        >
          {{ e.estimateTitle }}
        </v-list-item>

        <div
          v-if="!loading && filteredEstimates.length === 0"
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
import { getContractEstimateDetail } from "@/apis/contract";
import api from "@/apis/http";

/* props */
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  projectId: { type: [Number, null], default: null },
});

/* emits */
const emits = defineEmits(["update:modelValue", "select"]);

/* 내부 상태 */
const internalDialog = ref(props.modelValue);
const search = ref("");
const estimates = ref([]);
const loading = ref(false);

/* 부모 → 자식 sync */
watch(
  () => props.modelValue,
  (val) => {
    internalDialog.value = val;
    if (val) loadEstimates();
  }
);

/* 자식 → 부모 sync */
watch(internalDialog, (val) => {
  emits("update:modelValue", val);
  if (!val) search.value = "";
});

/* projectId 변경 시 자동 재조회 */
watch(
  () => props.projectId,
  (newId) => {
    if (internalDialog.value && newId != null) loadEstimates();
  }
);

/* 견적 목록 조회 */
const loadEstimates = async () => {
  if (props.projectId == null) return;

  loading.value = true;
  try {
    const { data } = await api.get("/api/contracts/estimates", {
      params: {
        projectId: props.projectId,
        status: "COMPLETED",
        limit: 50,
      },
    });
    console.log("[ESTIMATE API RESPONSE]", data);

    // 원본 객체 그대로 유지
    estimates.value = data;
  } catch (err) {
    console.error("견적 목록 조회 실패:", err);
    estimates.value = [];
  } finally {
    loading.value = false;
  }
};

/* 검색 필터링 */
const filteredEstimates = computed(() => {
  if (!search.value.trim()) return estimates.value;
  return estimates.value.filter((e) =>
    e.estimateTitle.toLowerCase().includes(search.value.toLowerCase())
  );
});

/* 선택 */
const selectEstimate = async (estimate) => {
  console.log("[선택한 견적 기본 정보]", estimate);

  if (!estimate || !estimate.estimateId) {
    console.error("잘못된 견적 객체:", estimate);
    return;
  }

  try {
    const { data } = await getContractEstimateDetail(estimate.estimateId);
    console.log("[선택한 견적 상세 정보]", data);

    // 부모 컴포넌트로 이벤트 전달
    emits("select", data);
  } catch (err) {
    console.error("견적 상세 조회 실패:", err);
  } finally {
    internalDialog.value = false;
  }
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
