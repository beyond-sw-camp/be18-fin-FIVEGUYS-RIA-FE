<template>
  <div class="map-container" ref="containerRef">

    <!-- zoom + pan wrapper -->
    <div
      class="zoom-wrapper"
      :style="{
        transform: `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`,
        transformOrigin: 'top left'
      }"
      ref="zoomWrapperRef"
    >

      <!-- floor image -->
      <div class="image-wrapper">
        <img
          class="map-image"
          :src="reloadSrc"
          usemap="#store-map"
          @load="handleImageLoad"
        />

        <!-- 텍스트 오버레이 -->
        <div class="label-overlay">
          <div
            v-for="area in renderedAreas"
            :key="area.id"
            class="label-item"
            :style="{
              left: area.textX + 'px',
              top: area.textY + 'px',
              maxWidth: area.maxWidth + 'px'
            }"
          >
            {{ area.name }}
          </div>
        </div>
      </div>

      <!-- 이미지맵 -->
      <map name="store-map">
        <area
          v-for="area in renderedAreas"
          :key="area.id"
          :shape="area.shape"
          :coords="area.scaledCoords"
          @click="openModal(area)"
          style="cursor: pointer"
        />
      </map>
    </div>

    <BrandDetailModal
      v-model="dialog"
      :store-id="selectedStoreId"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import BrandDetailModal from "@/modules/storemap/views/BrandDetailModal.vue";
import { fetchStoreNames } from "@/apis/storemap";   // ★ 추가된 부분

/* 이미지/좌표 파일 */
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
  B1: { img: floorB1Img, areas: floorB1Map },
  "1F": { img: floor1FImg, areas: floor1FMap },
  "2F": { img: floor2FImg, areas: floor2FMap },
  "3F": { img: floor3FImg, areas: floor3FMap },
  "4F": { img: floor4FImg, areas: floor4FMap }
};

const route = useRoute();
const currentLevel = computed(() => route.params.level || "B1");
const currentFloor = computed(() => floorConfig[currentLevel.value]);

/* ---- DB 매장명 불러오기 ---- */
const storeNames = ref({}); // { 1: "나이키 A-102점" }

async function loadStoreNames() {
  try {
    const res = await fetchStoreNames();
    storeNames.value = Object.fromEntries(
      res.data.map(s => [s.storeId, s.storeDisplayName])
    );
  } catch (e) {
    console.error("매장명 불러오기 실패:", e);
  }
}

onMounted(() => {
  loadStoreNames(); // ★ 페이지 로드시 DB 매장명 먼저 로드
});

/* 이미지 reload */
const reloadSrc = ref("");
watch(
  () => currentFloor.value.img,
  img => (reloadSrc.value = `${img}?v=${Date.now()}`),
  { immediate: true }
);

/* 좌표 스케일링 */
const renderedAreas = ref([]);

watch(currentLevel, () => {
  renderedAreas.value = [];
});

/* poly / rect 공통 bounding */
function getAreaBox(originalCoords, scaleX, scaleY) {
  const nums = originalCoords.split(",").map(Number);
  const xs = [];
  const ys = [];

  for (let i = 0; i < nums.length; i += 2) {
    xs.push(nums[i] * scaleX);
    ys.push(nums[i + 1] * scaleY);
  }

  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function scaleCoords(original, scaleX, scaleY) {
  return original
    .split(",")
    .map(Number)
    .map((c, i) => (i % 2 === 0 ? c * scaleX : c * scaleY))
    .join(",");
}

/* ---- 핵심: handleImageLoad는 storeNames 로딩 후에만 실행 ---- */
function handleImageLoad(event) {
  const img = event.target;

  if (!storeNames.value || Object.keys(storeNames.value).length === 0) {
    console.warn("❗ storeNames not loaded yet → 렌더링 보류");
    return;
  }

  const scaleX = img.clientWidth / img.naturalWidth;
  const scaleY = img.clientHeight / img.naturalHeight;

  renderedAreas.value = currentFloor.value.areas.map(a => {
    const box = getAreaBox(a.coords, scaleX, scaleY);
    const sid = a.storeId ?? Number(a.id);

    return {
      ...a,
      storeId: sid,
      name: storeNames.value[sid] ?? a.name, // ★ JSON 이름 → DB 이름으로 변경
      scaledCoords: scaleCoords(a.coords, scaleX, scaleY),
      textX: a.x * scaleX,
      textY: a.y * scaleY,
      maxWidth: box.width * 0.9,
    };
  });
}

/* DB 매장명이 로딩된 후 자동으로 재렌더링 */
watch(storeNames, () => {
  const img = document.querySelector(".map-image");
  if (img && img.complete) {
    handleImageLoad({ target: img });
  }
});

/* 모달 */
const dialog = ref(false);
const selectedStoreId = ref(null);

function openModal(area) {
  selectedStoreId.value = area.storeId;
  dialog.value = true;
}

/* zoom + pan */
const zoomLevel = ref(1);
const translateX = ref(0);
const translateY = ref(0);

const containerRef = ref(null);
const zoomWrapperRef = ref(null);

let isPanning = false;
let startX = 0;
let startY = 0;

onMounted(() => {
  containerRef.value.addEventListener(
    "wheel",
    e => {
      if (e.ctrlKey) {
        e.preventDefault();
        zoomLevel.value += e.deltaY < 0 ? 0.1 : -0.1;
        zoomLevel.value = Math.min(Math.max(zoomLevel.value, 0.5), 3);
      }
    },
    { passive: false }
  );

  zoomWrapperRef.value.addEventListener("mousedown", e => {
    isPanning = true;
    startX = e.clientX - translateX.value;
    startY = e.clientY - translateY.value;
  });

  window.addEventListener("mousemove", e => {
    if (!isPanning) return;
    translateX.value = e.clientX - startX;
    translateY.value = e.clientY - startY;
  });

  window.addEventListener("mouseup", () => {
    isPanning = false;
  });

  zoomWrapperRef.value.addEventListener("dblclick", () => {
    zoomLevel.value = Math.min(zoomLevel.value + 0.2, 3);
  });
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: calc(100vh - 80px);
  overflow: hidden;
  position: relative;
}
.zoom-wrapper { position: absolute; left: 0; top: 0; cursor: grab; }
.zoom-wrapper:active { cursor: grabbing; }
.image-wrapper { position: relative; }
.map-image { max-width: 100%; display: block; }
.label-overlay { position: absolute; top: 0; left: 0; width:100%; height:100%; pointer-events:none; }
.label-item {
  position: absolute;
  transform: translate(-50%, -50%);
  background: none;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: break-word;
  line-height: 1.2;
  text-align: center;
}
</style>
