<template>
  <UContainer class="app-header border-b border-gray-200 dark:border-gray-800">
    <div class="flex items-center justify-between">
      <!-- Left action slot -->
      <div class="flex items-center gap-2">
        <slot name="left-actions" />
      </div>

      <!-- App Title -->
      <div class="text-center">
        <h1 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
          OhMyDoc
        </h1>
      </div>

      <!-- Right action slot -->
      <div class="flex items-center gap-3">
        <slot name="right-actions" />
      </div>
    </div>
  </UContainer>
</template>

<style scoped>
.app-header {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
