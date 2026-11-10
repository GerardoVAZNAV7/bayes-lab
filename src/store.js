import { reactive } from 'vue'

// Estado de la interfaz compartido entre el solucionador y las tarjetas de fórmulas
export const ui = reactive({ highlight: [], flipped: {}, onlyRelevant: false })

// Progreso por problema (se conserva al cambiar de pestaña)
const progress = reactive({})
export function getState(id) {
  if (!progress[id]) progress[id] = { answers: {}, results: {}, solved: {}, hint: {} }
  return progress[id]
}
export function resetState(id) { delete progress[id] }
export function solvedCount(id) { return Object.keys(getState(id).solved).length }
