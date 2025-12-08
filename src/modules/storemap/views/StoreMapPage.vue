<template>
  <div class="map-container" ref="containerRef">
    
    <div
      class="zoom-wrapper"
      ref="zoomWrapperRef"
    >
      <!-- floor image -->
      <div class="image-wrapper">
        <img
          ref="imageRef"
          :src="reloadSrc"
          usemap="#store-map"
          class="map-image"
          @load="handleImageLoad"
        />

        <!-- 텍스트 오버레이 -->
        <div class="label-overlay">
          <div
            v-for="area in renderedAreas"
            :key="area.id"
            class="label-item"
            :style="{
              left: area.textXPct + '%',
              top: area.textYPct + '%',
              maxWidth: area.maxWidth + 'px'
            }"
          >
            {{ area.displayName }}
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
import { fetchStoreNames } from "@/apis/storemap";

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

/* 층 설정 */
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

/* 이미지 reload */
const reloadSrc = ref("");
watch(
  () => currentFloor.value.img,
  img => {
    reloadSrc.value = img;
  },
  { immediate: true }
);

/* store names */
const storeNamesMap = ref(new Map());

async function loadStoreNames() {
  const res = await fetchStoreNames();
  const map = new Map();
  res.data.forEach(s => map.set(s.storeId, s.storeDisplayName));
  storeNamesMap.value = map;
}

onMounted(loadStoreNames);

/* 좌표 처리 */
const imageRef = ref(null);
const renderedAreas = ref([]);

watch(storeNamesMap, () => {
  if (imageRef.value) handleImageLoad({ target: imageRef.value });
});

function handleImageLoad(e) {
  const img = e.target;
  const scaleX = img.clientWidth / img.naturalWidth;
  const scaleY = img.clientHeight / img.naturalHeight;

  renderedAreas.value = currentFloor.value.areas.map(a => {
    const coordsNums = a.coords.split(",").map(Number);

    return {
      ...a,
      // 이미지맵 영역은 여전히 스케일된 px 좌표 사용
      scaledCoords: coordsNums
        .map((c, i) => (i % 2 === 0 ? c * scaleX : c * scaleY))
        .join(","),

      
      textXPct: (a.x / img.naturalWidth) * 100,
      textYPct: (a.y / img.naturalHeight) * 100,

      // 박스 폭은 그대로 px로 (브라우저 줌이 함께 키워줌)
      maxWidth: 120,

      displayName: storeNamesMap.value.get(a.storeId) || "공실"
    };
  });

  centerMapOnLoad();
}

/* modal */
const dialog = ref(false);
const selectedStoreId = ref(null);

function openModal(area) {
  selectedStoreId.value = area.storeId;
  dialog.value = true;
}

/* zoom only (커스텀 줌 제거: 브라우저 줌만 사용) */
const containerRef = ref(null);
const zoomWrapperRef = ref(null);

function centerMapOnLoad() {
  const container = containerRef.value;
  const img = imageRef.value;

  if (!container || !img) return;

  // 보정값 (px 단위)
  const OFFSET_X = 120; // ← 이 값만 조정하면 됨
  const OFFSET_Y = 0;   // 필요하면 나중에 사용

  if (img.scrollWidth > container.clientWidth) {
    container.scrollLeft =
      (img.scrollWidth - container.clientWidth) / 2 + OFFSET_X;
  }

  if (img.scrollHeight > container.clientHeight) {
    container.scrollTop =
      (img.scrollHeight - container.clientHeight) / 2 + OFFSET_Y;
  }
}

</script>

<style scoped>
.map-container {
  width: 100%;
  height: calc(100vh - 80px);
  overflow: auto;
  position: relative;
}

.zoom-wrapper {
  position: relative;
  display: inline-block;
  cursor: default;
}

.image-wrapper {
  position: relative;
}

.map-image {
  display: block;
}

.label-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.label-item {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}
</style>
