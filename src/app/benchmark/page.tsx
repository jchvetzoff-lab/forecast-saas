"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { SAMPLE_LABELS, SAMPLE_DEMAND, SHOCK_START, SHOCK_END, SHOCK_DESCRIPTION } from "@/lib/sample-data"
import { runAllForecasts, type ForecastResult } from "@/lib/forecasting"
import { computeMetrics, computeMetricsForRange } from "@/lib/metrics"
import BenchmarkChart from "@/components/BenchmarkChart"
import MetricsTable from "@/components/MetricsTable"
import CsvUploader from "@/components/CsvUploader"

export default function BenchmarkPage() {
  const [mode, setMode] = useState<"demo" | "custom">("demo")
  const [customLabels, setCustomLabels] = useState<string[]>([])
  const [customDemand, setCustomDemand] = useState<number[]>([])
  const [chronosResult, setChronosResult] = useState<{
    forecast: number[]
    model: string
    source: string
    note?: string
  } | null>(null)
  const [chronosLoading, setChronosLoading] = useState(false)
  const [chronosError, setChronosError] = useState<string | null>(null)

  const labels = mode === "demo" ? SAMPLE_LABELS : customLabels
  const demand = mode === "demo" ? SAMPLE_DEMAND : customDemand
  const hasData = demand.length >= 6

  // Forecasts statistiques (instantane, cote client)
  const forecasts = useMemo(() => {
    if (!hasData) return []
    return runAllForecasts(demand)
  }, [demand, hasData])

  // Appel Chronos-2 via API
  const callChronos = useCallback(async (demandData: number[]) => {
    setChronosLoading(true)
    setChronosError(null)
    setChronosResult(null)

    try {
      // On envoie les donnees d'entrainement (80%) et on forecast les 20% restants
      const trainSize = Math.floor(demandData.length * 0.8)
      const trainData = demandData.slice(0, trainSize)
      const horizon = demandData.length - trainSize

      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demand: trainData, horizon }),
      })

      if (res.status === 503) {
        setChronosError("Modele en cours de chargement... Reessayez dans 30s.")
        return
      }

      const data = await res.json()
      if (data.error) {
        setChronosError(data.error)
        return
      }

      // Construire le forecast complet : donnees reelles pour la partie train, predictions pour le reste
      const fullForecast: number[] = []
      for (let i = 0; i < trainSize; i++) {
        fullForecast.push(demandData[i]) // Pas de forecast sur la partie train
      }
      // Ajouter les predictions Chronos
      const predictions = data.forecast || data.fitted?.slice(-horizon) || []
      for (let i = 0; i < horizon; i++) {
        fullForecast.push(predictions[i] ?? demandData[trainSize + i])
      }

      setChronosResult({
        forecast: fullForecast,
        model: data.model,
        source: data.source,
        note: data.note,
      })
    } catch {
      setChronosError("Erreur reseau. Verifiez que le serveur tourne.")
    } finally {
      setChronosLoading(false)
    }
  }, [])

  // Lancer Chronos-2 automatiquement quand les donnees changent
  useEffect(() => {
    if (hasData) {
      callChronos(demand)
    }
  }, [demand, hasData, callChronos])

  // Combiner les forecasts stats + Chronos
  const allForecasts = useMemo(() => {
    const result: ForecastResult[] = [...forecasts]
    if (chronosResult && chronosResult.forecast.length > 0) {
      result.push({
        name: "Chronos-2" as ForecastResult["name"],
        forecast: chronosResult.forecast,
        color: "#0891B2",
        borderWidth: 2.5,
        borderDash: undefined,
      })
    }
    return result
  }, [forecasts, chronosResult])

  // Metriques pour toutes les methodes
  const metricsResults = useMemo(() => {
    if (!hasData) return []
    return allForecasts.map((f) => ({
      name: f.name,
      color: f.color,
      metrics: computeMetrics(demand, f.forecast),
      shockMetrics:
        mode === "demo"
          ? computeMetricsForRange(demand, f.forecast, SHOCK_START, SHOCK_END)
          : undefined,
    }))
  }, [allForecasts, demand, hasData, mode])

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-sm font-medium text-[#1a1a2e] hover:text-[#2563EB] transition-colors">
            OmniCast AI
          </a>
          <span className="text-[10px] uppercase tracking-[2px] text-[#8E8EA0]">
            Benchmark Forecasting
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Titre */}
        <div className="mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#2563EB] mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-[#2563EB]" />
            Preuve sur donnees reelles
          </p>
          <h1 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extralight leading-[1.1] tracking-[-0.03em] mb-3">
            Testez sur <strong className="font-semibold">vos donnees</strong>
          </h1>
          <p className="text-[15px] text-[#555770] font-[250] max-w-[500px] leading-relaxed">
            Naive, Moving Average, Exponential Smoothing, OmniCast et{" "}
            <strong className="font-medium text-[#0891B2]">Chronos-2 (Amazon)</strong>.
            Les memes metriques que votre cours. Sur vos donnees.
          </p>
        </div>

        {/* Toggle demo / custom */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setMode("demo")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "demo"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white border border-[#E5E7EB] text-[#555770] hover:border-[#2563EB]/30"
            }`}
          >
            Donnees demo (36 mois)
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "custom"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white border border-[#E5E7EB] text-[#555770] hover:border-[#2563EB]/30"
            }`}
          >
            Uploader un CSV
          </button>
        </div>

        {/* Uploader CSV */}
        {mode === "custom" && !hasData && (
          <div className="mb-8">
            <CsvUploader
              onData={(data) => {
                setCustomLabels(data.labels)
                setCustomDemand(data.demand)
              }}
            />
          </div>
        )}

        {mode === "custom" && hasData && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium">
              {demand.length} periodes chargees
            </span>
            <button
              onClick={() => {
                setCustomDemand([])
                setCustomLabels([])
                setChronosResult(null)
              }}
              className="text-xs text-[#8E8EA0] hover:text-[#DC2626] transition-colors"
            >
              Reinitialiser
            </button>
          </div>
        )}

        {/* Status Chronos-2 */}
        {hasData && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            {chronosLoading && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-[#ECFEFF] text-[#0891B2] font-medium animate-pulse">
                Chronos-2 en cours de calcul...
              </span>
            )}
            {chronosResult && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-[#ECFEFF] text-[#0891B2] font-medium">
                Chronos-2 : {chronosResult.model} via {chronosResult.source}
                {chronosResult.note && ` — ${chronosResult.note}`}
              </span>
            )}
            {chronosError && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-[#FEF2F2] text-[#DC2626] font-medium">
                Chronos-2 : {chronosError}
              </span>
            )}
            {chronosError && (
              <button
                onClick={() => callChronos(demand)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#0891B2] text-white font-medium hover:bg-[#0891B2]/80 transition-colors"
              >
                Reessayer
              </button>
            )}
          </div>
        )}

        {/* Contexte du choc */}
        {mode === "demo" && (
          <div className="mb-8 px-5 py-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5]/30">
            <p className="text-sm text-[#DC2626] font-medium">
              Scenario de crise integre (mois 22-28)
            </p>
            <p className="text-xs text-[#DC2626]/70 mt-1">
              {SHOCK_DESCRIPTION}. C&apos;est pendant cette periode que la difference entre les methodes classiques et OmniCast / Chronos-2 se revele.
            </p>
          </div>
        )}

        {/* Graphique */}
        {hasData && (
          <div className="mb-8">
            <BenchmarkChart
              labels={labels}
              demand={demand}
              forecasts={allForecasts}
              shockStart={mode === "demo" ? SHOCK_START : undefined}
              shockEnd={mode === "demo" ? SHOCK_END : undefined}
            />
          </div>
        )}

        {/* Tableau de metriques */}
        {hasData && metricsResults.length > 0 && (
          <MetricsTable
            results={metricsResults}
            showShock={mode === "demo"}
          />
        )}

        {/* Explication */}
        {hasData && (
          <div className="mt-10 grid grid-cols-2 gap-5 max-md:grid-cols-1">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h3 className="text-sm font-medium mb-3">Cours du prof vs OmniCast</h3>
              <ul className="space-y-2 text-xs text-[#555770] font-[250] leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[#8E8EA0] font-bold flex-shrink-0">Prof</span>
                  <span>Naive, MA, SES, DES — formules fixes, donnees historiques seules. Le futur = le passe.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#059669] font-bold flex-shrink-0">OmniCast</span>
                  <span>DES adaptatif + saisonnalite apprise + detection de choc. Reagit plus vite mais toujours en retard.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#0891B2] font-bold flex-shrink-0">Chronos-2</span>
                  <span>Foundation model pre-entraine sur 100Md de points. Zero-shot : il n&apos;a jamais vu vos donnees mais comprend les patterns.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h3 className="text-sm font-medium mb-3">Ce qui change tout</h3>
              <ul className="space-y-2 text-xs text-[#555770] font-[250] leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[#059669] font-bold flex-shrink-0">1.</span>
                  <span><strong className="font-medium">Zero-shot</strong> — Chronos-2 predit sans entrainement sur vos donnees. Pas besoin de 3 ans d&apos;historique.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#059669] font-bold flex-shrink-0">2.</span>
                  <span><strong className="font-medium">Signaux externes</strong> — En production, GDELT injecte des evenements geopolitiques AVANT qu&apos;ils impactent la demande.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#059669] font-bold flex-shrink-0">3.</span>
                  <span><strong className="font-medium">Intervalles de confiance</strong> — MAPIE donne des bornes avec garantie mathematique, pas juste un chiffre.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
