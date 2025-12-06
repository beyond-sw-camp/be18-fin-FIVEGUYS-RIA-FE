<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 페이지 타이틀 -->
    <div class="page-title">제안 상세</div>

    <!-- 카드 -->
    <v-card elevation="1" class="project-card">
      <div class="section-title">제안 정보</div>

      <v-row dense class="container">
        <!-- 제안명 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안명</div>
          <v-text-field
            v-model="form.projectName"
            placeholder="제안명을 입력하세요"
            variant="outlined"
            class="input-field"
            hide-details
            :readonly="!editMode"
          />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field
            v-model="form.clientCompany"
            placeholder="고객사를 선택하세요"
            variant="outlined"
            class="input-field"
            hide-details
            readonly
            @click="editMode && (companyDialog = true)"
          />
        </v-col>

        <!-- 프로젝트 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트</div>
          <v-text-field
            v-model="form.projectType"
            placeholder="프로젝트가 연결되어 있지 않습니다."
            variant="outlined"
            class="input-field"
            hide-details
            :readonly="!editMode"
            @click="editMode && (opportunityDialog = true)"
          />
        </v-col>

        <!-- 고객 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객</div>
          <v-text-field
            v-model="form.clientOwner"
            placeholder="고객을 선택하세요"
            variant="outlined"
            class="input-field"
            hide-details
            :readonly="!editMode"
            @click="editMode && (clientDialog = true)"
          />
        </v-col>

        <!-- 내용 -->
        <v-col cols="12">
          <div class="input-label">내용</div>
          <v-textarea
            v-model="form.content"
            placeholder="내용을 입력하세요"
            variant="outlined"
            class="input-field textarea-field"
            hide-details
            :readonly="!editMode"
            rows="4"
          />
        </v-col>

        <!-- 요청일 -->
        <v-col cols="12" md="3">
          <div class="input-label">요청일</div>
          <v-menu
            v-model="startMenu"
            :close-on-content-click="false"
            offset-y
            :disabled="!editMode"
          >
            <template #activator="{ props }">
              <v-text-field
                :model-value="formatDate(form.startDate)"
                placeholder="요청일"
                variant="outlined"
                readonly
                v-bind="props"
                class="input-field"
              />
            </template>
            <v-date-picker
              v-model="form.startDate"
              @update:model-value="startMenu = false"
            />
          </v-menu>
        </v-col>

        <!-- 제출일 -->
        <v-col cols="12" md="3">
          <div class="input-label">제출일</div>
          <v-menu
            v-model="endMenu"
            :close-on-content-click="false"
            offset-y
            :disabled="!editMode"
          >
            <template #activator="{ props }">
              <v-text-field
                :model-value="formatDate(form.endDate)"
                placeholder="제출일"
                variant="outlined"
                hide-details
                readonly
                v-bind="props"
                class="input-field"
              />
            </template>
            <v-date-picker
              v-model="form.endDate"
              @update:model-value="endMenu = false"
            />
          </v-menu>
        </v-col>

        <!-- 담당자 -->
        <v-col cols="12" md="6">
          <div class="input-label">담당자</div>
          <v-text-field
            v-model="form.salesManager"
            placeholder="담당자를 선택하세요"
            variant="outlined"
            class="input-field"
            hide-details
            :readonly="!editMode"
            @click="editMode && (managerDialog = true)"
          />
        </v-col>

        <!-- 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea
            v-model="form.notes"
            placeholder="비고를 입력하세요"
            variant="outlined"
            class="input-field textarea-field"
            hide-details
            :readonly="!editMode"
            rows="4"
          />
        </v-col>
      </v-row>

      <!-- 버튼 그룹 -->
      <div class="actions-row">
        <div v-if="!editMode" class="d-flex gap-3">
          <v-btn
            color="orange darken-2"
            class="white--text px-6"
            rounded="lg"
            elevation="2"
            @click="editMode = true"
          >
            편집
          </v-btn>
          <v-btn
            color="red darken-2"
            class="white--text px-6"
            rounded="lg"
            elevation="2"
            @click="onDeleteProposal"
          >
            삭제
          </v-btn>
        </div>
        <div v-else class="d-flex gap-3">
          <v-btn
            color="orange darken-2"
            class="white--text px-6"
            rounded="lg"
            elevation="2"
            @click="saveProposal"
          >
            저장
          </v-btn>
          <v-btn
            color="grey darken-1"
            class="white--text px-6"
            rounded="lg"
            elevation="2"
            @click="cancelEdit"
          >
            취소
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- 고객사 선택 모달 -->
    <v-dialog v-model="companyDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객사 선택</div>

        <div class="mb-3 d-flex">
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
          class="mb-4"
        />

        <v-list>
          <v-list-item
            v-for="item in filteredCompanies"
            :key="item.id"
            @click="selectCompany(item)"
            class="dialog-item"
          >
            {{ item.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 고객 모달 -->
    <v-dialog v-model="clientDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객 선택</div>

        <v-text-field
          v-model="clientPersonSearch"
          placeholder="고객명을 입력하세요"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mb-4"
        />

        <v-list>
          <v-list-item
            v-for="p in filteredClientPersons"
            :key="p.id"
            @click="selectClient(p)"
            class="dialog-item"
          >
            {{ p.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 프로젝트(영업 기회) 모달 -->
    <v-dialog v-model="opportunityDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">프로젝트 선택</div>
        <v-list>
          <v-list-item
            v-for="o in opportunityList"
            :key="o.id"
            @click="selectOpportunity(o)"
            class="dialog-item"
          >
            {{ o.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 담당자 모달 -->
    <v-dialog v-model="managerDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">담당자 선택</div>
        <v-list>
          <v-list-item
            v-for="m in managerList"
            :key="m"
            @click="selectManager(m)"
            class="dialog-item"
          >
            {{ m }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import {
  createProposal,
  getProposalDetail,
  updateProposal,
  deleteProposal as deleteProposalApi,
} from "@/apis/proposal";

import {
  getProjectTitles,
  getProjectMeta,
  getProjectsWithPipelines,
} from "@/apis/project";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client";

const router = useRouter();
const route = useRoute();

const editMode = ref(false);

const startMenu = ref(false);
const endMenu = ref(false);

const companyDialog = ref(false);
const clientDialog = ref(false);
const opportunityDialog = ref(false);
const managerDialog = ref(false);

const clientSearch = ref("");
const clientTypeFilter = ref("ALL");
const clientPersonSearch = ref("");

const form = reactive({
  projectName: "",
  projectId: null,
  projectType: "",
  clientCompanyId: null,
  clientCompany: "",
  clientId: null,
  clientOwner: "",
  startDate: "",
  endDate: "",
  content: "",
  notes: "",
  salesManager: "",
});

// 프로젝트
const opportunityList = ref([]);

const fetchProjectTitles = async () => {
  const res = await getProjectsWithPipelines({
    myProject: true,
    page: 1,
    size: 100,
  });

  opportunityList.value = res.data.content.map((p) => ({
    id: p.projectId,
    name: p.title, // 백엔드 필드명: title
  }));
};
watch(opportunityDialog, (open) => {
  if (open) fetchProjectTitles();
});

const selectOpportunity = async (o) => {
  form.projectId = o.id;
  form.projectType = o.name;

  const { data } = await getProjectMeta(o.id);

  form.projectId = data.projectId;
  form.projectType = data.projectName || o.name; // ← 핵심
  form.clientCompanyId = data.clientCompanyId;
  form.clientCompany = data.clientCompanyName;
  form.clientId = data.clientId;
  form.clientOwner = data.clientName;

  opportunityDialog.value = false;
};
// 제안 수정 시 날짜 포맷 바뀌지 않게 수정
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const toLocalDate = (d) => {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// 고객사 리스트
const companyPage = ref(1);
const companyPageSize = ref(10);
const companyTotalCount = ref(0);

const companyList = ref([]);

const loadCompanies = async () => {
  const params = {
    page: companyPage.value,
    size: companyPageSize.value,
  };

  if (clientTypeFilter.value && clientTypeFilter.value !== "ALL") {
    params.type = clientTypeFilter.value;
  }
  if (clientSearch.value.trim()) {
    params.keyword = clientSearch.value.trim();
  }

  const res = await getSimpleClientCompanies(params);
  companyList.value = res.data.content || [];
  companyTotalCount.value = res.data.totalCount || 0;
};

const filteredCompanies = computed(() =>
  (companyList.value || []).filter((c) => c.name?.includes(clientSearch.value))
);

watch(companyDialog, (open) => {
  if (open) {
    companyPage.value = 1;
    loadCompanies();
  }
});

watch([clientTypeFilter, clientSearch], () => {
  if (companyDialog.value) {
    companyPage.value = 1;
    loadCompanies();
  }
});

const selectCompany = (item) => {
  form.clientCompanyId = item.id;
  form.clientCompany = item.name;

  form.clientId = null;
  form.clientOwner = "";
  clientPersonSearch.value = "";
  clientList.value = [];

  companyDialog.value = false;
  loadClientsByCompany(item.id);
};

// 고객(담당자)
const clientList = ref([]);

const loadClientsByCompany = async (companyId) => {
  if (!companyId) return;

  const params = { page: 1, size: 50 };
  if (clientPersonSearch.value.trim()) {
    params.keyword = clientPersonSearch.value.trim();
  }

  const res = await getSimpleClientsByCompany(companyId, params);
  clientList.value = res.data.content || [];
};

const filteredClientPersons = computed(() =>
  (clientList.value || []).filter((p) =>
    p.name?.includes(clientPersonSearch.value)
  )
);

watch(clientDialog, (open) => {
  if (open && form.clientCompanyId) {
    clientPersonSearch.value = "";
    loadClientsByCompany(form.clientCompanyId);
  }
});

watch(clientPersonSearch, () => {
  if (clientDialog.value && form.clientCompanyId) {
    loadClientsByCompany(form.clientCompanyId);
  }
});

const selectClient = (p) => {
  form.clientId = p.id;
  form.clientOwner = p.name;
  clientDialog.value = false;
};

// 담당자
const managerList = ref(["박팀장", "최팀장", "장팀장"]);

const selectManager = (m) => {
  form.salesManager = m;
  managerDialog.value = false;
};

// 스낵바
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("red");

const showSuccess = (msg = "저장이 완료되었습니다.") => {
  snackbarMessage.value = msg;
  snackbarColor.value = "green";
  snackbar.value = true;
};

const showError = (err) => {
  const message =
    err?.response?.data?.message || "요청 처리 중 오류가 발생했습니다.";

  snackbarMessage.value = message;
  snackbarColor.value = "red";
  snackbar.value = true;
};

// 저장 / 편집
const saveProposal = async () => {
  const payload = {
    title: form.projectName,
    clientCompanyId: form.clientCompanyId,
    clientId: form.clientId,
    projectId: form.projectId,
    data: form.content,
    requestDate: toLocalDate(form.startDate),
    submitDate: toLocalDate(form.endDate),
    remark: form.notes || null,
  };

  const id = route.params.id;

  try {
    await updateProposal(id, payload);
    showSuccess("제안서 저장이 완료되었습니다.");
    editMode.value = false;
    await loadDetail();
  } catch (err) {
    showError(err);
    editMode.value = false;
  }
};

const onDeleteProposal = async () => {
  const id = route.params.id;
  if (!id) return;

  const ok = window.confirm("제안을 삭제하시겠습니까?");
  if (!ok) return;

  try {
    await deleteProposalApi(id);
    showSuccess("제안이 삭제되었습니다.");
    router.push({ name: "Proposal" });
  } catch (err) {
    showError(err);
  }
};

const loadDetail = async () => {
  const id = route.params.id;
  const { data } = await getProposalDetail(id);

  form.projectName = data.title;

  // ❗ 프로젝트가 있을 때만 값 넣고, 없으면 기존 값 유지
  if (data.projectId) {
    form.projectId = data.projectId;
    form.projectType = data.projectTitle;
  }

  // 고객사 / 고객
  form.clientCompanyId = data.clientCompanyId;
  form.clientCompany = data.clientCompanyName;
  form.clientId = data.clientId;
  form.clientOwner = data.clientName;

  // 날짜
  form.startDate = data.requestDate ? new Date(data.requestDate) : null;
  form.endDate = data.submitDate ? new Date(data.submitDate) : null;

  form.content = data.data;
  form.notes = data.remark;
  form.salesManager = data.createdUserName;
};

const cancelEdit = async () => {
  await loadDetail();
  editMode.value = false;
};

onMounted(loadDetail);
</script>

<style scoped>
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
  padding: 8px 16px 10px;
}

.page-title {
  max-width: 1100px;
  margin: 4px auto 10px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
}

.project-card {
  max-width: 1100px;
  margin: 0 auto 10px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e5e5e5;
  padding: 8px 14px 10px;
}

/* 위쪽 컴포넌트와 동일한 헤더 간격 */
.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

/* 라벨 크게 */
.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.project-card :deep(.v-col) {
  padding-top: 1px !important;
  padding-bottom: 1px !important;
}

/* 인풋 박스/텍스트 높이 + 폰트 설정 (신규 제안 생성 페이지와 동일) */
.input-field {
  border-radius: 6px !important;
  font-size: 0.8rem;
}

.input-field :deep(.v-field) {
  min-height: 32px !important;
  height: 32px !important;
}

.input-field :deep(.v-field__input) {
  font-size: 0.8rem !important;
  line-height: 1.2 !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
}

/* 아이콘 / suffix 정렬 */
.input-field :deep(.v-field__append-inner),
.input-field :deep(.v-field__suffix),
.input-field :deep(.v-field__prepend-inner) {
  font-size: 0.8rem !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  align-items: center !important;
}

/* textarea 높이 + 폰트 + resize 제거 */
.textarea-field :deep(.v-field) {
  min-height: 65px !important;
}

.textarea-field :deep(.v-field__input) {
  font-size: 0.8rem !important;
  padding-top: 14px !important;
  padding-bottom: 6px !important;
  align-items: flex-start !important;
}

.textarea-field :deep(textarea) {
  min-height: 50px !important;
  line-height: 1.25 !important;
  resize: none !important;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
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
</style>
