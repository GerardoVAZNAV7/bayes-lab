<script setup>
import { computed } from 'vue'
import { formulas } from '../data/formulas.js'
import { ui } from '../store.js'

const shown = computed(() => (ui.onlyRelevant ? formulas.filter((x) => ui.highlight.includes(x.id)) : formulas))
const groups = computed(() => [...new Set(shown.value.map((x) => x.group))])
const flipAll = (v) => formulas.forEach((x) => (ui.flipped[x.id] = v))
</script>

<template>
  <aside class="formulas">
    <h2>Fórmulas</h2>
    <p class="muted">Toca una tarjeta para voltearla. Las resaltadas son las del paso actual.</p>
    <div class="ctrl">
      <button class="ghost" @click="flipAll(true)">Mostrar todas</button>
      <button class="ghost" @click="flipAll(false)">Ocultar todas</button>
    </div>
    <label class="check"><input type="checkbox" v-model="ui.onlyRelevant" /> Solo las del paso actual</label>

    <section v-for="g in groups" :key="g">
      <h3>{{ g }}</h3>
      <div class="grid">
        <button
          v-for="x in shown.filter((y) => y.group === g)" :key="x.id"
          class="flip" :class="{ flipped: ui.flipped[x.id], hl: ui.highlight.includes(x.id) }"
          :aria-pressed="!!ui.flipped[x.id]" @click="ui.flipped[x.id] = !ui.flipped[x.id]"
        >
          <span class="inner">
            <span class="face front">{{ x.name }}<small>ver fórmula</small></span>
            <span class="face back"><pre>{{ x.body }}</pre></span>
          </span>
        </button>
      </div>
    </section>
  </aside>
</template>
