<script setup lang="ts">
const store = useToolStore()
defineProps<{
  tool: Tool
}>()
</script>

<template>
  <div class="card card-compact bg-base-200 shadow-xl cursor-pointer">
    <div class="card-body">
      <div class="flex">
        <div class="avatar">
          <div class="w-20 mask mask-squircle">
            <img :src="tool.image" />
          </div>
        </div>
        <div class="flex-grow ml-4">
          <h2 class="card-title flex-grow">{{ tool.title }}</h2>
          <div v-html="tool.description"></div>
        </div>
      </div>
      <div class="card-actions mt-2">
        <div v-for="family in tool.families" class="badge badge-outline">{{ family.title }}</div>
        <div v-for="tag in tool.tags" class="badge badge-outline">{{ tag.title }}</div>
      </div>
    </div>
  </div>
</template>