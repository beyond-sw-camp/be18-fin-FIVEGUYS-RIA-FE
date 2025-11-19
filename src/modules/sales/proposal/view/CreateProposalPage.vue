<template>
  <v-container fluid class="pa-6 page-wrapper">
    <div class="page-title mb-6">새 제안 추가</div>

    <v-card elevation="3" class="project-card pa-8">
      <div class="section-title mb-6">제안 정보</div>

      <v-row dense>
        <!-- 제안명 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안명</div>
          <v-text-field
            v-model="form.projectName"
            placeholder="제안명을 입력하세요"
            variant="outlined"
            class="input-field"
            hide-details
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
            @click="companyDialog = true"
          />
        </v-col>

        <!-- 영업 기회 -->
        <v-col cols="12" md="6">
          <div class="input-label">영업 기회</div>
          <v-text-field
            v-model="form.projectType"
            placeholder="영업 기회를 선택하세요"
            variant="outlined"
            class="input-field"
            hide-details
            readonly
            @click="opportunityDialog = true"
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
            readonly
            @click="clientDialog = true"
          />
        </v-col>

        <!-- 내용 -->
        <v-col cols="12">
          <div class="input-label">내용</div>
          <v-textarea
            v-model="form.content"
            placeholder="내용을 입력하세요"
            variant="outlined"
            class="input-field"
            hide-details
            rows="4"
          />
        </v-col>

        <!-- 요청일 -->
        <v-col cols="12" md="3">
          <div class="input-label">요청일</div>
          <v-menu v-model="startMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field
                v-model="form.startDate"
                placeholder="요청일"
                variant="outlined"
                hide-details
                readonly
                v-bind="props"
                class="input-field"
              />
            </template>
            <v-date-picker v-model="form.startDate" @update:model-value="startMenu = false" />
          </v-menu>
        </v-col>

        <!-- 제출일 -->
        <v-col cols="12" md="3">
          <div class="input-label">제출일</div>
          <v-menu v-model="endMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field
                v-model="form.endDate"
                placeholder="제출일"
                variant="outlined"
                hide-details
                readonly
                v-bind="props"
                class="input-field"
              />
            </template>
            <v-date-picker v-model="form.endDate" @update:model-value="endMenu = false" />
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
            readonly
            @click="managerDialog = true"
          />
        </v-col>

        <!-- 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea
            v-model="form.notes"
            placeholder="비고를 입력하세요"
            variant="outlined"
            class="input-field"
            hide-details
            rows="4"
          />
        </v-col>
      </v-row>

      <!-- 버튼 그룹 -->
      <div class="text-right mt-8">
        <v-btn color="orange darken-2" class="white--text px-6" rounded="lg" elevation="2" @click="saveProposal">
          저장
        </v-btn>
        <v-btn color="grey darken-1" class="white--text px-6" rounded="lg" elevation="2" @click="cancelForm">
          취소
        </v-btn>
      </div>
    </v-card>

    <!-- 고객사 모달 -->
    <v-dialog v-model="companyDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객사 선택</div>
        <v-list>
          <v-list-item
            v-for="company in companyList"
            :key="company"
            @click="selectCompany(company)"
            class="company-button"
          >
            {{ company }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 고객 모달 -->
    <v-dialog v-model="clientDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객 선택</div>
        <v-text-field
          v-model="clientSearch"
          placeholder="검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mb-4"
        />
        <v-list>
          <template v-for="company in sortedCompanyList" :key="company">
            <v-list-item
              class="company-button"
              @click="toggleCompany(company)"
            >
              {{ company }}
            </v-list-item>

            <v-list-item
              v-for="client in clientsByCompany(company)"
              :key="client.name"
              v-show="expandedCompany.includes(company)"
              @click="selectClient(client)"
              class="dialog-item"
            >
              {{ client.name }}
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 프로젝트(영업 기회) 모달 -->
    <v-dialog v-model="opportunityDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">영업 기회 선택</div>
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
import { reactive, ref, computed, watch } from "vue";

const startMenu = ref(false);
const endMenu = ref(false);

const clientDialog = ref(false);
const managerDialog = ref(false);
const opportunityDialog = ref(false);
const companyDialog = ref(false);

const clientSearch = ref("");

// 데이터
const companyList = ["삼성전자", "LG CNS", "카카오"];
const clientList = [
  { name: "김사원", clientCompany: "삼성전자" },
  { name: "이팀장", clientCompany: "삼성전자" },
  { name: "박대리", clientCompany: "삼성전자" },
  { name: "홍영업", clientCompany: "LG CNS" },
  { name: "이영희", clientCompany: "LG CNS" },
  { name: "최고객", clientCompany: "카카오" },
];
const managerList = ["박팀장", "최팀장", "장팀장"];
const opportunityList = [
  { id: 1, name: "서비스", clientOwner: "김사원", clientCompany: "삼성전자", salesManager: "박팀장" },
  { id: 2, name: "패션", clientOwner: "홍영업", clientCompany: "LG CNS", salesManager: "최팀장" },
  { id: 3, name: "뷰티", clientOwner: "최고객", clientCompany: "카카오", salesManager: "장팀장" },
];

// 새 제안용 빈 form
const form = reactive({
  projectName: "",
  clientCompany: "",
  projectType: "",
  clientOwner: "",
  salesManager: "",
  startDate: "",
  endDate: "",
  content: "",
  notes: "",
});

// 고객 모달 관련
const expandedCompany = ref([]);

// 선택 고객사 최상단 정렬
const sortedCompanyList = computed(() => {
  const list = [...companyList];
  if (form.clientCompany) {
    const idx = list.indexOf(form.clientCompany);
    if (idx !== -1) {
      list.splice(idx, 1);
      list.unshift(form.clientCompany);
    }
  }
  return list;
});

// 검색 시 펼침
watch(clientSearch, (val) => {
  if (val.trim() !== "") {
    expandedCompany.value = [...companyList]; 
  } else if (form.clientCompany) {
    expandedCompany.value = [form.clientCompany]; 
  } else {
    expandedCompany.value = [];
  }
});

const toggleCompany = (company) => {
  expandedCompany.value = expandedCompany.value.includes(company)
    ? expandedCompany.value.filter(c => c !== company)
    : [company];
};

const clientsByCompany = (company) => {
  const keyword = clientSearch.value.toLowerCase();
  return clientList.filter(c => c.clientCompany === company && (!keyword || c.name.toLowerCase().includes(keyword)));
};

const selectClient = (c) => {
  form.clientOwner = c.name;
  form.clientCompany = c.clientCompany;
  expandedCompany.value = [c.clientCompany];
  clientDialog.value = false;
};

const selectManager = (m) => {
  form.salesManager = m;
  managerDialog.value = false;
};

const selectOpportunity = (o) => {
  form.projectType = o.name;
  form.clientOwner = o.clientOwner;
  form.clientCompany = o.clientCompany;
  form.salesManager = o.salesManager;
  expandedCompany.value = [o.clientCompany];
  opportunityDialog.value = false;
};

const selectCompany = (c) => {
  form.clientCompany = c;
  expandedCompany.value = [c];
  companyDialog.value = false;
};

const saveProposal = () => {
  alert(`새 제안 저장 완료\n제안명: ${form.projectName}`);
  // 실제 저장 로직은 API 호출 등으로 대체
};

const cancelForm = () => {
  for (const key in form) form[key] = ""; // 초기화
  expandedCompany.value = [];
  clientSearch.value = "";
};
</script>

<style scoped>
.page-wrapper {
  background: #fefefe;
  min-height: 100vh;
}
.page-title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #111;
}
.project-card {
  border-radius: 16px;
  background: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
}
.input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
}
.input-field {
  border-radius: 12px;
  background: #fff;
}
.dialog-title {
  font-size: 1.2rem;
  font-weight: 600;
}
.dialog-item {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
}
.dialog-item:hover {
  background: #f9f9f9;
}
.company-button {
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f3f3f3;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: block;
}
.company-button:hover {
  background: #e8e8e8;
}
</style>
