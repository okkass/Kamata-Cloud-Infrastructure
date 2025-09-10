<template>
  <section class="kci-detail">
    <header class="kci-detail__header">
      <nav class="kci-breadcrumb" aria-label="Breadcrumb" v-if="breadcrumb?.length">
        <ol>
          <li v-for="(bc, i) in breadcrumb" :key="i">
            <NuxtLink v-if="bc.to" :to="bc.to">{{ bc.label }}</NuxtLink>
            <span v-else>{{ bc.label }}</span>
          </li>
        </ol>
      </nav>
      <div class="kci-detail__titlebar">
        <div class="kci-detail__titles">
          <slot name="title">
            <h1 class="kci-title">{{ title }}</h1>
          </slot>
          <p v-if="subtitle || $slots.subtitle" class="kci-subtitle">
            <slot name="subtitle">{{ subtitle }}</slot>
          </p>
        </div>
        <div class="kci-detail__actions">
          <slot name="actions">
            <KciActions :actions="actions" @click="(id) => emit('action', id)" />
          </slot>
        </div>
      </div>
      <div v-if="$slots.metrics || summary?.length" class="kci-detail__metrics">
        <slot name="metrics">
          <KciKeyValueGrid :items="summary || []" />
        </slot>
      </div>
      <KciTabs v-if="tabs?.length" :tabs="tabs" v-model="currentTab" />
    </header>

    <main class="kci-detail__body">
      <section v-if="fields?.length" class="kci-section">
        <header class="kci-section__header">
          <h2>{{ schemaTitle }}</h2>
        </header>
        <KciKeyValueGrid :items="mappedFields" />
      </section>

      <slot />

      <section v-if="$slots.audit || audit?.length" class="kci-section">
        <header class="kci-section__header">
          <h2>監査ログ</h2>
        </header>
        <slot name="audit">
          <KciAuditList :items="audit || []" />
        </slot>
      </section>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import KciKeyValueGrid from './KciKeyValueGrid.vue'
import KciActions from './KciActions.vue'
import KciTabs, { type KciTab } from './KciTabs.vue'
import KciAuditList from './KciAuditList.vue'

export type SummaryItem = { label: string; value: string | number | boolean | null | undefined }
export type ActionItem = { id: string; label: string; kind?: 'primary'|'secondary'|'danger'|'ghost'; disabled?: boolean }
export type BreadcrumbItem = { label: string; to?: string }
export type FieldSchema = { key: string; label: string; formatter?: (v: any) => string }
export interface AuditItem { timestamp: string; user?: string; action: string; details?: string }

const props = defineProps<{
  title?: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
  actions?: ActionItem[]
  summary?: SummaryItem[]
  tabs?: KciTab[]
  schemaTitle?: string
  model?: Record<string, any>
  fields?: FieldSchema[]
  audit?: AuditItem[]
  defaultTab?: string
}>()

const emit = defineEmits<{ (e: 'action', id: string): void; (e:'update:tab', value:string): void }>()

const currentTab = ref(props.defaultTab || props.tabs?.[0]?.value || '')
watch(currentTab, (v) => emit('update:tab', v))

const mappedFields = computed<SummaryItem[]>(() => {
  if (!props.fields || !props.model) return []
  return props.fields.map(f => ({
    label: f.label,
    value: f.formatter ? f.formatter(props.model?.[f.key]) : String(props.model?.[f.key] ?? '')
  }))
})
</script>

<style scoped>
.kci-detail { --kci-bg:#0b1220; --kci-surface:#0f1730; --kci-border:#1f2b4a; --kci-text:#e6eaf5; --kci-muted:#a7b0c3; --kci-accent:#214e9f; --kci-success:#2fbf71; --kci-warning:#e5a100; --kci-danger:#e04444; background:var(--kci-bg); color:var(--kci-text); min-height:100%; }
.kci-detail__header { position:sticky; top:0; background:linear-gradient(to bottom, rgba(11,18,32,.9), rgba(11,18,32,.6)); backdrop-filter: blur(6px); border-bottom:1px solid var(--kci-border); z-index:5; }
.kci-breadcrumb ol{ display:flex; gap:.5rem; list-style:none; padding:1rem 1.25rem .5rem; margin:0; }
.kci-breadcrumb a{ color:var(--kci-muted); text-decoration:none; }
.kci-breadcrumb li:not(:last-child)::after{ content:'›'; margin-left:.5rem; color:var(--kci-muted); }
.kci-detail__titlebar{ display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; padding: .25rem 1.25rem 1rem; }
.kci-title{ font-size:1.4rem; font-weight:700; margin:0; }
.kci-subtitle{ margin:.25rem 0 0; color:var(--kci-muted); }
.kci-detail__actions{ display:flex; gap:.5rem; align-items:center; }
.kci-detail__metrics{ padding: 0 1.25rem 1rem; }
.kci-detail__body{ padding:1.25rem; display:grid; gap:1rem; max-width:1200px; margin:0 auto; }
.kci-section{ background:var(--kci-surface); border:1px solid var(--kci-border); border-radius:12px; overflow:hidden; }
.kci-section__header{ padding:.9rem 1rem; border-bottom:1px solid var(--kci-border); background:rgba(255,255,255,.02); }
.kci-section__header h2{ margin:0; font-size:1rem; font-weight:700; }

@media (max-width: 720px){ .kci-detail__titlebar{ flex-direction:column; align-items:flex-start; } }
</style>
