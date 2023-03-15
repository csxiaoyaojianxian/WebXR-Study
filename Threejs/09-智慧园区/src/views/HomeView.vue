<template>
  <div class="home">
    <Scene :eventList="eventList"></Scene>
    <BigScreen></BigScreen>
  </div>
</template>

<script setup>
import Scene from "@/components/Scene.vue";
import BigScreen from "@/components/BigScreen.vue";
import { onMounted, watch, ref } from "vue";

// 设置事件列表
const eventList = ref([]);

watch(eventList, () => {
  console.log("触发事件列表更新");
});
onMounted(() => {});
</script>
