<script setup>
import { computed, watch } from 'vue'
import { getState, resetState, ui } from '../store.js'
import { parseNum, f } from '../lib.js'

const props = defineProps({ problem: Object })
const st = computed(() => getState(props.problem.id))
const steps = computed(() => props.problem.steps)
const current = computed(() => {
  const i = steps.value.findIndex((_, i) => !st.value.solved[i])
  return i < 0 ? steps.value.length : i
})
const finished = computed(() => current.value >= steps.value.length)

watch([() => props.problem.id, current], () => {
  ui.highlight = steps.value[current.value]?.formulas ?? []
}, { immediate: true })

const k = (i, key) => `${i}.${key}`

function check(i) {
  let all = true
  steps.value[i].inputs.forEach((inp) => {
    const key = k(i, inp.key)
    const v = st.value.answers[key]
    let ok
    if (inp.type === 'choice') ok = v === inp.answer
    else {
      const x = parseNum(v)
      const tol = inp.tol ?? Math.abs(inp.answer) * 0.04 + 1e-9
      ok = !Number.isNaN(x) && Math.abs(x - inp.answer) <= tol
    }
    st.value.results[key] = ok
    if (!ok) all = false
  })
  if (all) st.value.solved[i] = true
}

function help(i) {
  const lvl = Math.min((st.value.hint[i] || 0) + 1, 3)
  st.value.hint[i] = lvl
  const ids = steps.value[i].formulas
  ui.highlight = ids
  ids.forEach((id) => (ui.flipped[id] = true))
  if (lvl === 3) {
    steps.value[i].inputs.forEach((inp) => {
      st.value.answers[k(i, inp.key)] = inp.type === 'choice' ? inp.answer : f(inp.answer, 6)
    })
  }
}

const cell = (key) => (st.value.results['0.' + key] ? props.problem.steps[0].inputs.find((x) => x.key === key).answer : '?')
</script>

<template>
  <section class="solver">
    <div class="statement">
      <h2>{{ problem.title }}</h2>
      <p>{{ problem.statement }}</p>
      <div class="scroll">
        <table>
          <thead><tr><th v-for="c in problem.table.columns" :key="c">{{ c }}</th></tr></thead>
          <tbody><tr v-for="(r, i) in problem.table.rows" :key="i"><td v-for="(c, j) in r" :key="j">{{ c }}</td></tr></tbody>
        </table>
      </div>
      <button class="ghost small" @click="resetState(problem.id)">Reiniciar problema</button>
    </div>

    <div v-if="problem.matrix" class="matrix" aria-label="Matriz de confusión">
      <div></div><div class="h">Real: c</div><div class="h">Real: nc</div>
      <div class="h">Pred: c</div><div class="tp">TP = {{ cell('tp') }}</div><div class="fp">FP = {{ cell('fp') }}</div>
      <div class="h">Pred: nc</div><div class="fn">FN = {{ cell('fn') }}</div><div class="tn">TN = {{ cell('tn') }}</div>
    </div>

    <article v-for="(s, i) in steps.slice(0, current + 1)" :key="i" class="step" :class="{ solved: st.solved[i], active: i === current }">
      <h3><span class="n">{{ st.solved[i] ? '✓' : i + 1 }}</span> {{ s.title }}</h3>
      <p>{{ s.text }}</p>

      <div class="inputs">
        <label v-for="inp in s.inputs" :key="inp.key" :class="{ bad: st.results[k(i, inp.key)] === false, good: st.results[k(i, inp.key)] }">
          {{ inp.label }}
          <select v-if="inp.type === 'choice'" v-model="st.answers[k(i, inp.key)]" :disabled="st.solved[i]">
            <option :value="undefined" disabled>Elige…</option>
            <option v-for="o in inp.options" :key="o" :value="o">{{ o }}</option>
          </select>
          <input v-else v-model="st.answers[k(i, inp.key)]" inputmode="decimal" placeholder="valor o fracción" :disabled="st.solved[i]" @keyup.enter="check(i)" />
        </label>
      </div>

      <div v-if="i === current" class="actions">
        <button class="primary" @click="check(i)">Comprobar</button>
        <button class="help" @click="help(i)">Ayuda ({{ st.hint[i] || 0 }}/3)</button>
      </div>
      <p v-if="i === current && Object.values(st.results).some((r) => r === false) && !st.solved[i]" class="msg bad">Algún valor no coincide. Revisa el cálculo o pide ayuda.</p>

      <div v-if="(st.hint[i] >= 1) || st.solved[i]" class="helpbox">
        <p v-if="st.hint[i] >= 1"><b>Pista:</b> {{ s.hint }} <i class="muted">(Se voltearon las fórmulas del paso.)</i></p>
        <pre v-if="st.hint[i] >= 2 || st.solved[i]"><b>Procedimiento</b>
{{ s.procedure }}</pre>
        <p v-if="st.hint[i] === 3 && !st.solved[i]" class="muted">Se rellenaron las respuestas: pulsa Comprobar para continuar.</p>
      </div>
    </article>

    <div v-if="finished" class="done">
      <h3>Problema resuelto</h3>
      <p>{{ problem.summary }}</p>
    </div>
  </section>
</template>
