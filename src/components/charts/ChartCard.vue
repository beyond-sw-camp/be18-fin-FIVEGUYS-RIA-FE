<template>
  <v-card class="chart-card" elevation="2">
    <v-card-title class="text-subtitle-1 font-weight-bold">
      {{ title }}
    </v-card-title>
    <v-card-subtitle v-if="subtitle" class="text-caption">
      {{ subtitle }}
    </v-card-subtitle>

    <v-card-text class="pt-0">
      <component
        :is="chartComponent"
        :data="data"
        :options="options"
        class="chart"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { Bar, Line, Doughnut } from "vue-chartjs";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  TimeScale
);

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  type: {
    type: String,
    default: "bar", // bar | line | doughnut
  },
  data: { type: Object, required: true },
  options: {
    type: Object,
    default: () => ({ responsive: true, maintainAspectRatio: false }),
  },
});

const chartComponent = computed(() => {
  if (props.type === "line") return Line;
  if (props.type === "doughnut") return Doughnut;
  return Bar;
});
</script>

<style scoped>
.chart-card {
  height: 100%;
}
.chart {
  height: 260px;
}
</style>
