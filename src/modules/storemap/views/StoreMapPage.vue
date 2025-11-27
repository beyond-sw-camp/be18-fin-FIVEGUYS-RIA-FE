<template>
  <div class="map-container" ref="containerRef">

    <!-- 전체 도면 zoom + pan -->
    <div
      class="zoom-wrapper"
      :style="{
        transform: `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`,
        transformOrigin: 'top left'
      }"
      ref="zoomWrapperRef"
    >

      <!-- 이미지 + 텍스트 오버레이 -->
      <div class="image-wrapper">
        <img
          :src="reloadSrc"
          usemap="#store-map"
          class="map-image"
          @load="handleImageLoad"
        />

        <div class="label-overlay">
          <div
            v-for="area in renderedAreas"
            :key="area.id"
            :id="`label-${area.id}`"
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

      <!-- 이미지맵 클릭 영역 -->
      <map name="store-map">
        <area
          v-for="area in renderedAreas"
          :key="area.id"
          :shape="area.shape"
          :coords="area.scaledCoords"
          @click="openModal(area)"
        />
      </map>
    </div>

    <!-- 모달 -->
    <BrandDetailModal v-model="dialog" :brand="selectedBrand" />
  </div>
</template>


<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import BrandDetailModal from "@/modules/storemap/views/BrandDetailModal.vue";

/* =======================
    이미지 & JSON
======================== */
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

/* =======================
  이미지 reload
======================== */
const reloadSrc = ref("");
watch(
  () => currentFloor.value.img,
  img => (reloadSrc.value = `${img}?v=${Date.now()}`),
  { immediate: true }
);

/* =======================
  층 변경 시 이전 텍스트 박스 제거
======================== */
watch(currentLevel, () => {
  renderedAreas.value = [];    
});


/* =======================
  좌표 스케일링
======================== */
const renderedAreas = ref([]);

/**
 * poly / rect 모두 지원하는 bounding box 계산
 * 원본 coords + scaleX/scaleY → 스케일된 left/right/top/bottom
 */
function getAreaBox(originalCoords, scaleX, scaleY) {
  const nums = originalCoords.split(",").map(Number);
  let xs = [];
  let ys = [];

  for (let i = 0; i < nums.length; i += 2) {
    xs.push(nums[i] * scaleX);
    ys.push(nums[i + 1] * scaleY);
  }

  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top
  };
}

function scaleCoords(original, scaleX, scaleY) {
  return original
    .split(",")
    .map(Number)
    .map((c, i) => (i % 2 === 0 ? c * scaleX : c * scaleY))
    .join(",");
}

async function handleImageLoad(event) {
  const img = event.target;

  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  const clientW = img.clientWidth;
  const clientH = img.clientHeight;

  const scaleX = clientW / naturalW;
  const scaleY = clientH / naturalH;

  renderedAreas.value = currentFloor.value.areas.map(a => {
    const box = getAreaBox(a.coords, scaleX, scaleY);
    return {
      ...a,
      scaledCoords: scaleCoords(a.coords, scaleX, scaleY),
      textX: a.x * scaleX,
      textY: a.y * scaleY,
      maxWidth: box.width * 0.9  //  영역 가로폭의 90%를 텍스트 박스 폭으로 사용
    };
  });
}

/* =======================
    모달
======================== */
const dialog = ref(false);
const selectedBrand = ref(null);
function openModal(area) {
  selectedBrand.value = area;
  dialog.value = true;
}

/* =======================
    zoom + pan
======================== */
const zoomLevel = ref(1);
const translateX = ref(0);
const translateY = ref(0);

const containerRef = ref(null);
const zoomWrapperRef = ref(null);

let isPanning = false;
let startX = 0;
let startY = 0;

onMounted(() => {
  // Ctrl + wheel zoom
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

  // Pan (drag)
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

.zoom-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  cursor: grab;
}
.zoom-wrapper:active {
  cursor: grabbing;
}

.image-wrapper {
  position: relative;
}

.map-image {
  max-width: 100%;
  height: auto;
  display: block;
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
  background: none;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  color: #000;  
  pointer-events: none;
  white-space: normal;        /* 여러 줄 허용 */
  word-break: keep-all;       /* 한글 자연스럽게 줄바꿈 */
  overflow-wrap: break-word;  /* 긴 단어 강제 줄바꿈 */
  line-height: 1.2;
  text-align: center;
}



</style>
