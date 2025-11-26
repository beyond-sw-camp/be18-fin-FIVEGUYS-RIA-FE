<template>
  <div class="map-container">

    <!-- 이미지와 오버레이는 같은 wrapper 안에서 동작 -->
    <div class="image-wrapper">
      <img
        :src="reloadSrc"
        usemap="#store-map"
        class="map-image"
        @load="handleImageLoad"
      />

      <!-- 텍스트 오버레이 레이어 -->
      <div class="label-overlay">
        <div
          v-for="area in renderedAreas"
          :key="area.id"
          class="label-item"
          :style="{
            left: area.textX + 'px',
            top: area.textY + 'px'
          }"
        >
          {{ area.name }}
        </div>
      </div>
    </div>

    <!-- 기존 이미지맵 클릭 영역 -->
    <map name="store-map">
      <area
        v-for="area in renderedAreas"
        :key="area.id"
        :shape="area.shape"
        :coords="area.scaledCoords"
        @click="openModal(area)"
      />
    </map>

    <!-- 브랜드 상세 모달 -->
    <BrandDetailModal
      v-model="dialog"
      :brand="selectedBrand"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import BrandDetailModal from "@/modules/storemap/views/BrandDetailModal.vue"; 
// ← 경로는 너 프로젝트 구조에 맞게 조정

const route = useRoute();

/* ======================
   이미지 & 맵 데이터
=======================*/
import floorB1Img from "@/assets/images/floorB1.png";
import floorB1Map from "@/assets/floormaps/floorB1map.json";

import floor1FImg from "@/assets/images/floorF1.png";
import floor1FMap from "@/assets/floormaps/floorF1map.json";

import floor2FImg from "@/assets/images/floorF2.png";
import floor2FMap from "@/assets/floormaps/floorF2map.json";

import floor3FImg from "@/assets/images/floorF3.png";
import floor3FMap from "@/assets/floormaps/floorF3map.json";

import floor4FImg from "@/assets/images/floorF4.png";
import floor4FMap from "@/assets/floormaps/floorF4map.json";

const floorConfig = {
  B1: { label: "B1 HIGH JEWELRY & WATCH", img: floorB1Img, areas: floorB1Map },
  "1F": { label: "1F LUXURY BOUTIQUE & COSMETICS", img: floor1FImg, areas: floor1FMap },
  "2F": { label: "2F WOMEN'S COLLECTION", img: floor2FImg, areas: floor2FMap },
  "3F": { label: "3F WOMEN'S COLLECTION", img: floor3FImg, areas: floor3FMap },
  "4F": { label: "4F MEN'S LUXURY BOUTIQUE", img: floor4FImg, areas: floor4FMap },
};

/* ======================
      층 정보
=======================*/
const currentLevel = computed(() => {
  const lvl = route.params.level || "B1";
  return floorConfig[lvl] ? lvl : "B1";
});

const currentFloor = computed(() => floorConfig[currentLevel.value]);

/* ================================
   이미지 재로드 (라우팅 이동 시)
================================*/
const reloadSrc = ref("");
watch(
  () => currentFloor.value.img,
  (img) => (reloadSrc.value = `${img}?v=${Date.now()}`),
  { immediate: true }
);

/* ======================
  좌표 스케일 계산
=======================*/
const renderedAreas = ref([]);

function scaleCoords(original, scaleX, scaleY) {
  const coords = original.split(",").map(Number);
  const scaled = coords.map((c, i) => (i % 2 === 0 ? c * scaleX : c * scaleY));
  return scaled.join(",");
}

async function handleImageLoad(event) {
  const img = event.target;

  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  const clientW = img.clientWidth;
  const clientH = img.clientHeight;

  const scaleX = clientW / naturalW;
  const scaleY = clientH / naturalH;

  renderedAreas.value = currentFloor.value.areas.map((a) => {
    return {
      ...a,
      originalCoords: a.coords,
      scaledCoords: scaleCoords(a.coords, scaleX, scaleY),

      //x,y 좌표를 스케일링해서 텍스트 위치 계산
      textX: a.x * scaleX,
      textY: a.y * scaleY,
    };
  });
}

watch(currentLevel, async () => {
  await nextTick();
  reloadSrc.value = `${currentFloor.value.img}?v=${Date.now()}`;
});

/* ======================
  모달
=======================*/
const dialog = ref(false);
const selectedBrand = ref(null);

function openModal(area) {
  selectedBrand.value = area; // 테스트용
  dialog.value = true;
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: calc(100vh - 80px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-wrapper {
  position: relative;
}

.map-image {
  max-width: 100%;
  height: auto;
}

.label-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.label-item {
  position: absolute;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.75);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
}

area {
  cursor: pointer;
}
</style>
