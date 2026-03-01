<template>
  <article class="application-document">
    <!-- Applicant Header -->
    <header class="application-header">
      <h1 class="applicant-name">{{ data.applicant.name }}</h1>

      <div v-if="data.applicant.address || data.applicant.contactInformation" class="header-meta">
        <address v-if="data.applicant.address" class="applicant-address">
          {{ data.applicant.address.street }},
          {{ data.applicant.address.city }}, {{ data.applicant.address.state }} {{ data.applicant.address.zipCode }}
        </address>

        <div v-if="data.applicant.contactInformation" class="contact-information">
          <span v-if="data.applicant.contactInformation.phone" class="phone">
            {{ data.applicant.contactInformation.phone }}
          </span>
          <span
            v-if="data.applicant.contactInformation.phone && data.applicant.contactInformation.email"
            class="separator"
          >&nbsp;&middot;&nbsp;</span>
          <a
            v-if="data.applicant.contactInformation.email"
            :href="`mailto:${data.applicant.contactInformation.email}`"
            class="email"
          >
            {{ data.applicant.contactInformation.email }}
          </a>
        </div>
      </div>
    </header>

    <hr class="rule">

    <!-- Date + Recipient -->
    <div class="pre-letter">
      <div v-if="data.date" class="document-date">{{ data.date }}</div>

      <div v-if="data.recipient" class="recipient">
        <p v-if="data.recipient.position" class="recipient-position">{{ data.recipient.position }}</p>
        <p v-if="data.recipient.company" class="recipient-company">{{ data.recipient.company }}</p>
        <address v-if="data.recipient.address" class="recipient-address">
          {{ data.recipient.address.street }}<br>
          {{ data.recipient.address.city }}, {{ data.recipient.address.state }} {{ data.recipient.address.zipCode }}
        </address>
      </div>
    </div>

    <hr class="rule">

    <!-- Letter Body -->
    <main v-if="data.letter" class="letter">
      <p v-if="data.letter.salutation" class="salutation">{{ data.letter.salutation }}</p>
      <p v-if="data.letter.introduction" class="introduction">{{ data.letter.introduction }}</p>

      <div
        v-if="data.letter.experienceSection && data.letter.experienceSection.length > 0"
        class="experience-section"
      >
        <div
          v-for="(experience, expIndex) in data.letter.experienceSection"
          :key="expIndex"
          class="experience"
        >
          <p v-if="experience.employer" class="experience-employer">
            <strong>{{ experience.employer }}</strong>
          </p>
          <ul v-if="experience.achievements && experience.achievements.length > 0" class="achievements">
            <li
              v-for="(achievement, achIndex) in experience.achievements"
              :key="achIndex"
              class="achievement"
            >
              {{ achievement.text }}
            </li>
          </ul>
        </div>
      </div>

      <p v-if="data.letter.motivation" class="motivation">{{ data.letter.motivation }}</p>
      <p v-if="data.letter.closing" class="closing">{{ data.letter.closing }}</p>
      <p v-if="data.letter.signature" class="signature">{{ data.letter.signature }}</p>
    </main>
  </article>
</template>

<script setup lang="ts">
import type { ParsedData } from '~/composables/useXmlParser'
import './styles.css'

interface Props {
  data: ParsedData
}

defineProps<Props>()
</script>

<style scoped>
</style>
