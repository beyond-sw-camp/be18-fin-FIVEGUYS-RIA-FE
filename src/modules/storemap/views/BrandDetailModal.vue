<template>
  <v-dialog v-model="internalDialog" max-width="650px">
    <v-card>

      <!-- Header -->
      <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between">
        입주한 브랜드의 상세정보
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Tabs -->
      <v-tabs v-model="tab" color="primary" align-tabs="center">
        <v-tab value="info">기본 정보</v-tab>
        <v-tab value="sales">매출/거래 정보</v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text>
        <v-window v-model="tab">
          <!-- 기본 정보 탭 -->
          <v-window-item value="info">
            <v-row class="py-4" dense>

              <v-col cols="12">
                <v-text-field
                  label="입주명"
                  :model-value="brand.name"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="면적"
                  :model-value="brand.area"
                  suffix="㎡"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="입점일"
                  :model-value="brand.moveInDate"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <div class="d-flex align-center ga-2">
                  <v-text-field
                    class="flex-1-1"
                    label="계약 시작일"
                    :model-value="brand.leaseStart"
                    variant="outlined"
                    readonly
                  />
                  <span>~</span>
                  <v-text-field
                    class="flex-1-1"
                    label="계약 종료일"
                    :model-value="brand.leaseEnd"
                    variant="outlined"
                    readonly
                  />
                </div>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="총 임대료"
                  :model-value="brand.rent"
                  suffix="원"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="매출 수수료율"
                  :model-value="brand.feeRate"
                  suffix="%"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="평균 매출"
                  :model-value="brand.avgSales"
                  suffix="원"
                  variant="outlined"
                  readonly
                />
              </v-col>

            </v-row>
          </v-window-item>

          <!-- 매출 / 거래 정보 탭 -->
          <v-window-item value="sales">
            <v-row class="py-4" dense>

              <v-col cols="6">
                <v-text-field
                  label="전체 거래 횟수"
                  :model-value="brand.totalOrders"
                  suffix="건"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="총 매출 금액"
                  :model-value="brand.totalAmount"
                  suffix="원"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="VIP 거래 횟수"
                  :model-value="brand.vipOrders"
                  suffix="건"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  label="VIP 매출 금액"
                  :model-value="brand.vipAmount"
                  suffix="원"
                  variant="outlined"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  label="VIP 매출 비중"
                  :model-value="brand.vipRate"
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
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="flat" @click="close">확인</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  brand: { type: Object, default: () => ({}) }
});

const emit = defineEmits(["update:modelValue"]);

const internalDialog = ref(props.modelValue);

// 부모 → 자식
watch(
  () => props.modelValue,
  (val) => (internalDialog.value = val)
);

// 자식 → 부모
watch(internalDialog, (val) => {
  emit("update:modelValue", val);
});

const brand = computed(() => props.brand || {});
const tab = ref("info");

function close() {
  internalDialog.value = false;
}
</script>

<style scoped>
.v-card-text {
  max-height: 600px;
  overflow-y: auto;
}
</style>
