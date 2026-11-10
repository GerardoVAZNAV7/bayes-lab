<script setup>
import { ref } from 'vue'
import { problems } from './data/problems.js'
import { solvedCount } from './store.js'
import Solver from './components/Solver.vue'
import FormulaPanel from './components/FormulaPanel.vue'

const active = ref(problems[0].id)
</script>

<template>
  <header class="top">
    <h1>Bayes Lab</h1>
    <p>Practica paso a paso: Naive Bayes, Laplace, discretización, densidad normal y métricas de evaluación.</p>
  </header>

  <nav class="tabs" aria-label="Problemas">
    <button v-for="(p, i) in problems" :key="p.id" :class="{ on: active === p.id }" @click="active = p.id">
      <b>Problema {{ i + 1 }}</b>
      <span>{{ p.title }}</span>
      <small>{{ solvedCount(p.id) }}/{{ p.steps.length }} pasos · {{ p.tag }}</small>
    </button>
  </nav>

  <main class="layout">
    <Solver :problem="problems.find((p) => p.id === active)" :key="active" />
    <FormulaPanel />
  </main>
</template>
