export const f = (x, d = 4) => Number(x.toFixed(d)).toString()
export const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length
export const variance = (a) => { const m = mean(a); return mean(a.map((x) => (x - m) ** 2)) }
export const std = (a) => Math.sqrt(variance(a))
export const pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI))

// Acepta "0.43", "0,43" o fracciones "3/7"
export function parseNum(s) {
  s = String(s ?? '').trim().replace(',', '.')
  if (s === '') return NaN
  if (s.includes('/')) {
    const [a, b] = s.split('/').map(Number)
    return a / b
  }
  return Number(s)
}
