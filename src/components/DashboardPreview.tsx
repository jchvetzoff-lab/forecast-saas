"use client"

import KpiCard from "@/components/KpiCard"
import { ForecastChart } from "@/components/ForecastChart"
import { EventTimeline } from "@/components/EventTimeline"
import RiskGauge from "@/components/RiskGauge"

const kpis = [
  { value: "14.2M\u20ac", label: "Revenue prevu Q3", delta: "-12% vs forecast initial", deltaType: "down" as const, color: "#2563EB" },
  { value: "67%", label: "Risque Supply Chain", delta: "+23pts en 48h", deltaType: "down" as const, color: "#D97706" },
  { value: "87.3%", label: "Score OmniCast", delta: "Confiance elevee", deltaType: "up" as const, color: "#059669" },
  { value: "2 847", label: "Agents simules", delta: "3 profils actifs", deltaType: "neutral" as const, color: "#7C3AED" },
]

const events = [
  { date: "15 Avr 2026 — 06:42 UTC", title: "Blocage partiel Canal de Suez", description: "Collision porte-conteneurs. Trafic -40%. +18j delai composants asiatiques.", category: "critical" as const },
  { date: "12 Avr 2026 — 14:15 UTC", title: "Nouvelles sanctions US semi-conducteurs", description: "Extension a 3 fabricants. Fournisseur principal potentiellement impacte.", category: "warning" as const },
  { date: "08 Avr 2026 — 09:30 UTC", title: "Typhon Cat. 3 — Mer de Chine", description: "Port de Shenzhen menace. 23% du fret NordTech transite par ce hub.", category: "warning" as const },
  { date: "03 Avr 2026 — 11:00 UTC", title: "Signal faible : hausse commandes concurrents", description: "73% probabilite guerre des prix sous 60j (OpenForecaster).", category: "info" as const },
]

export default function DashboardPreview() {

  return (
    <section className="py-28" id="dashboard">
      <div className="max-w-[1280px] mx-auto px-8">
        <p className="text-[.7rem] font-medium uppercase tracking-[3px] text-[#2563EB] mb-4 flex items-center gap-2.5">
          <span className="w-6 h-px bg-[#2563EB]" />
          Demo Live
        </p>
        <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.15] tracking-[-0.03em] mb-3">
          NordTech Solutions
          <br />
          <strong className="font-semibold">Dashboard temps reel</strong>
        </h2>
        <p className="text-[#555770] text-[1.05rem] font-[250] mb-14 max-w-[560px] leading-relaxed">
          Importateur de composants electroniques — Donnees de demonstration
        </p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8 max-md:grid-cols-2">
          {kpis.map((k) => (
            <div key={k.label} className="">
              <KpiCard {...k} />
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-7 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[.9rem] font-medium">Forecast Revenue — ML Classique vs OmniCast</h3>
              <span className="px-3 py-1 rounded-full text-[.62rem] font-medium tracking-[.5px] bg-[#EFF6FF] text-[#2563EB]">
                12 mois
              </span>
            </div>
            <ForecastChart />
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-7 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[.9rem] font-medium">Risque Supply Chain</h3>
              <span className="px-3 py-1 rounded-full text-[.62rem] font-medium tracking-[.5px] bg-[#FFFBEB] text-[#D97706]">
                ELEVE
              </span>
            </div>
            <RiskGauge value={67} label="Suez + Sanctions semi-conducteurs" />
          </div>

          <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-7 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[.9rem] font-medium">Signaux Detectes</h3>
              <span className="px-3 py-1 rounded-full text-[.62rem] font-medium tracking-[.5px] bg-[#ECFDF5] text-[#059669]">
                TEMPS REEL
              </span>
            </div>
            <EventTimeline events={events} />
          </div>
        </div>
      </div>
    </section>
  )
}
