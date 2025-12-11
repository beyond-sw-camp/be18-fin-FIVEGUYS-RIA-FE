<template>
  <v-container fluid class="detail-container">
    <!-- 스낵바 -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="2500"
      location="top center"
      class="toast-snackbar"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 상단 제목 -->
    <v-row class="align-center justify-space-between mb-4">
      <v-col cols="auto">
        <h2 class="project-title">{{ form.projectName }}</h2>
        <v-chip
          :color="project.status === '진행중' ? 'orange darken-2' : 'grey'"
          size="small"
          class="mr-2 white--text"
        >
          {{ project.status }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- 파이프라인 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="pipeline-full">
          <template v-for="(step, i) in project.pipeline" :key="i">
            <div
              class="pipeline-step"
              :class="step.completed ? 'completed' : 'pending'"
              @click="openPipelineConfirm(i + 1)"
            >
              {{ step.name }}
            </div>
            <div
              v-if="i < project.pipeline.length - 1"
              class="pipeline-line"
              :class="
                project.pipeline[i + 1].completed ? 'completed' : 'pending'
              "
            ></div>
          </template>
          <div class="progress-text">{{ project.progress }}%</div>
        </div>
      </v-col>
    </v-row>

    <v-row dense>
      <!-- 좌측 입력폼 -->
      <v-col cols="12" md="6">
        <v-card class="project-card mb-3" elevation="2">
          <v-card-title class="card-title">프로젝트 정보</v-card-title>
          <v-card-text>
            <v-row dense>
              <!-- 프로젝트명 : 한 줄 전체 -->
              <v-col cols="12" md="12">
                <div class="input-label">프로젝트명</div>
                <v-text-field
                  v-model="form.projectName"
                  placeholder="프로젝트명을 입력하세요"
                  variant="outlined"
                  class="input-field"
                  hide-details
                />
              </v-col>

              <!-- 고객사 + 고객사 담당자 같은 라인 -->
              <v-col cols="12" md="6">
                <div class="input-label">고객사</div>
                <v-text-field
                  v-model="form.clientCompany"
                  placeholder="고객사를 선택하세요"
                  variant="outlined"
                  class="input-field"
                  hide-details
                  readonly
                  @click="clientDialog = true"
                />
              </v-col>

              <v-col cols="12" md="6">
                <div class="input-label">고객사 담당자</div>
                <v-text-field
                  v-model="form.client"
                  placeholder="고객사 담당자를 선택하세요"
                  variant="outlined"
                  class="input-field"
                  hide-details
                  readonly
                  @click="clientPersonDialog = true"
                />
              </v-col>

              <!-- 설명 -->
              <v-col cols="12">
                <div class="input-label">설명(메모)</div>
                <v-textarea
                  v-model="form.description"
                  placeholder="프로젝트 관련 메모를 입력하세요"
                  variant="outlined"
                  rows="3"
                  class="input-field textarea-field"
                  hide-details
                />
              </v-col>

              <!-- 영업 담당 -->
              <v-col cols="12" md="6">
                <div class="input-label">영업 담당</div>
                <v-text-field
                  v-model="form.salesManager"
                  placeholder="담당 직원을 선택하세요"
                  variant="outlined"
                  class="input-field"
                  hide-details
                  readonly
                  @click="managerDialog = true"
                />
              </v-col>

              <!-- 유형 -->
              <v-col cols="12" md="6">
                <div class="input-label">유형</div>
                <v-select
                  v-model="form.salesType"
                  :items="typeList"
                  placeholder="판매 유형을 선택하세요"
                  variant="outlined"
                  class="input-field"
                  hide-details
                  dense
                  solo
                />
              </v-col>

              <!-- 상태 (읽기 전용) -->
              <v-col cols="12" md="6">
                <div class="input-label">상태</div>
                <v-text-field
                  :model-value="project.status"
                  readonly
                  class="input-field readonly-field"
                  hide-details
                />
              </v-col>

              <!-- 시작일 -->
              <v-col cols="12" md="6">
                <div class="input-label">시작일</div>
                <v-menu
                  v-model="startMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      :model-value="formattedStartDate"
                      placeholder="시작일"
                      readonly
                      v-bind="props"
                      class="input-field"
                      hide-details
                    />
                  </template>
                  <v-date-picker
                    v-model="form.startDate"
                    @update:model-value="startMenu = false"
                  />
                </v-menu>
              </v-col>

              <!-- 종료일 -->
              <v-col cols="12" md="6">
                <div class="input-label">종료일</div>
                <v-menu
                  v-model="endMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      :model-value="formattedEndDate"
                      placeholder="종료일"
                      readonly
                      v-bind="props"
                      class="input-field"
                      hide-details
                    />
                  </template>
                  <v-date-picker
                    v-model="form.endDate"
                    @update:model-value="endMenu = false"
                  />
                </v-menu>
              </v-col>

              <!-- 예상 매출 -->
              <v-col cols="12" md="6">
                <div class="input-label">예상 매출액</div>
                <v-text-field
                  :model-value="formattedRevenue"
                  placeholder="금액을 입력하세요"
                  variant="outlined"
                  class="input-field suffix-input"
                  hide-details
                  @update:model-value="updateRevenue"
                >
                  <template #append-inner>
                    <span class="suffix-text">원</span>
                  </template>
                </v-text-field>
              </v-col>

              <!-- 마진율 -->
              <v-col cols="12" md="6">
                <div class="input-label">예상 마진율</div>
                <v-text-field
                  v-model.number="form.expectedMarginRate"
                  placeholder="0~100"
                  type="number"
                  variant="outlined"
                  class="input-field suffix-input"
                  hide-details
                >
                  <template #append-inner>
                    <span class="suffix-text">%</span>
                  </template>
                </v-text-field>
              </v-col>

              <!-- 자동계산 예상 이익 -->
              <v-col cols="12" md="6">
                <div class="input-label">예상 이익</div>
                <v-text-field
                  :model-value="formattedProfit"
                  readonly
                  variant="outlined"
                  class="input-field result-field"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end actions-row">
            <v-btn
              color="red darken-2"
              class="white--text mr-2"
              small
              @click="onDeleteProject"
            >
              삭제하기
            </v-btn>
            <v-btn
              color="orange darken-2"
              class="white--text"
              small
              @click="saveProject"
            >
              저장하기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 우측 제안/이력 카드 영역 -->
      <v-col cols="12" md="6">
        <div class="cards-container">
          <!-- 상단 필터 영역 -->
          <v-card class="history-filter-card" elevation="0">
            <div class="history-filter-header">
              <div class="history-filter-label">이력 상태</div>
              <div class="history-filter-select">
                <span>완료됨</span>
                <v-icon size="16">mdi-chevron-down</v-icon>
              </div>
            </div>
          </v-card>

          <!-- 개별 이력 카드 -->
          <v-card
            v-for="(item, index) in historyItems"
            :key="index"
            class="history-card mb-3"
            elevation="0"
            @click="goToHistoryDetail(item)"
            style="cursor: pointer"
          >
            <div class="history-inner">
              <!-- 왼쪽 아이콘 + 세로 라인 -->
              <div class="history-left">
                <div class="history-line"></div>
                <div class="history-icon" :class="`history-icon--${item.type}`">
                  <v-icon size="18">{{ item.icon }}</v-icon>
                </div>
              </div>

              <!-- 중앙 내용 -->
              <div class="history-main">
                <div class="history-top-row">
                  <div class="history-type">{{ item.label }}</div>
                  <div class="history-date">{{ item.date }}</div>
                </div>

                <div class="history-title">
                  {{ item.title }}
                </div>

                <div class="history-desc" v-if="item.description">
                  {{ item.description }}
                </div>

                <div class="history-meta" v-if="item.meta">
                  {{ item.meta }}
                </div>

                <!-- 계약 -->
                <div class="history-amount-row" v-if="item.type === 'contract'">
                  <span class="history-amount">
                    KRW {{ Number(item.amount).toLocaleString() }}
                    + α × {{ item.commissionRate }}%
                  </span>
                  <span class="history-writer" v-if="item.writer">{{ item.writer }}</span>
                </div>

                <!-- 제안/견적 -->
                <div class="history-amount-row" v-else-if="item.amount">
                  <span class="history-amount">KRW {{ Number(item.amount).toLocaleString() }}</span>
                </div>
                
              </div>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- 고객사 선택 모달 -->
    <v-dialog v-model="clientDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-3">고객사 선택</div>

        <div class="mb-2 d-flex">
          <v-chip
            class="mr-2"
            :color="clientTypeFilter === 'ALL' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'ALL' ? 'white' : undefined"
            @click="clientTypeFilter = 'ALL'"
          >
            전체
          </v-chip>
          <v-chip
            class="mr-2"
            :color="
              clientTypeFilter === 'CLIENT' ? 'orange darken-2' : undefined
            "
            :text-color="clientTypeFilter === 'CLIENT' ? 'white' : undefined"
            @click="clientTypeFilter = 'CLIENT'"
          >
            고객사
          </v-chip>
          <v-chip
            :color="clientTypeFilter === 'LEAD' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'LEAD' ? 'white' : undefined"
            @click="clientTypeFilter = 'LEAD'"
          >
            잠재고객사
          </v-chip>
        </div>

        <v-text-field
          v-model="clientSearch"
          placeholder="고객사명을 입력하세요"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mb-3 input-field"
        />

        <v-list>
          <v-list-item
            v-for="item in filteredClients"
            :key="item.id"
            @click="selectClient(item)"
            class="dialog-item"
          >
            {{ item.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 고객 담당자 선택 모달 -->
    <v-dialog v-model="clientPersonDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-3">고객 담당자 선택</div>

        <v-text-field
          v-model="clientPersonSearch"
          placeholder="검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mb-3 input-field"
        />

        <v-list>
          <v-list-item
            v-for="p in filteredClientPersons"
            :key="p.id"
            @click="selectClientPerson(p)"
            class="dialog-item"
          >
            {{ p.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 영업 관리자 선택 모달 -->
    <v-dialog v-model="managerDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-3">영업 관리자 선택</div>

        <v-text-field
          v-model="managerSearch"
          placeholder="검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mb-3 input-field"
        />

        <v-list>
          <v-list-item
            v-for="m in filteredManagers"
            :key="m.userId"
            @click="selectManager(m)"
            class="dialog-item"
            :class="{ 'selected-item': selectedManagerId === m.userId }"
          >
            <v-list-item-title>{{ m.name }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-card-actions class="justify-end mt-2">
          <v-btn
            color="orange darken-2"
            class="white--text"
            :disabled="!selectedManagerId"
            @click="confirmManagerSelect"
          >
            선택하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 파이프라인 변경 확인 모달 -->
    <v-dialog v-model="pipelineConfirmDialog" width="400">
      <v-card class="pa-4">
        <div class="dialog-title mb-3">진행 상태 변경</div>
        <div class="mb-4">
          진행 상태를
          <strong>
            {{ targetStageName }}
          </strong>
          단계로 변경하시겠습니까?
        </div>
        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            color="grey darken-1"
            @click="pipelineConfirmDialog = false"
          >
            아니오
          </v-btn>
          <v-btn
            color="orange darken-2"
            class="white--text"
            @click="confirmChangePipelineStage"
          >
            예
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getProjectDetail,
  updateProject,
  updateProjectManager,
  deleteProject,
} from "@/apis/project";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client";
import { getUserList } from "@/apis/user";
import { updatePipelineStage } from "@/apis/pipeline";

const route = useRoute();
const router = useRouter();
const startMenu = ref(false);
const endMenu = ref(false);

const clientDialog = ref(false);
const managerDialog = ref(false);
const clientPersonDialog = ref(false);

const clientSearch = ref("");
const managerSearch = ref("");
const clientPersonSearch = ref("");

const project = reactive({
  id: null,
  status: "",
  statusCode: "",
  progress: 0,
  pipeline: [],
  pipelineId: null,
});

const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");

const showError = (
  err,
  fallbackMessage = "요청 처리 중 오류가 발생했습니다."
) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.errorMessage ||
    fallbackMessage;

  snackbarMessage.value = msg;
  snackbarColor.value = "error";
  snackbar.value = true;
};

const showSuccess = (msg = "저장이 완료되었습니다.") => {
  snackbarMessage.value = msg;
  snackbarColor.value = "success";
  snackbar.value = true;
};

/* 날짜 라벨 포맷: yyyy-MM-dd만 사용 */
const formatDateLabel = (value) => {
  if (!value) return "";
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

/* 금액 포맷: 소수점 없이 정수만 */
const formatAmount = (val) => {
  if (val == null || isNaN(val)) return "";
  return Number(val).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
};

/* 파이프라인 변경 확인용 상태 */
const pipelineConfirmDialog = ref(false);
const targetStageNo = ref(null);

const openPipelineConfirm = (stageNo) => {
  targetStageNo.value = stageNo;
  pipelineConfirmDialog.value = true;
};

const confirmChangePipelineStage = async () => {
  if (!targetStageNo.value) {
    pipelineConfirmDialog.value = false;
    return;
  }
  await changePipelineStage(targetStageNo.value);
  pipelineConfirmDialog.value = false;
  targetStageNo.value = null;
};

const targetStageName = computed(() => {
  if (!targetStageNo.value || !project.pipeline.length) return "";
  const idx = targetStageNo.value - 1;
  return project.pipeline[idx]?.name || "";
});

const changePipelineStage = async (targetStageNoParam) => {
  try {
    if (!project.pipelineId) {
      showError(null, "파이프라인 ID를 찾을 수 없습니다.");
      return;
    }

    await updatePipelineStage(project.pipelineId, {
      targetStageNo: targetStageNoParam,
    });

    const res = await getProjectDetail(project.id);
    applyDetailDto(res.data);

    showSuccess("진행 단계가 변경되었습니다.");
  } catch (err) {
    showError(err, "단계를 변경할 수 없습니다.");
  }
};

const form = reactive({
  projectName: "",
  clientCompany: "",
  clientCompanyId: null,
  client: "",
  clientId: null,
  salesManager: "",
  salesManagerId: null,
  salesType: "",
  startDate: null,
  endDate: null,
  expectedRevenue: null,
  expectedMarginRate: null,
  expectedProfit: null,
  description: "",
});

const clientTypeFilter = ref("ALL");
const clientPage = ref(1);
const clientPageSize = ref(10);
const clientTotalCount = ref(0);
const clientList = ref([]);

const clientPersonList = ref([]);
const managerList = ref([]);
const selectedManagerId = ref(null);

const typeList = ["팝업 스토어", "전시회", "임대"];

const historyItems = ref([]);

const translateStatus = (status) => {
  switch (status) {
    case "ACTIVE":
      return "진행중";
    case "SUCCESS":
      return "계약 성공";
    case "FAIL":
      return "실패";
    default:
      return status;
  }
};

const toLocalDateString = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const translateType = (type) => {
  switch (type) {
    case "POPUP":
      return "팝업 스토어";
    case "EXHIBITION":
      return "전시회";
    case "RENTAL":
      return "입점";
    default:
      return type;
  }
};

const mapSalesTypeToEnum = (label) => {
  switch (label) {
    case "팝업 스토어":
      return "POPUP";
    case "전시회":
      return "EXHIBITION";
    case "입점":
      return "RENTAL";
    default:
      return null;
  }
};

const applyDetailDto = (dto) => {
  project.id = dto.projectId;
  project.statusCode = dto.status;
  project.status = translateStatus(dto.status);

  project.progress = dto.pipelineInfo?.progressRate ?? 0;

  project.pipeline = (dto.stageList || []).map((s) => ({
    stageNo: s.stageNo,
    name: s.stageName,
    completed: s.completed === true,
  }));

  project.pipelineId = dto.pipelineInfo?.pipelineId ?? null;

  form.projectName = dto.title;
  form.clientCompany = dto.clientCompanyName;
  form.client = dto.clientName;
  form.description = dto.description || "";
  form.salesManager = dto.salesManagerName;
  form.salesType = translateType(dto.type);
  form.startDate = dto.startDay;
  form.endDate = dto.endDay;
  form.expectedRevenue = dto.expectedRevenue;
  form.expectedMarginRate = dto.expectedMarginRate;
  form.expectedProfit =
    dto.expectedRevenue && dto.expectedMarginRate
      ? (dto.expectedRevenue * dto.expectedMarginRate) / 100
      : null;

  historyItems.value = [];

  // 제안 이력
  (dto.proposals || []).forEach((p) => {
    const dateSource = p.submitDate || p.requestDate || "";
    historyItems.value.push({
      type: "proposal",
      id: p.proposalId,
      icon: "mdi-file-document-outline",
      label: "제안",
      title: p.title,
      description: `[${dto.clientCompanyName}] / [${p.writerName}]`,
      meta: p.requestDate ? `요청일 : ${p.requestDate}` : "",
      amount: dto.expectedRevenue || null,
      date: formatDateLabel(dateSource),
    });
  });

  // 견적 이력
  (dto.estimates || []).forEach((e) => {
    historyItems.value.push({
      type: "estimate",
      id: e.estimateId,
      icon: "mdi-calculator-variant",
      label: "견적",
      title: e.title,
      description: `[${dto.clientCompanyName}] / [${e.writerName}]`,
      meta: `작성일 : ${e.createdDate}`,
      amount: e.totalAmount,
      date: formatDateLabel(e.createdDate),
    });
  });

  // 계약 이력
  if (dto.contracts) {
    dto.contracts.forEach((c) => {
      historyItems.value.push({
        type: "contract",
        id:c.contractId,
        icon: "mdi-handshake",
        label: "계약",
        title: c.contractTitle,
        description: `[${c.clientCompanyName}] / [${c.clientName}]`,
        meta: `계약 기간: ${c.contractStartDate ?? '-'} ~ ${c.contractEndDate ?? '-'}`,
        amount: c.totalAmount,
        commissionRate: c.commissionRate,
        writer: c.createdUserName,
        date: c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '-'
      });
    });
  }

  // 매출 이력
  (dto.revenues || []).forEach((r) => {
    historyItems.value.push({
      type: "revenue",
      id: r.revenueId,
      icon: "mdi-cash-multiple",
      label: "매출",
      title: `[매출] 총 금액 ${formatAmount(r.totalPrice)}원`,
      description: r.remark || "",
      meta:
        r.baseRentSnapshot != null
          ? `기준 임대료: ${formatAmount(r.baseRentSnapshot)}원`
          : "",
      amount: r.totalPrice,
      date: formatDateLabel(r.createdAt),
    });
  });
};


const loadClients = async () => {
  const params = {
    page: clientPage.value,
    size: clientPageSize.value,
  };

  if (clientTypeFilter.value !== "ALL") {
    params.type = clientTypeFilter.value;
  }

  if (clientSearch.value.trim()) {
    params.keyword = clientSearch.value.trim();
  }

  const res = await getSimpleClientCompanies(params);
  clientList.value = res.data.content || [];
  clientTotalCount.value = res.data.totalCount || 0;
};

const filteredClients = computed(() =>
  clientList.value.filter((c) => c.name.includes(clientSearch.value))
);

watch(clientDialog, (open) => {
  if (open) {
    clientPage.value = 1;
    loadClients();
  }
});

watch([clientTypeFilter, clientSearch], () => {
  if (clientDialog.value) {
    clientPage.value = 1;
    loadClients();
  }
});

const loadClientPersons = async (companyId) => {
  if (!companyId) return;

  const params = { page: 1, size: 50 };

  if (clientPersonSearch.value.trim()) {
    params.keyword = clientPersonSearch.value.trim();
  }

  const res = await getSimpleClientsByCompany(companyId, params);
  clientPersonList.value = res.data.content || [];
};

const filteredClientPersons = computed(() => clientPersonList.value);

watch(clientPersonDialog, (open) => {
  if (open && form.clientCompanyId) {
    clientPersonSearch.value = "";
    loadClientPersons(form.clientCompanyId);
  }
});

watch(clientPersonSearch, () => {
  if (form.clientCompanyId && clientPersonDialog.value) {
    loadClientPersons(form.clientCompanyId);
  }
});

const loadManagers = async () => {
  const res = await getUserList();
  managerList.value = res.data || [];
};

watch(managerDialog, async (open) => {
  if (open) {
    managerSearch.value = "";
    selectedManagerId.value = form.salesManagerId;
    await loadManagers();
  }
});

const filteredManagers = computed(() =>
  managerList.value.filter((m) => m.name.includes(managerSearch.value))
);

const selectClient = (item) => {
  form.clientCompany = item.name;
  form.clientCompanyId = item.id;
  form.client = "";
  form.clientId = null;
  clientPersonSearch.value = "";
  clientPersonList.value = [];
  clientDialog.value = false;
  loadClientPersons(item.id);
};

const selectClientPerson = (p) => {
  form.client = p.name;
  form.clientId = p.id;
  clientPersonDialog.value = false;
};

const selectManager = (item) => {
  selectedManagerId.value = item.userId;
};

const confirmManagerSelect = async () => {
  if (!selectedManagerId.value) return;

  const selected = managerList.value.find(
    (m) => m.userId === selectedManagerId.value
  );
  if (!selected) return;

  try {
    await updateProjectManager(project.id, selected.userId);

    form.salesManagerId = selected.userId;
    form.salesManager = selected.name;
    managerDialog.value = false;

    showSuccess("담당자가 변경되었습니다.");
  } catch (err) {
    showError(err, "담당자를 변경할 수 없습니다.");
  }
};

const formattedRevenue = computed(() => {
  if (!form.expectedRevenue) return "";
  return Number(form.expectedRevenue).toLocaleString();
});

const onDeleteProject = async () => {
  if (!project.id) return;

  const ok = window.confirm("프로젝트를 삭제하시겠습니까?");
  if (!ok) return;

  try {
    await deleteProject(project.id);

    showSuccess("프로젝트가 삭제되었습니다.");
    router.push("/project");
  } catch (err) {
    showError(err, "프로젝트를 삭제할 수 없습니다.");
  }
};

const updateRevenue = (val) => {
  const numeric = Number((val || "").replace(/[^0-9]/g, ""));
  form.expectedRevenue = numeric || null;
};

const formattedProfit = computed(() => {
  if (!form.expectedRevenue || !form.expectedMarginRate) return "";
  const profit = (form.expectedRevenue * form.expectedMarginRate) / 100;
  form.expectedProfit = profit;
  return profit.toLocaleString() + " 원";
});

const toDateString = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formattedStartDate = computed(() => toDateString(form.startDate));
const formattedEndDate = computed(() => toDateString(form.endDate));

const saveProject = async () => {
  const payload = {
    title: form.projectName,
    description: form.description || "",
    type: mapSalesTypeToEnum(form.salesType),
    expectedRevenue: form.expectedRevenue,
    expectedMarginRate: form.expectedMarginRate,
    startDay: toLocalDateString(form.startDate),
    endDay: toLocalDateString(form.endDate),
  };

  try {
    await updateProject(project.id, payload);

    const res = await getProjectDetail(project.id);
    applyDetailDto(res.data);

    showSuccess("프로젝트 저장이 완료되었습니다.");
  } catch (err) {
    showError(err, "프로젝트를 저장할 수 없습니다.");
  }
};

const goToHistoryDetail = (item) => {
  if (!item?.id) return;

  switch (item.type) {
    case "proposal":
      router.push(`/proposal/${item.id}`);
      break;

    case "estimate":
      router.push(`/estimate/${item.id}`);
      break;

    case "contract":
      router.push(`/contract/${item.id}`);
      break;

    case "revenue":
      router.push(`/revenue/${item.id}`);
      break;

    default:
      console.warn("Unknown history type:", item.type);
  }
};
onMounted(async () => {
  const projectId = route.params.projectId || route.params.id;
  if (!projectId) return;
  const res = await getProjectDetail(projectId);
  applyDetailDto(res.data);
});
</script>

<style scoped>
.detail-container {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 8px 16px 10px !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
}

.project-title {
  max-width: 1100px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
  margin: 4px auto 0;
}

.project-card {
  border-radius: 14px;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  padding: 10px 16px 12px;
  max-width: 1100px;
  margin: 0 auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 4px 0 2px;
  margin-bottom: 12px;
}

.project-card :deep(.v-col) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.input-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.input-field {
  border-radius: 6px !important;
}

.input-field :deep(.v-field) {
  --v-input-control-height: 45px !important;
  min-height: 45px !important;
  height: 45px !important;
}

.input-field :deep(.v-field__input),
.input-field :deep(input),
.input-field :deep(textarea) {
  font-size: 0.78rem !important;
  line-height: 1.25 !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  min-height: 45px !important;
}

.suffix-input :deep(.v-field__append-inner) {
  padding-right: 6px;
}

.suffix-text {
  font-size: 0.78rem;
  line-height: 1.1;
  display: flex;
  align-items: center;
}

.textarea-field :deep(.v-field) {
  min-height: 80px !important;
}

.textarea-field :deep(.v-field__input) {
  padding-top: 16px !important;
  padding-bottom: 10px !important;
  align-items: flex-start !important;
}

.textarea-field :deep(textarea) {
  min-height: 65px !important;
  line-height: 1.25 !important;
  resize: none !important;
}

.readonly-field :deep(input) {
  background-color: #f2f2f2 !important;
  color: #555 !important;
}

/* 파이프라인 */
.pipeline-full {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  margin: 4px auto 18px;
  max-width: 1100px;
}

.pipeline-step {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
  cursor: pointer;
  min-width: 80px;
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
  height: 3px;
  margin: 0 6px;
  border-radius: 2px;
  background-color: #ccc;
}

.pipeline-line.completed {
  background-color: orange;
}

.progress-text {
  position: absolute;
  right: 0;
  bottom: -18px;
  font-size: 0.75rem;
  color: #888;
}

.actions-row {
  padding-top: 6px;
}

.cards-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* 오른쪽 상단 필터 카드 */
.history-filter-card {
  border-radius: 14px;
  border: 1px solid #e5e5e5;
  padding: 6px 14px;
  margin-bottom: 10px;
  background-color: #fff;
}

.history-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
}

.history-filter-select {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: #444;
}

/* 개별 이력 카드 */
.history-card {
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  background-color: #fff;
  padding: 10px 14px;
}

.history-inner {
  display: flex;
}

.history-left {
  position: relative;
  width: 32px;
  display: flex;
  justify-content: center;
}

.history-line {
  position: absolute;
  top: 0;
  bottom: -12px;
  width: 2px;
  background-color: #e5e5e5;
}

.history-card:last-child .history-line {
  bottom: 0;
}

.history-icon {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eef3ff;
}

.history-icon--proposal {
  background-color: #eef3ff;
}

.history-main {
  flex: 1;
  margin-left: 10px;
}

.history-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.history-type {
  font-size: 0.78rem;
  font-weight: 600;
  color: #333;
}

.history-date {
  font-size: 0.75rem;
  color: #999;
}

.history-title {
  font-size: 0.86rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 2px;
}

.history-desc {
  font-size: 0.78rem;
  color: #555;
  margin-bottom: 2px;
}

.history-meta {
  font-size: 0.75rem;
  color: #777;
  margin-bottom: 2px;
}

.history-amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #888;
}

.history-writer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #888;
}

.history-amount {
  font-size: 0.8rem;
  font-weight: 600;
  color: #111;
}

.dialog-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.dialog-item {
  padding: 5px 6px !important;
  cursor: pointer;
  font-size: 0.8rem;
}

.dialog-item:hover {
  background: #fff3e0 !important;
}

.selected-item {
  background-color: #ffe0b2 !important;
}

/* 스낵바 디자인 */
.toast-snackbar {
  font-weight: 600;
}

:deep(.toast-snackbar .v-snackbar__wrapper) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

:deep(.toast-snackbar .v-snackbar__content) {
  font-size: 0.85rem;
}
</style>
