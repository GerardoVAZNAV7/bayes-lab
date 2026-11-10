import { f, mean, variance, std, pdf } from '../lib.js'

const num = (key, label, answer, tol) => ({ key, label, answer, tol })

/* ---------- Generador de pasos de Naive Bayes (k=0 sin suavizado, k>0 Laplace) ---------- */
function nbSteps({ attrs, rows, classes, query, k = 0 }) {
  const n = rows.length
  const cnt = (c) => rows.filter((r) => r.c === c).length
  const prior = Object.fromEntries(classes.map((c) => [c, cnt(c) / n]))
  const cond = Object.fromEntries(classes.map((c) => [c, []]))
  const steps = []

  steps.push({
    title: 'Probabilidades a priori',
    text: 'Calcula P(C) para cada clase (puedes escribir fracciones como 3/10).',
    hint: 'Cuenta cuántos ejemplos hay de cada clase y divide entre el total de ejemplos.',
    procedure: classes.map((c) => `P(${c}) = ${cnt(c)}/${n} = ${f(prior[c])}`).join('\n'),
    formulas: ['prior'],
    inputs: classes.map((c) => num('p' + c, `P(${c})`, prior[c]))
  })

  attrs.forEach((a, j) => {
    const v = query[j]
    const items = classes.map((c) => {
      const x = rows.filter((r) => r.c === c && r.v[j] === v).length
      const ans = (x + k) / (cnt(c) + k * a.values.length)
      cond[c].push(ans)
      return { c, x, den: cnt(c), ans }
    })
    steps.push({
      title: `P(${a.name} = ${v} | C)`,
      text: `Calcula la probabilidad de ${a.name} = ${v} en cada clase.`,
      hint: k
        ? `Usa Laplace: suma k=${k} al numerador y k·|A| al denominador. Aquí |${a.name}| = ${a.values.length} (${a.values.join(', ')}).`
        : `Cuenta cuántos ejemplos de cada clase tienen ${a.name} = ${v} y divide entre el total de esa clase. Ojo: puede salir 0.`,
      procedure: items
        .map((i) => k
          ? `P(${v}|${i.c}) = (${i.x}+${k})/(${i.den}+${k}·${a.values.length}) = ${f(i.ans)}`
          : `P(${v}|${i.c}) = ${i.x}/${i.den} = ${f(i.ans)}`)
        .join('\n'),
      formulas: k ? ['cond', 'laplace'] : ['cond'],
      inputs: items.map((i) => num('c' + i.c, `P(${v} | ${i.c})`, i.ans))
    })
  })

  const scores = Object.fromEntries(classes.map((c) => [c, cond[c].reduce((p, x) => p * x, prior[c])]))
  steps.push({
    title: 'Score de cada clase',
    text: 'Multiplica la a priori por todas las condicionadas.',
    hint: 'Naive Bayes asume independencia: score(C) = P(C) · producto de las P(Aᵢ=vᵢ|C) que acabas de calcular.',
    procedure: classes.map((c) => `score(${c}) = ${f(prior[c])} · ${cond[c].map((x) => f(x)).join(' · ')} = ${f(scores[c], 6)}`).join('\n'),
    formulas: ['nbscore'],
    inputs: classes.map((c) => num('s' + c, `score(${c})`, scores[c]))
  })

  const best = classes.reduce((b, c) => (scores[c] > scores[b] ? c : b), classes[0])
  steps.push({
    title: 'Clasificación',
    text: 'La predicción es la clase con mayor probabilidad a posteriori.',
    hint: 'Compara los scores: gana el más grande (no hace falta normalizar).',
    procedure: `${classes.map((c) => `score(${c}) = ${f(scores[c], 6)}`).join('  vs  ')}  →  ${best}` +
      (k === 0 && classes.some((c) => scores[c] === 0) ? '\n(Un solo factor 0 anula todo el producto: por eso existe el suavizado de Laplace.)' : ''),
    formulas: ['nbscore'],
    inputs: [{ key: 'cls', label: 'Clase predicha', type: 'choice', options: classes, answer: best }]
  })
  return steps
}

/* ---------- Datos: Lepistos (del .md) ---------- */
const lepAttrs = [
  { name: 'Color', values: ['rojo', 'amarillo', 'blanco', 'negro'] },
  { name: 'Alas', values: ['sí', 'no'] },
  { name: 'Tamaño', values: ['pequeño', 'medio', 'grande'] },
  { name: 'Velocidad', values: ['alta', 'media', 'baja'] }
]
const lepRaw = [
  ['negro', 'sí', 'pequeño', 'alta', '+'], ['amarillo', 'no', 'grande', 'media', '−'],
  ['amarillo', 'no', 'grande', 'baja', '−'], ['blanco', 'sí', 'medio', 'alta', '+'],
  ['negro', 'no', 'medio', 'alta', '−'], ['rojo', 'sí', 'pequeño', 'alta', '+'],
  ['rojo', 'sí', 'pequeño', 'baja', '−'], ['negro', 'no', 'medio', 'media', '−'],
  ['negro', 'sí', 'pequeño', 'media', '−'], ['amarillo', 'sí', 'grande', 'media', '−']
]
const lepRows = lepRaw.map((r) => ({ v: r.slice(0, 4), c: r[4] }))
const lepTable = {
  columns: ['', 'Color', 'Alas', 'Tamaño', 'Velocidad', 'Lepisto'],
  rows: lepRaw.map((r, i) => ['E' + (i + 1), ...r])
}
const lepQuery = ['amarillo', 'no', 'pequeño', 'alta']
const lepStatement = 'Unos biólogos descubrieron una especie de insectos, los lepistos. Con estos 10 ejemplos de su cuaderno, decide si un insecto amarillo, sin alas, pequeño y de velocidad alta es un lepisto (+).'

/* ---------- Datos: gripe con discretización ---------- */
const temps = [36.2, 36.8, 37.5, 38.4, 39.1, 38.9, 36.5, 37.9]
const tos = ['no', 'no', 'sí', 'sí', 'sí', 'no', 'sí', 'sí']
const gripe = ['Sano', 'Sano', 'Sano', 'Gripe', 'Gripe', 'Gripe', 'Sano', 'Gripe']
const bin = (t) => (t < 37.5 ? 'Normal' : t < 38.5 ? 'Febrícula' : 'Fiebre')
const binCount = (b) => temps.filter((t) => bin(t) === b).length
const gripeAttrs = [
  { name: 'Temperatura', values: ['Normal', 'Febrícula', 'Fiebre'] },
  { name: 'Tos', values: ['sí', 'no'] }
]
const gripeRows = temps.map((t, i) => ({ v: [bin(t), tos[i]], c: gripe[i] }))
const gripeNB = nbSteps({ attrs: gripeAttrs, rows: gripeRows, classes: ['Gripe', 'Sano'], query: ['Febrícula', 'sí'], k: 1 })

/* ---------- Datos: alturas (del .md) ---------- */
const h = [600, 470, 170, 430, 300]
const mu = mean(h), va = variance(h), sd = std(h)
const inside = h.filter((x) => x >= mu - sd && x <= mu + sd).length

/* ---------- Datos: matriz de confusión ---------- */
const pairs = [['c','c'],['c','nc'],['nc','nc'],['c','c'],['nc','c'],['nc','nc'],['c','c'],['c','nc'],['nc','nc'],['nc','nc']]
const TP = pairs.filter(([p, r]) => p === 'c' && r === 'c').length
const FP = pairs.filter(([p, r]) => p === 'c' && r === 'nc').length
const FN = pairs.filter(([p, r]) => p === 'nc' && r === 'c').length
const TN = pairs.filter(([p, r]) => p === 'nc' && r === 'nc').length
const N = pairs.length
const prec = TP / (TP + FP), rec = TP / (TP + FN)

export const problems = [
  {
    id: 'p1', title: 'Lepistos sin suavizado', tag: 'Naive Bayes',
    statement: lepStatement + ' Aquí NO uses suavizado de Laplace.',
    table: lepTable,
    steps: nbSteps({ attrs: lepAttrs, rows: lepRows, classes: ['+', '−'], query: lepQuery, k: 0 }),
    summary: 'Como no hay lepistos amarillos en el entrenamiento, P(amarillo|+) = 0 y el score de + se anula. Eso es sobreajuste: el siguiente problema lo corrige.'
  },
  {
    id: 'p2', title: 'Lepistos con Laplace', tag: 'Laplace',
    statement: lepStatement + ' Ahora aplica suavizado de Laplace con k = 1.',
    table: lepTable,
    steps: nbSteps({ attrs: lepAttrs, rows: lepRows, classes: ['+', '−'], query: lepQuery, k: 1 }),
    summary: 'Con Laplace ninguna probabilidad es 0, pero la clase sigue siendo − (0.00848 > 0.00286). Compáralo con el problema 1.'
  },
  {
    id: 'p3', title: 'Alturas de perros: densidad normal', tag: 'Densidad',
    statement: 'Las alturas de los hombros de cinco perros son 600, 470, 170, 430 y 300 mm. Calcula sus estadísticos y úsalos en la función de densidad normal.',
    table: { columns: ['Perro', '1', '2', '3', '4', '5'], rows: [['Altura (mm)', ...h]] },
    steps: [
      { title: 'Media', text: 'Calcula μ.', hint: 'Suma las 5 alturas y divide entre 5.', procedure: `μ = (${h.join(' + ')}) / 5 = ${f(mu)}`, formulas: ['mean'], inputs: [num('m', 'μ (mm)', mu)] },
      { title: 'Varianza', text: 'Calcula σ² (población, dividiendo entre N).', hint: 'Resta la media a cada dato, eleva al cuadrado, suma y divide entre 5.', procedure: `diferencias: ${h.map((x) => f(x - mu)).join(', ')}\nσ² = ${f(va * h.length)} / 5 = ${f(va)}`, formulas: ['var'], inputs: [num('v', 'σ²', va)] },
      { title: 'Desviación estándar', text: 'Calcula σ.', hint: 'Es la raíz cuadrada de la varianza.', procedure: `σ = √${f(va)} = ${f(sd, 2)}`, formulas: ['std'], inputs: [num('s', 'σ (mm)', sd)] },
      { title: 'Rango normal', text: 'Calcula los límites μ − σ y μ + σ.', hint: 'Suma y resta σ a la media.', procedure: `${f(mu)} − ${f(sd, 2)} = ${f(mu - sd, 2)}\n${f(mu)} + ${f(sd, 2)} = ${f(mu + sd, 2)}`, formulas: ['range'], inputs: [num('lo', 'Límite inferior', mu - sd), num('hi', 'Límite superior', mu + sd)] },
      { title: 'Perros "normales"', text: '¿Cuántos de los 5 perros quedan dentro del rango normal?', hint: 'Compara cada altura con los límites que calculaste.', procedure: `Dentro: ${h.filter((x) => x >= mu - sd && x <= mu + sd).join(', ')} → ${inside} perros`, formulas: ['range'], inputs: [num('n', 'Perros dentro', inside, 0.1)] },
      { title: 'Densidad en x = 470', text: 'Evalúa la función de densidad normal en x = 470 con tu μ y σ (4-5 decimales).', hint: 'Sustituye en y = 1/(σ√(2π)) · e^(−(x−μ)²/(2σ²)). En Excel: NORM.DIST(470; μ; σ; FALSO).', procedure: `1/(${f(sd, 2)}·√(2π)) = ${f(1 / (sd * Math.sqrt(2 * Math.PI)), 6)}\nexponente = −(76)²/(2·${f(va)}) = ${f(-(76 ** 2) / (2 * va), 4)}\ny = ${f(pdf(470, mu, sd), 6)}`, formulas: ['pdf', 'excel'].filter((x) => x !== 'excel'), inputs: [num('y', 'p(470)', pdf(470, mu, sd), 0.00003)] },
      { title: 'Regla empírica', text: '¿Qué % de los datos de una normal cae entre μ−2σ y μ+2σ?', hint: 'Recuerda la campana de Gauss: 68.26 %, 95.44 % y 99.72 %.', procedure: 'μ±2σ → 95.44 %', formulas: ['range'], inputs: [num('pct', '% entre μ±2σ', 95.44, 0.5)] }
    ],
    summary: 'Dos perros (600 y 170 mm) quedan fuera de 247–541 mm. La densidad no es una probabilidad puntual: para una probabilidad se integra en un intervalo (a, b).'
  },
  {
    id: 'p4', title: 'Gripe: discretización + Laplace', tag: 'Discretización',
    statement: 'Ocho pacientes con su temperatura (°C) y si tienen tos. Discretiza la temperatura (Normal < 37.5 · Febrícula 37.5–38.4 · Fiebre ≥ 38.5) y clasifica a un paciente con 38.0 °C y tos usando Laplace (k = 1).',
    table: { columns: ['', 'Temp (°C)', 'Tos', 'Clase'], rows: temps.map((t, i) => ['P' + (i + 1), t, tos[i], gripe[i]]) },
    steps: [
      {
        title: 'Discretizar la temperatura', text: 'Cuenta cuántos pacientes caen en cada intervalo y en qué intervalo cae el nuevo paciente (38.0 °C).',
        hint: 'Clasifica cada temperatura según los cortes: <37.5, de 37.5 a <38.5, y ≥38.5.',
        procedure: `Normal: ${temps.filter((t) => bin(t) === 'Normal').join(', ')}\nFebrícula: ${temps.filter((t) => bin(t) === 'Febrícula').join(', ')}\nFiebre: ${temps.filter((t) => bin(t) === 'Fiebre').join(', ')}\n38.0 → Febrícula`,
        formulas: ['disc'],
        inputs: [num('n', '# Normal', binCount('Normal'), 0.1), num('f', '# Febrícula', binCount('Febrícula'), 0.1), num('h', '# Fiebre', binCount('Fiebre'), 0.1),
          { key: 'q', label: 'Intervalo de 38.0 °C', type: 'choice', options: ['Normal', 'Febrícula', 'Fiebre'], answer: 'Febrícula' }]
      },
      ...gripeNB
    ],
    summary: 'Discretizar convierte un atributo numérico en categórico para poder contar. Sin Laplace, el intervalo vacío "Fiebre" en la clase Sano habría dado probabilidad 0.'
  },
  {
    id: 'p5', title: 'Detector COVID: matriz y métricas', tag: 'Evaluación',
    statement: 'Un sistema de detección de COVID hizo 10 predicciones (c = COVID, nc = no COVID). Considera "c" como clase positiva. Arma la matriz de confusión y calcula las métricas.',
    table: { columns: ['#', ...pairs.map((_, i) => i + 1)], rows: [['Predicción', ...pairs.map((p) => p[0])], ['Real', ...pairs.map((p) => p[1])]] },
    matrix: true,
    steps: [
      { title: 'Matriz de confusión', text: 'Cuenta TP, FP, FN y TN.', hint: 'TP: predijo c y era c · FP: predijo c pero era nc · FN: predijo nc pero era c · TN: predijo nc y era nc.', procedure: `TP = ${TP}, FP = ${FP}, FN = ${FN}, TN = ${TN} (total ${N})`, formulas: ['matrix'], inputs: [num('tp', 'TP', TP, 0.1), num('fp', 'FP', FP, 0.1), num('fn', 'FN', FN, 0.1), num('tn', 'TN', TN, 0.1)] },
      { title: 'Accuracy', text: 'Proporción de aciertos totales.', hint: 'Aciertos son TP + TN.', procedure: `(${TP} + ${TN}) / ${N} = ${f((TP + TN) / N)}`, formulas: ['acc'], inputs: [num('a', 'Accuracy', (TP + TN) / N)] },
      { title: 'Precision', text: 'De los predichos positivos, ¿cuántos eran positivos?', hint: 'Predichos positivos = TP + FP (fila de predicción "c").', procedure: `${TP} / (${TP} + ${FP}) = ${f(prec)}`, formulas: ['prec', 'matrix'], inputs: [num('p', 'Precision', prec)] },
      { title: 'Recall', text: 'De los positivos reales, ¿cuántos detectó?', hint: 'Reales positivos = TP + FN (columna "Real c").', procedure: `${TP} / (${TP} + ${FN}) = ${f(rec)}`, formulas: ['rec', 'matrix'], inputs: [num('r', 'Recall', rec)] },
      { title: 'Medida F1', text: 'Media armónica de precision y recall.', hint: 'Usa los valores sin redondear si puedes.', procedure: `2·(${f(prec)}·${f(rec)}) / (${f(prec)}+${f(rec)}) = ${f((2 * prec * rec) / (prec + rec))}`, formulas: ['f1'], inputs: [num('f1', 'F1', (2 * prec * rec) / (prec + rec))] }
    ],
    summary: 'El sistema acierta 70 % de las veces, pero solo 60 % de sus alarmas son reales (precision) mientras detecta 75 % de los casos (recall). En salud suele importar más el recall.'
  }
]
