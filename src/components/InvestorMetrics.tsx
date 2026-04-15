"use client"


const metrics = [
  { value: "47", unit: "Md$", label: "TAM 2028", sub: "Predictive Analytics", color: "#059669" },
  { value: "100", unit: "%", label: "Open-Source", sub: "Zero lock-in vendor", color: "#2563EB" },
  { value: "x3.2", unit: "", label: "ROI moyen", sub: "Sur 12 mois (simule)", color: "#D97706" },
  { value: "6", unit: " sem.", label: "Time-to-Value", sub: "Integration complete", color: "#7C3AED" },
]

export default function InvestorMetrics() {

  return (
    <section className="py-28" id="invest">
      <div className="max-w-[1280px] mx-auto px-8">
        <p className="text-[.7rem] font-medium uppercase tracking-[3px] text-[#2563EB] mb-4 flex items-center gap-2.5">
          <span className="w-6 h-px bg-[#2563EB]" />
          Investisseur
        </p>
        <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.15] tracking-[-0.03em] mb-3">
          Le marche.
          <br />
          <strong className="font-semibold">L&apos;opportunite.</strong>
        </h2>
        <p className="text-[#555770] text-[1.05rem] font-[250] mb-14 max-w-[560px] leading-relaxed">
          Predictive analytics, un marche de 47Md$ en 2028. Une stack 100%
          open-source. Zero lock-in.
        </p>

        <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="metric-card bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div
                className="text-[2.5rem] font-extralight tracking-[-0.03em] leading-none"
                style={{ color: m.color }}
              >
                <strong className="font-bold">{m.value}</strong>
                {m.unit}
              </div>
              <div className="text-[.65rem] text-[#8E8EA0] uppercase tracking-[2px] mt-2 font-normal">
                {m.label}
              </div>
              <div className="text-[.75rem] text-[#555770] mt-1 font-light">
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
