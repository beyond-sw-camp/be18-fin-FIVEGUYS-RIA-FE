<template>
  <v-container fluid class="pa-0 full-height">
    <v-row no-gutters class="full-height">

      <!-- ==================== 좌측: 고객사 정보 ==================== -->
      <v-col cols="12" md="4" class="pa-4">
        <v-card outlined class="pa-4 full-height-card">
          <v-card-title class="text-h6 mb-3">{{ clientCompany.name }}</v-card-title>
          <v-divider class="mb-3" />
          <div class="scroll-area">
            <v-list dense>
              <v-list-item v-for="(value, key) in clientCompany" :key="key" v-if="key !== 'id' && key !== 'name'">
                <v-list-item-content>
                  <div class="label">{{ formatClientLabel(key) }}</div>
                  <div class="info-text">{{ value }}</div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-col>

      <!-- ==================== 중앙 컬럼 ==================== -->
      <v-col cols="12" md="4" class="pa-4 d-flex flex-column">
        <v-card outlined class="pa-4 full-height-card" style="display: flex; flex-direction: column;">
          
          <!-- 상단: 고객 검색 + 목록 -->
          <div class="scroll-area flex-1">
            <v-text-field
              v-model="customerSearch"
              append-inner-icon="mdi-magnify"
              placeholder="고객 검색"
              dense
              outlined
              hide-details
              class="mb-4"
            ></v-text-field>

            <v-row dense>
              <v-col
                v-for="customer in filteredCustomers"
                :key="customer.id"
                cols="12"
                class="mb-2"
              >
                <v-card
                  outlined
                  class="pa-3 customer-item-card"
                  :class="{ 'selected-card': selectedCustomer && selectedCustomer.id === customer.id }"
                  @click="selectCustomer(customer)"
                >
                  <v-row align="center" justify="space-between">
                    <v-col class="pa-0">
                      <div class="label text-caption mb-1">이름</div>
                      <div class="font-weight-medium">{{ customer.name }}</div>
                    </v-col>
                    <v-col cols="auto" class="pa-0">
                      <v-icon
                        :color="customer.favorite ? 'yellow darken-3' : 'grey'"
                        @click.stop="toggleFavorite(customer)"
                        class="cursor-pointer"
                      >
                        {{ customer.favorite ? 'mdi-star' : 'mdi-star-outline' }}
                      </v-icon>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- 하단: 선택된 고객 상세 정보 -->
          <v-card v-if="selectedCustomer" outlined class="pa-4 mt-4 full-height-card">
            <v-card-title class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="label text-caption">이름</div>
                <div class="text-h6">{{ selectedCustomer.name }} ({{ selectedCustomer.age }})</div>
              </div>
              <v-icon
                :color="selectedCustomer.favorite ? 'yellow darken-3' : 'grey'"
                @click.stop="toggleFavorite(selectedCustomer)"
                class="cursor-pointer"
              >
                {{ selectedCustomer.favorite ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </v-card-title>
            <v-divider class="mb-2" />

            <div class="scroll-area">
              <v-list dense>
                <v-list-item v-for="(value, key) in selectedCustomer" :key="key" v-if(!['id','name','age','favorite'].includes(key))>
                  <v-list-item-content>
                    <div class="label">{{ formatCustomerLabel(key) }}</div>
                    <div class="info-text">{{ value }}</div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-card>

        </v-card>
      </v-col>

      <!-- ==================== 우측 컬럼 ==================== -->
      <v-col cols="12" md="4" class="pa-4">
        <v-card outlined class="pa-4 full-height-card">
          <v-card-title class="text-h6 mb-2">우측 컬럼</v-card-title>
          <v-divider class="mb-2" />
          <div class="scroll-area">
            <p>여기에 다른 컨텐츠나 차트 등을 넣을 수 있습니다.</p>
          </div>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const clientCompany = reactive({
  id: 1,
  name: '디올',
  website: 'www.dior.com',
  businessNumber: '123-45-67890',
  fax: '02-123-4567',
  phone: '02-987-6543',
  zipCode: '12345',
  address: '서울시 강남구 ...',
  tenantName: '디올 매장',
  area: '120㎡',
  openingDate: '2022-01-15',
  contractPeriod: '3년',
  totalRent: '5,000,000원',
  commissionRate: '10%',
  avgSales: '7,000,000원'
});

const customers = ref([
  { id: 1, name: '김민수', age: 17, clientCompany: '디올', owner: '김민수', department: '영업', position: '팀장', email: 'kim@example.com', phone: '010-1234-5678', favorite: true },
  { id: 2, name: '박영희', age: 28, clientCompany: '디올', owner: '박영희', department: '마케팅', position: '사원', email: 'park@example.com', phone: '010-9876-5432', favorite: false },
  { id: 3, name: '이영희', age: 35, clientCompany: '디올', owner: '이영희', department: '기획', position: '팀장', email: 'lee@example.com', phone: '010-1111-2222', favorite: false }
]);

const customerSearch = ref('');
const selectedCustomer = ref(null);

const filteredCustomers = computed(() => {
  if (!customerSearch.value) return customers.value;
  return customers.value.filter(c => c.name.includes(customerSearch.value));
});

const selectCustomer = (customer) => {
  selectedCustomer.value = customer;
};

const toggleFavorite = (customer) => {
  customer.favorite = !customer.favorite;
};

const formatClientLabel = (key) => {
  const map = {
    website: '웹 사이트',
    businessNumber: '사업자 번호',
    fax: '팩스 번호',
    phone: '유선 번호',
    zipCode: '우편 번호',
    address: '주소',
    tenantName: '입주명',
    area: '면적',
    openingDate: '입점일',
    contractPeriod: '계약 기간',
    totalRent: '총 임대료',
    commissionRate: '매출 수수료율',
    avgSales: '평균 매출'
  };
  return map[key] || key;
};

const formatCustomerLabel = (key) => {
  const map = {
    clientCompany: '고객사명',
    owner: '담당자',
    department: '부서',
    position: '직책',
    email: '이메일',
    phone: '전화번호'
  };
  return map[key] || key;
};
</script>

<style scoped>
.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scroll-area {
  overflow-y: auto;
  max-height: calc(100% - 40px);
}

.label {
  font-size: 0.7rem;
  color: #888;
  margin-bottom: 2px;
}

.info-text {
  font-size: 0.9rem;
  color: #111;
}

.customer-item-card {
  transition: box-shadow 0.2s, transform 0.2s;
}

.customer-item-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}

.selected-card {
  border-color: #ff9800;
  box-shadow: 0 4px 12px rgba(255,152,0,0.3);
}
</style>
