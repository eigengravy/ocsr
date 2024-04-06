<script setup lang="ts">
import Institutes from './components/Institutes.vue'
</script>

<template>
  <h1>Open CS Rankings</h1>
  <Suspense>
    <template #default>
      <Institutes />
    </template>

    <template #fallback>
      <p>Loading...</p>
    </template>
  </Suspense>
</template>
