<template>
  <v-dialog v-model="internalDialog" max-width="650px">
    <v-card>

      <!-- Header -->
      <v-card-title class="text-h6 font-weight-bold">
        입주한 브랜드의 상세정보
      </v-card-title>

      <v-divider />

      <!-- 로딩 -->
      <v-card-text v-if="loading" class="text-center py-6">
        <v-progress-circular indeterminate color="primary" />
      </v-card-text>

      <!-- 에러 -->
      <v-card-text v-else-if="error" class="text-center py-6 text-error">
        {{ error }}
      </v-card-text>

      <!-- 실제 내용 -->
      <v-card-text v-else class="no-window-transition">

        <!-- Tabs -->
        <v-tabs
          v-model="tab"
          color="primary"
          align-tabs="center"
          class="fixed-tabs"
        >
          <v-tab value="info">기본 정보</v-tab>
          <v-tab value="sales">매출/거래 정보</v-tab>
        </v-tabs>

        <v-divider />

        <v-window v-model="tab" :touch="false">

          <!-- 기본 정보 -->
          <v-window-item value="info">
            <v-row class="py-4" dense>

              <v-col cols="12">
                <v-text-field
                  label="입주명"
                  :model-value="brand.storeDisplayName || '공실'"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="면적"
                  :model-value="brand.areaSize"
                  suffix="㎡"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="입점일"
                  :model-value="brand.startDate"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <div class="d-flex align-center ga-2">
                  <v-text-field
                    class="flex-1-1"
                    label="계약 시작일"
                    :model-value="brand.contractStartDate"
                    variant="outlined"
                    readonly
                  />
                  <span>~</span>
                  <v-text-field
                    class="flex-1-1"
                    label="계약 종료일"
                    :model-value="brand.contractEndDate"
                    variant="outlined"
                    readonly
                  />
                </div>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="총 임대료"
                  :model-value="brand.finalContractAmount"
                  suffix="원"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="매출 수수료율"
                  :model-value="brand.commissionRate"
                  suffix="%"
                  variant="outlined"
                  readonly
                />
              </v-col>

            </v-row>
          </v-window-item>

          <!-- 매출 정보 -->
          <v-window-item value="sales">
            <v-row class="py-4" dense>

              <v-col cols="6">
                <v-text-field
                  label="전체 거래 횟수"
                  :model-value="brand.totalPurchaseCount"
                  suffix="건"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="총 매출 금액"
                  :model-value="brand.totalSalesAmount"
                  suffix="원"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="VIP 거래 횟수"
                  :model-value="brand.vipPurchaseCount"
                  suffix="건"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="VIP 매출 금액"
                  :model-value="brand.vipSalesAmount"
                  suffix="원"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="VIP 매출 비중"
                  :model-value="brand.vipRatio"
                  suffix="%"
                  variant="outlined"
                  readonly
                />
              </v-col>

            </v-row>
          </v-window-item>

        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="close">확인</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { fetchStoreDetailStats } from "@/apis/storemap";   
/* -----------------------------
      Props & Emits
----------------------------- */
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  storeId: { type: Number, required: false, default: null },     
});

const emit = defineEmits(["update:modelValue"]);

/* -----------------------------
      Dialog 상태 동기화
----------------------------- */
const internalDialog = ref(props.modelValue);

watch(
  () => props.modelValue,
  (v) => (internalDialog.value = v)
);

watch(internalDialog, (v) => emit("update:modelValue", v));

/* -----------------------------
      API 데이터
----------------------------- */
const brand = ref({});
const loading = ref(false);
const error = ref(null);
const tab = ref("info");

const displayName = computed(() =>
  brand.value.storeDisplayName &&
  brand.value.storeDisplayName.trim() !== ""
    ? brand.value.storeDisplayName
    : "공실"
);

/* -----------------------------
      storeId 변경 시 API 호출
----------------------------- */
watch(
  () => props.storeId,
  async (id) => {
    if (!id) return;
    await loadStoreDetail(id);
  },
  { immediate: true }
);

/* -----------------------------
          API Fetch
----------------------------- */
async function loadStoreDetail(id) {
  loading.value = true;
  error.value = null;

  try {
    const data = await fetchStoreDetailStats(id);
    brand.value = data.data;
  } catch (err) {
    error.value = "매장 정보를 불러오는 중 오류 발생";
  } finally {
    loading.value = false;
  }
}

function close() {
  internalDialog.value = false;
}
</script>

<style scoped>
.v-card-text {
  max-height: 600px;
  overflow-y: auto;
}

.fixed-tabs {
  height: 56px !important;
  display: flex;
  align-items: center;
}

.no-window-transition .v-window__container {
  transition: none !important;
}
</style>
