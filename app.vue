<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
/**
 * Global print styles
 *
 * @page sets physical page margins and paper size for all print targets.
 * Template-level styles (margin: 0, max-width: none) work within this area.
 * 2cm page margin on all sides; templates reset their own CSS margin to 0.
 */
@page {
  size: A4;
  margin: 2cm;
}
</style>
