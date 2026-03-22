<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Brand -->
      <div class="brand">
        <span class="brand-name">OhMyDoc</span>
        <div class="brand-copy">
          <span class="brand-tagline">The Free Resume Formatter. Actually Free.</span>
          <span class="brand-subheadline">Paste your plain text. Get a clean, ATS-friendly PDF instantly. No login, no paywalls, no BS. Just format and download.</span>
        </div>
      </div>

      <!-- Right action slot -->
      <div class="header-right">
        <slot name="right-actions" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  padding: 0.625rem 1.5rem;
  flex-shrink: 0;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.brand-name {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  overflow: hidden;
}

.brand-tagline {
  font-size: 0.75rem;
  font-weight: 500;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-subheadline {
  font-size: 0.65rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}
</style>
