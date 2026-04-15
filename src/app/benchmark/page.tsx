"use client"

import { useState, useMemo } from "react"
import { SAMPLE_LABELS, SAMPLE_DEMAND, SHOCK_START, SHOCK_END, SHOCK_DESCRIPTION } from "@/lib/sample-data"
import { runAllForecasts } from "@/lib/forecasting"
import { computeMetrics, computeMetricsForRange } from "@/lib/metrics"
import BenchmarkChart from "@/components/BenchmarkChart"
import MetricsTable from "@/components/MetricsTable"
import CsvUploader from "@/components/CsvUploader"

export default function BenchmarkPage() {
  const [mode, setMode] = useState<"demo" | "custom">("demo")
  const [customLabels, setCustomLabels] = useState<string[]>([])
  const [customDemand, setCustomDemand] = useState<number[]>([])

  const labels = mode === "demo" ? SAMPLE_LABELS : customLabels
  const demand = mode === "demo" ? SAMPLE_DEMAND : customDemand
  const hasData = demand.length >= 6

  const forecasts = useMemo(() => {
    if (!hasData) return []
    return runAllForecasts(demand)
  }, [demand, hasData])

  const metricsResults = useMemo(() => {
    if (!hasData) return []
    return forecasts.map((f) => ({
      name: f.name,
      color: f.color,
      metrics: computeMetrics(demand, f.forecast),
      shockMetrics:
        mode === "demo"
          ? computeMetricsForRange(demand, f.forecast, SHOCK_START, SHOCK_END)
          : undefined,
    }))
  }, [forecasts, demand, hasData, mode])

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
            Naive, Moving Average, Exponential Smoothing vs OmniCast.
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
              }}
              className="text-xs text-[#8E8EA0] hover:text-[#DC2626] transition-colors"
            >
              Reinitialiser
            </button>
          </div>
        )}

        {/* Contexte du choc (mode demo uniquement) */}
        {mode === "demo" && (
          <div className="mb-8 px-5 py-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5]/30">
            <p className="text-sm text-[#DC2626] font-medium">
              Scenario de crise integre (mois 24-28)
            </p>
            <p className="text-xs text-[#DC2626]/70 mt-1">
              {SHOCK_DESCRIPTION}. C&apos;est pendant cette periode que la difference entre les methodes classiques et OmniCast se revele.
            </p>
          </div>
        )}

        {/* Graphique */}
        {hasData && (
          <div className="mb-8">
            <BenchmarkChart
              labels={labels}
              demand={demand}
              forecasts={forecasts}
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

        {/* Explication pedagogique */}
        {hasData && (
          <div className="mt-10 grid grid-cols-2 gap-5 max-md:grid-cols-1">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h3 className="text-sm font-medium mb-3">Pourquoi OmniCast gagne ?</h3>
              <ul className="space-y-2 text-xs text-[#555770] font-[250] leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[#059669] font-bold flex-shrink-0">1.</span>
                  <span>En regime normal, DES et OmniCast sont proches — la tendance est bien captee par les deux.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#059669] font-bold flex-shrink-0">2.</span>
                  <span>Pendant le choc, les methodes classiques continuent de predire la tendance passee. OmniCast detecte le signal de disruption et ajuste en avance.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#059669] font-bold flex-shrink-0">3.</span>
                  <span>En production, le signal vient de GDELT (evenements geopolitiques temps reel), pas d&apos;un simple calcul statistique.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h3 className="text-sm font-medium mb-3">Prochaine etape</h3>
              <p className="text-xs text-[#555770] font-[250] leading-relaxed mb-3">
                Cette demo utilise un algorithme simplifie. En production, OmniCast remplace le moteur interne par :
              </p>
              <ul className="space-y-1.5 text-xs text-[#555770] font-[250]">
                <li>
                  <strong className="text-[#2563EB] font-medium">Chronos-2</strong> — Foundation model Amazon, zero-shot
                </li>
                <li>
                  <strong className="text-[#2563EB] font-medium">GDELT</strong> — Signaux geopolitiques temps reel
                </li>
                <li>
                  <strong className="text-[#2563EB] font-medium">MAPIE</strong> — Intervalles de confiance garantis
                </li>
                <li>
                  <strong className="text-[#2563EB] font-medium">MiroFish</strong> — Simulation des reactions marche
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
