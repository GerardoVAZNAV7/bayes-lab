export const formulas = [
  { id: 'prior', group: 'Naive Bayes', name: 'Probabilidad a priori', body: 'P(C) = n(C) / N\n\nn(C): ejemplos de la clase C\nN: total de ejemplos' },
  { id: 'cond', group: 'Naive Bayes', name: 'Probabilidad condicionada', body: 'P(A=v | C) = n(A=v, C) / n(C)\n\nCuenta los ejemplos de la clase C con A=v y divide entre los de la clase.' },
  { id: 'nbscore', group: 'Naive Bayes', name: 'Predicción (score)', body: 'score(C) = P(C) · P(A₁=v₁|C) · … · P(Aₙ=vₙ|C)\n\nClase = la de mayor score (argmax).' },
  { id: 'laplace', group: 'Naive Bayes', name: 'Suavizado de Laplace', body: 'P(A=v | C) = (n(A=v,C) + k) / (n(C) + k·|A|)\n\nk = 1 (usual)\n|A| = número de valores posibles del atributo' },
  { id: 'disc', group: 'Naive Bayes', name: 'Discretización', body: 'Dividir el rango de un atributo numérico en intervalos (bins) y tratar cada intervalo como un valor categórico.\n\nDespués se aplica Naive Bayes normal.' },
  { id: 'mean', group: 'Densidad', name: 'Media', body: 'x̄ = (1/N) · Σ xᵢ\n\nExcel: AVERAGE(rango)' },
  { id: 'var', group: 'Densidad', name: 'Varianza', body: 'σ² = (1/N) · Σ (xᵢ − x̄)²\n\nMedia de las diferencias con la media, al cuadrado.\nExcel: VAR.P(rango)' },
  { id: 'std', group: 'Densidad', name: 'Desviación estándar', body: 'σ = √σ²\n\nExcel: STDEV.P (población)\nSTDEV.S (muestra)' },
  { id: 'range', group: 'Densidad', name: 'Rango normal y regla 68-95-99.7', body: 'Rango normal: μ ± σ\n\nμ±1σ → 68.26 %\nμ±2σ → 95.44 %\nμ±3σ → 99.72 %' },
  { id: 'pdf', group: 'Densidad', name: 'Función de densidad normal', body: 'y = 1/(σ√(2π)) · e^(−(x−μ)²/(2σ²))\n\nExcel: NORM.DIST(x, μ, σ, FALSO)\n\nP(a<X<b) = ∫ₐᵇ p(x)dx' },
  { id: 'matrix', group: 'Métricas', name: 'Matriz de confusión', body: '              Real +   Real −\nPred +        TP       FP\nPred −        FN       TN\n\nTP+FP: predichos positivos\nTP+FN: reales positivos' },
  { id: 'acc', group: 'Métricas', name: 'Accuracy', body: 'Accuracy = (TP + TN) / Total' },
  { id: 'prec', group: 'Métricas', name: 'Precision', body: 'Precision = TP / (TP + FP)\n\nDe lo que predije positivo, ¿cuánto acerté?' },
  { id: 'rec', group: 'Métricas', name: 'Recall', body: 'Recall = TP / (TP + FN)\n\nDe lo que era positivo, ¿cuánto encontré?' },
  { id: 'f1', group: 'Métricas', name: 'Medida F1', body: 'F1 = 2 · (precision · recall) / (precision + recall)' }
]
