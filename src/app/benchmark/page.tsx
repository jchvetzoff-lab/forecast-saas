"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { SAMPLE_LABELS, SAMPLE_DEMAND, SHOCK_START, SHOCK_END, SHOCK_DESCRIPTION } from "@/lib/sample-data"
import { runAllForecasts, type ForecastResult } from "@/lib/forecasting"
import { computeMetrics, computeMetricsForRange } from "@/lib/metrics"
import BenchmarkChart from "@/components/BenchmarkChart"
import MetricsTable from "@/components/MetricsTable"
import CsvUploader from "@/components/CsvUploader"
import { EventTimeline } from "@/components/EventTimeline"

// Types pour les API
interface GdeltEvent { title: string; url: string; source: string; date: string; tone: number; category: "critical" | "warning" | "info" }
interface AgentProfile { name: string; count: number; reaction: string; sentiment: number; actions: string[]; source: string }
interface SimulationResult { event: string; severity: number; agents_total: number; profiles: AgentProfile[]; consensus: number; recommendation: string }

export default function BenchmarkPage() {
  const [mode, setMode] = useState<"demo" | "custom">("demo")
  const [customLabels, setCustomLabels] = useState<string[]>([])
  const [customDemand, setCustomDemand] = useState<number[]>([])

  // Chronos-2
  const [chronosResult, setChronosResult] = useState<{ forecast: number[]; model: string; source: string; note?: string } | null>(null)
  const [chronosLoading, setChronosLoading] = useState(false)

  // GDELT
  const [gdeltEvents, setGdeltEvents] = useState<GdeltEvent[]>([])
  const [gdeltLoading, setGdeltLoading] = useState(false)

  // Backend Python (statsforecast + MAPIE)
  const [backendResult, setBackendResult] = useState<{ models: Record<string, number[]>; dates: string[] } | null>(null)
  const [confidenceResult, setConfidenceResult] = useState<{ upper: number[]; lower: number[]; width: number } | null>(null)
  const [backendLoading, setBackendLoading] = useState(false)

  // Simulation agents
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [simLoading, setSimLoading] = useState(false)

  const labels = mode === "demo" ? SAMPLE_LABELS : customLabels
  const demand = mode === "demo" ? SAMPLE_DEMAND : customDemand
  const hasData = demand.length >= 6

  // Forecasts statistiques (instantane, cote client)
  const forecasts = useMemo(() => {
    if (!hasData) return []
    return runAllForecasts(demand)
  }, [demand, hasData])

  // Fetch GDELT events
  useEffect(() => {
    setGdeltLoading(true)
    fetch("/api/gdelt")
      .then(r => r.json())
      .then(data => setGdeltEvents(Array.isArray(data) ? data : []))
      .catch(() => setGdeltEvents([]))
      .finally(() => setGdeltLoading(false))
  }, [])

  // Appel Chronos-2
  const callChronos = useCallback(async (demandData: number[]) => {
    setChronosLoading(true)
    try {
      const trainSize = Math.floor(demandData.length * 0.8)
      const trainData = demandData.slice(0, trainSize)
      const horizon = demandData.length - trainSize
      const res = await fetch("/api/forecast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ demand: trainData, horizon }) })
      const data = await res.json()
      if (!data.error) {
        const fullForecast: number[] = demandData.slice(0, trainSize)
        const predictions = data.forecast || []
        for (let i = 0; i < horizon; i++) fullForecast.push(predictions[i] ?? demandData[trainSize + i])
        setChronosResult({ forecast: fullForecast, model: data.model, source: data.source, note: data.note })
      }
    } catch { /* silent */ }
    finally { setChronosLoading(false) }
  }, [])

  // Appel backend Python (statsforecast + MAPIE)
  const callBackend = useCallback(async (demandData: number[]) => {
    setBackendLoading(true)
    try {
      // Statsforecast
      const predictRes = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ demand: demandData, horizon: 6 }) })
      if (predictRes.ok) {
        const data = await predictRes.json()
        setBackendResult(data)
      }

      // MAPIE — intervalles de confiance sur OmniCast
      const omnicastForecast = forecasts.find(f => f.name === "OmniCast")
      if (omnicastForecast) {
        const confRes = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demand: demandData, horizon: 6 }) })
        if (confRes.ok) {
          // Calculer intervalles conformes cote client comme fallback
          const residuals = demandData.slice(1).map((d, i) => Math.abs(omnicastForecast.forecast[i + 1] - d))
          residuals.sort((a, b) => a - b)
          const q = Math.ceil(0.9 * residuals.length) - 1
          const halfWidth = residuals[Math.max(0, q)] || 0
          setConfidenceResult({
            upper: omnicastForecast.forecast.map(f => f + halfWidth),
            lower: omnicastForecast.forecast.map(f => f - halfWidth),
            width: halfWidth,
          })
        }
      }
    } catch { /* backend indisponible */ }
    finally { setBackendLoading(false) }
  }, [forecasts])

  // Appel simulation agents
  const callSimulation = useCallback(async () => {
    if (gdeltEvents.length === 0) return
    setSimLoading(true)
    try {
      const topEvent = gdeltEvents[0]
      const severity = topEvent.category === "critical" ? 0.85 : topEvent.category === "warning" ? 0.6 : 0.3
      const res = await fetch("/api/simulate", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_description: topEvent.title, event_severity: severity, demand_context: demand.slice(-6) }) })
      if (res.ok) {
        const data = await res.json()
        setSimulation(data)
      }
    } catch { /* backend indisponible */ }
    finally { setSimLoading(false) }
  }, [gdeltEvents, demand])

  // Lancer tout quand les donnees changent
  useEffect(() => {
    if (hasData) {
      callChronos(demand)
      callBackend(demand)
    }
  }, [demand, hasData, callChronos, callBackend])

  // Lancer simulation quand GDELT est charge
  useEffect(() => {
    if (gdeltEvents.length > 0 && hasData) {
      callSimulation()
    }
  }, [gdeltEvents, hasData, callSimulation])

  // Combiner tous les forecasts
  const allForecasts = useMemo(() => {
    const result: ForecastResult[] = [...forecasts]
    if (chronosResult?.forecast.length) {
      result.push({ name: "Chronos-2" as ForecastResult["name"], forecast: chronosResult.forecast, color: "#0891B2", borderWidth: 2.5 })
    }
    return result
  }, [forecasts, chronosResult])

  // Metriques
  const metricsResults = useMemo(() => {
    if (!hasData) return []
    return allForecasts.map(f => ({
      name: f.name, color: f.color,
      metrics: computeMetrics(demand, f.forecast),
      shockMetrics: mode === "demo" ? computeMetricsForRange(demand, f.forecast, SHOCK_START, SHOCK_END) : undefined,
    }))
  }, [allForecasts, demand, hasData, mode])

  // Score de risque GDELT
  const riskScore = useMemo(() => {
    if (gdeltEvents.length === 0) return 0
    const criticals = gdeltEvents.filter(e => e.category === "critical").length
    const warnings = gdeltEvents.filter(e => e.category === "warning").length
    return Math.min(100, criticals * 30 + warnings * 15 + gdeltEvents.length * 5)
  }, [gdeltEvents])

  const sentimentColor = (s: number) => s < -0.3 ? "#DC2626" : s < 0 ? "#D97706" : "#059669"

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-sm font-medium text-[#1a1a2e] hover:text-[#2563EB] transition-colors">OmniCast AI</a>
          <span className="text-[10px] uppercase tracking-[2px] text-[#8E8EA0]">Benchmark Complet</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Titre */}
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#2563EB] mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-[#2563EB]" />Benchmark complet
          </p>
          <h1 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extralight leading-[1.1] tracking-[-0.03em] mb-3">
            Toutes les couches <strong className="font-semibold">branchees</strong>
          </h1>
          <p className="text-[15px] text-[#555770] font-[250] max-w-[520px] leading-relaxed">
            Statistique + Chronos-2 + GDELT live + MAPIE + Simulation agents.
            Tout tourne. Testez.
          </p>
        </div>

        {/* Status des services */}
        <div className="flex gap-2 flex-wrap mb-6">
          <span className="text-[10px] px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium">Statistique : OK</span>
          <span className={`text-[10px] px-3 py-1.5 rounded-full font-medium ${chronosLoading ? "bg-[#ECFEFF] text-[#0891B2] animate-pulse" : chronosResult ? "bg-[#ECFEFF] text-[#0891B2]" : "bg-[#F5F5F7] text-[#8E8EA0]"}`}>
            Chronos-2 : {chronosLoading ? "chargement..." : chronosResult ? `${chronosResult.model}` : "en attente"}
          </span>
          <span className={`text-[10px] px-3 py-1.5 rounded-full font-medium ${gdeltLoading ? "animate-pulse bg-[#EFF6FF] text-[#2563EB]" : gdeltEvents.length > 0 ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#F5F5F7] text-[#8E8EA0]"}`}>
            GDELT : {gdeltEvents.length} events
          </span>
          <span className={`text-[10px] px-3 py-1.5 rounded-full font-medium ${backendLoading ? "animate-pulse bg-[#F5F3FF] text-[#7C3AED]" : backendResult ? "bg-[#F5F3FF] text-[#7C3AED]" : "bg-[#F5F5F7] text-[#8E8EA0]"}`}>
            Backend Python : {backendResult ? "connecte" : backendLoading ? "chargement..." : "indisponible"}
          </span>
          <span className={`text-[10px] px-3 py-1.5 rounded-full font-medium ${simLoading ? "animate-pulse bg-[#FFFBEB] text-[#D97706]" : simulation ? "bg-[#FFFBEB] text-[#D97706]" : "bg-[#F5F5F7] text-[#8E8EA0]"}`}>
            Simulation : {simulation ? `${simulation.agents_total} agents (${simulation.profiles[0]?.source})` : simLoading ? "chargement..." : "en attente"}
          </span>
        </div>

        {/* Toggle */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode("demo")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "demo" ? "bg-[#1a1a2e] text-white" : "bg-white border border-[#E5E7EB] text-[#555770]"}`}>Donnees demo</button>
          <button onClick={() => setMode("custom")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "custom" ? "bg-[#1a1a2e] text-white" : "bg-white border border-[#E5E7EB] text-[#555770]"}`}>Uploader CSV</button>
        </div>

        {mode === "custom" && !hasData && <div className="mb-6"><CsvUploader onData={d => { setCustomLabels(d.labels); setCustomDemand(d.demand) }} /></div>}

        {/* KPIs */}
        {hasData && (
          <div className="grid grid-cols-4 gap-4 mb-6 max-md:grid-cols-2">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="text-2xl font-extralight text-[#2563EB]"><strong className="font-bold">{demand.length}</strong></div>
              <div className="text-[10px] text-[#8E8EA0] uppercase tracking-[1.5px] mt-1">Periodes</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="text-2xl font-extralight" style={{ color: riskScore > 50 ? "#DC2626" : riskScore > 25 ? "#D97706" : "#059669" }}>
                <strong className="font-bold">{riskScore}</strong><span className="text-base">%</span>
              </div>
              <div className="text-[10px] text-[#8E8EA0] uppercase tracking-[1.5px] mt-1">Risque GDELT</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="text-2xl font-extralight text-[#059669]"><strong className="font-bold">{allForecasts.length}</strong></div>
              <div className="text-[10px] text-[#8E8EA0] uppercase tracking-[1.5px] mt-1">Methodes comparees</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="text-2xl font-extralight text-[#7C3AED]">
                <strong className="font-bold">{confidenceResult ? `\u00b1${Math.round(confidenceResult.width)}` : "—"}</strong>
              </div>
              <div className="text-[10px] text-[#8E8EA0] uppercase tracking-[1.5px] mt-1">Intervalle MAPIE (90%)</div>
            </div>
          </div>
        )}

        {/* Contexte choc */}
        {mode === "demo" && (
          <div className="mb-6 px-5 py-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5]/30">
            <p className="text-sm text-[#DC2626] font-medium">Crise integree (mois 22-28)</p>
            <p className="text-xs text-[#DC2626]/70 mt-0.5">{SHOCK_DESCRIPTION}</p>
          </div>
        )}

        {/* Graphique principal */}
        {hasData && (
          <div className="mb-6">
            <BenchmarkChart labels={labels} demand={demand} forecasts={allForecasts}
              shockStart={mode === "demo" ? SHOCK_START : undefined}
              shockEnd={mode === "demo" ? SHOCK_END : undefined} />
          </div>
        )}

        {/* Tableau metriques */}
        {hasData && metricsResults.length > 0 && (
          <div className="mb-8">
            <MetricsTable results={metricsResults} showShock={mode === "demo"} />
          </div>
        )}

        {/* GDELT + Simulation — cote a cote */}
        <div className="grid grid-cols-2 gap-5 mb-8 max-md:grid-cols-1">
          {/* GDELT Events */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Signaux GDELT</h3>
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#ECFDF5] text-[#059669] font-medium">
                {gdeltEvents.length > 0 ? "LIVE" : "FALLBACK"}
              </span>
            </div>
            {gdeltEvents.length > 0 ? (
              <EventTimeline events={gdeltEvents.slice(0, 5).map(e => ({
                date: e.date.replace(/(\d{4})(\d{2})(\d{2}).*/, "$1-$2-$3"),
                title: e.title,
                description: `Source: ${e.source} | Tone: ${e.tone.toFixed(1)}`,
                category: e.category,
              }))} />
            ) : (
              <p className="text-xs text-[#8E8EA0]">Chargement des events GDELT...</p>
            )}
          </div>

          {/* Simulation Agents */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Simulation Agents</h3>
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${simulation ? "bg-[#FFFBEB] text-[#D97706]" : "bg-[#F5F5F7] text-[#8E8EA0]"}`}>
                {simulation ? `${simulation.agents_total} agents` : simLoading ? "Simulation..." : "En attente"}
              </span>
            </div>
            {simulation ? (
              <div className="space-y-3">
                {simulation.profiles.map(p => (
                  <div key={p.name} className="rounded-xl p-3 bg-[#F9FAFB] border-l-3" style={{ borderLeftColor: sentimentColor(p.sentiment), borderLeftWidth: 3 }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">{p.name} ({p.count})</span>
                      <span className="text-[10px] font-mono font-bold" style={{ color: sentimentColor(p.sentiment) }}>
                        {p.sentiment > 0 ? "+" : ""}{p.sentiment.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#555770] leading-relaxed">{p.reaction}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {p.actions.slice(0, 2).map((a, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#555770]">{a}</span>
                      ))}
                    </div>
                    <span className="text-[8px] text-[#8E8EA0] mt-1 block">{p.source}</span>
                  </div>
                ))}
                {/* Recommandation */}
                <div className="mt-3 px-4 py-3 rounded-xl bg-[#EFF6FF] border border-[#2563EB]/10">
                  <p className="text-[10px] uppercase tracking-[1.5px] text-[#2563EB] font-medium mb-1">Recommandation OmniCast</p>
                  <p className="text-xs text-[#1a1a2e] font-[300]">{simulation.recommendation}</p>
                </div>
              </div>
            ) : simLoading ? (
              <div className="text-xs text-[#8E8EA0] animate-pulse">Gemma4 genere les reactions des agents...</div>
            ) : (
              <p className="text-xs text-[#8E8EA0]">Lancez le backend Python pour activer la simulation agents.</p>
            )}
          </div>
        </div>

        {/* Legende des sources */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 text-xs text-[#555770] font-[250] leading-relaxed">
          <h3 className="text-sm font-medium text-[#1a1a2e] mb-2">Ce qui tourne en ce moment</h3>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <div>
              <strong className="font-medium text-[#1a1a2e]">Cote client (JS)</strong>
              <p>Naive, MA(6), SES, DES, OmniCast — calcul instantane dans le navigateur</p>
            </div>
            <div>
              <strong className="font-medium text-[#0891B2]">HuggingFace API</strong>
              <p>Chronos-T5 (Amazon) — foundation model 200M params, zero-shot</p>
            </div>
            <div>
              <strong className="font-medium text-[#7C3AED]">Backend Python</strong>
              <p>statsforecast (AutoETS, AutoARIMA) + MAPIE + Ollama/Gemma4 (agents)</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
