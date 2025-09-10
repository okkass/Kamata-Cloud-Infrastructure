<template>
  <div class="kci-table-wrapper">
    <table class="kci-table">
      <thead>
        <tr>
          <th v-for="(col, i) in columns" :key="i">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIndex) in rows" :key="rIndex">
          <td v-for="(col, cIndex) in columns" :key="cIndex">
            <slot :name="`cell:${col.key}`" :row="row" :value="resolve(row, col)" :rowIndex="rIndex" :col="col">
              {{ resolve(row, col) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface Column { key: string; label: string; accessor?: (row:any)=>unknown }
const props = defineProps<{ columns: Column[]; rows: any[] }>()

function resolve(row:any, col:Column){
  return col.accessor ? col.accessor(row) : (row?.[col.key] ?? '')
}
</script>

<style scoped>
.kci-table-wrapper{ overflow:auto; border:1px solid var(--kci-border); border-radius:12px; }
.kci-table{ width:100%; border-collapse:collapse; background:var(--kci-surface); }
.kci-table thead th{ text-align:left; font-weight:700; color:var(--kci-muted); padding:.7rem .9rem; border-bottom:1px solid var(--kci-border); background:rgba(255,255,255,.02); }
.kci-table tbody td{ padding:.7rem .9rem; border-bottom:1px dashed var(--kci-border); }
.kci-table tbody tr:last-child td{ border-bottom:none; }
</style>
