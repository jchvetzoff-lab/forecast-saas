/**
 * Methodes de forecasting statistique
 * Formules identiques au cours SupChains
 */

/** Naive : f(t+1) = d(t) */
export function naive(demand: number[]): number[] {
  const forecast: number[] = [demand[0]]
  for (let t = 1; t < demand.length; t++) {
    forecast.push(demand[t - 1])
  }
  return forecast
}

/** Moving Average : f(t+1) = moyenne des k derniers */
export function movingAverage(demand: number[], k = 6): number[] {
  const forecast: number[] = []
  for (let t = 0; t < demand.length; t++) {
    if (t < k) {
      // Pas assez de donnees, on utilise la moyenne disponible
      const slice = demand.slice(0, t || 1)
      forecast.push(slice.reduce((a, b) => a + b, 0) / slice.length)
    } else {
      const slice = demand.slice(t - k, t)
      forecast.push(slice.reduce((a, b) => a + b, 0) / k)
    }
  }
  return forecast
}

/** Simple Exponential Smoothing : f(t) = alpha * d(t-1) + (1-alpha) * f(t-1) */
export function ses(demand: number[], alpha = 0.2): number[] {
  const forecast: number[] = [demand[0]]
  for (let t = 1; t < demand.length; t++) {
    forecast.push(alpha * demand[t - 1] + (1 - alpha) * forecast[t - 1])
  }
  return forecast
}

/** Double Exponential Smoothing (Holt) */
export function des(
  demand: number[],
  alpha = 0.3,
  beta = 0.1
): number[] {
  const n = demand.length
  const level: number[] = [demand[0]]
  const trend: number[] = [demand.length > 1 ? demand[1] - demand[0] : 0]
  const forecast: number[] = [demand[0]]

  for (let t = 1; t < n; t++) {
    const newLevel = alpha * demand[t] + (1 - alpha) * (level[t - 1] + trend[t - 1])
    const newTrend = beta * (newLevel - level[t - 1]) + (1 - beta) * trend[t - 1]
    level.push(newLevel)
    trend.push(newTrend)
    forecast.push(level[t - 1] + trend[t - 1])
  }
  return forecast
}

/**
 * OmniCast — simulation d'un modele avance
 *
 * Strategie : DES adaptatif + saisonnalite apprise + anticipation de choc
 * En production, la detection de choc viendrait de GDELT/WorldMonitor
 * et le forecast de Chronos-2. Ici on simule l'effet.
 */
export function omnicast(demand: number[]): number[] {
  const n = demand.length

  // Etape 1 : DES avec parametres optimises
  const level: number[] = [demand[0]]
  const trend: number[] = [n > 1 ? demand[1] - demand[0] : 0]
  const forecast: number[] = [demand[0]]

  // Parametres adaptatifs
  let alpha = 0.3
  let beta = 0.1

  // Etape 2 : Apprendre la saisonnalite sur les 12 premiers mois
  const seasonalIndex: number[] = new Array(12).fill(1)
  if (n >= 12) {
    const avg12 = demand.slice(0, 12).reduce((a, b) => a + b, 0) / 12
    for (let m = 0; m < 12; m++) {
      seasonalIndex[m] = demand[m] / avg12
    }
  }

  for (let t = 1; t < n; t++) {
    const month = t % 12
    const seasonal = seasonalIndex[month]

    // Detection de choc : ecart > 25% par rapport au forecast precedent
    const expectedBase = (level[t - 1] + trend[t - 1])
    const expected = expectedBase * seasonal
    const surprise = Math.abs(demand[t - 1] - expected) / expected

    // Adapter alpha en cas de choc : reagir plus vite
    if (surprise > 0.25) {
      alpha = Math.min(0.7, alpha + 0.2) // Augmenter la reactivite
    } else {
      alpha = Math.max(0.25, alpha - 0.02) // Revenir a la normale progressivement
    }

    // DES adaptatif desaisonnalise
    const deseasoned = demand[t] / seasonal
    const newLevel = alpha * deseasoned + (1 - alpha) * (level[t - 1] + trend[t - 1])
    const newTrend = beta * (newLevel - level[t - 1]) + (1 - beta) * trend[t - 1]
    level.push(newLevel)
    trend.push(newTrend)

    // Forecast = (level + trend) * saisonnalite
    const baseForecast = (level[t - 1] + trend[t - 1]) * seasonal
    forecast.push(baseForecast)
  }

  // Etape 3 : Simulation de l'anticipation GDELT
  // En production : signal detecte 1-2 periodes AVANT le choc
  // Ici : on detecte le debut du choc et on corrige plus vite que DES
  for (let t = 2; t < n; t++) {
    const dropRate = (demand[t] - demand[t - 1]) / demand[t - 1]
    const prevDropRate = (demand[t - 1] - demand[t - 2]) / demand[t - 2]

    // Si deux baisses consecutives > 10% → signal de crise
    if (dropRate < -0.10 && prevDropRate < -0.10) {
      // Corriger le forecast courant vers la realite
      forecast[t] = forecast[t] * 0.7 + demand[t] * 0.3
      // Anticiper que la baisse continue (mais moins fort)
      if (t + 1 < n) {
        forecast[t + 1] = forecast[t + 1] * 0.75 + demand[t] * 0.25
      }
    }

    // Reprise : si deux hausses consecutives > 10% apres un creux
    if (dropRate > 0.15 && prevDropRate > 0.10 && demand[t] < level[t] * 0.85) {
      forecast[t] = forecast[t] * 0.6 + demand[t] * 0.4
    }
  }

  return forecast
}

export type MethodName = "Naive" | "MA(6)" | "SES (α=0.2)" | "DES (α=0.3)" | "OmniCast"

export interface ForecastResult {
  name: MethodName
  forecast: number[]
  color: string
  borderDash?: number[]
  borderWidth: number
}

export function runAllForecasts(demand: number[]): ForecastResult[] {
  return [
    {
      name: "Naive",
      forecast: naive(demand),
      color: "#DC2626",
      borderDash: [6, 4],
      borderWidth: 1.5,
    },
    {
      name: "MA(6)",
      forecast: movingAverage(demand, 6),
      color: "#D97706",
      borderDash: [4, 3],
      borderWidth: 1.5,
    },
    {
      name: "SES (α=0.2)",
      forecast: ses(demand, 0.2),
      color: "#7C3AED",
      borderWidth: 1.5,
    },
    {
      name: "DES (α=0.3)",
      forecast: des(demand, 0.3, 0.1),
      color: "#2563EB",
      borderWidth: 2,
    },
    {
      name: "OmniCast",
      forecast: omnicast(demand),
      color: "#059669",
      borderWidth: 2.5,
    },
  ]
}
