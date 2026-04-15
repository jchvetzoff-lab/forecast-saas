"use client"

import dynamic from "next/dynamic"

const HeroGlobe = dynamic(() => import("@/components/HeroGlobe"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
})

export default function Hero() {
  return (
    <section className="min-h-[100svh] flex items-center relative overflow-hidden bg-[#FAFAFA]">
      {/* Globe 3D */}
      <div className="absolute top-[10%] right-[-5%] w-[45%] h-[80%] opacity-35 pointer-events-none max-lg:w-[60%] max-lg:right-[-10%] max-lg:opacity-15 max-md:hidden">
        <HeroGlobe />
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 relative z-10 py-20">
        <div className="max-w-[580px]">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF6FF] text-[11px] font-medium text-[#2563EB] mb-5 border border-[#2563EB]/10 tracking-wide opacity-0 animate-[fadeUp_0.7s_0.1s_ease-out_forwards]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            SaaS B2B — Supply Chain Intelligence
          </div>

          {/* Titre */}
          <h1
            className="text-[clamp(2rem,4.5vw,3.6rem)] font-extralight leading-[1.1] mb-4 tracking-[-0.035em] text-[#1a1a2e] opacity-0 animate-[fadeUp_0.8s_0.2s_ease-out_forwards]"
          >
            Votre supply chain
            <br />
            voit venir les crises
            <br />
            <strong className="font-semibold bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              avant qu&apos;elles arrivent
            </strong>
          </h1>

          {/* Sous-titre */}
          <p
            className="text-[15px] md:text-base text-[#555770] max-w-[460px] mb-8 font-[250] leading-[1.6] opacity-0 animate-[fadeUp_0.8s_0.35s_ease-out_forwards]"
          >
            Sanctions, blocages maritimes, typhons, hausses de prix fournisseurs
            — detectes en minutes, quantifies automatiquement, simules
            avant impact. Un score de confiance, une recommandation.
          </p>

          {/* Metriques */}
          <div className="flex gap-7 md:gap-9 flex-wrap opacity-0 animate-[fadeUp_0.8s_0.5s_ease-out_forwards]">
            {[
              { val: "-51", unit: "%", label: "Erreur forecast en crise" },
              { val: "4", unit: "min", label: "Detection vs 12h presse" },
              { val: "1.2", unit: "M\u20ac", label: "Economies / incident" },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-[1.8rem] md:text-[2.2rem] font-extralight tracking-[-0.03em] leading-none">
                  <span className="font-semibold bg-gradient-to-r from-[#2563EB] to-[#0891B2] bg-clip-text text-transparent">
                    {m.val}
                  </span>
                  <span className="text-[1.2rem] md:text-[1.4rem] ml-0.5">{m.unit}</span>
                </div>
                <div className="text-[10px] md:text-[11px] text-[#8E8EA0] uppercase tracking-[1.5px] mt-1 font-normal">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 opacity-0 animate-[fadeUp_0.6s_0.8s_ease-out_forwards]">
        <span className="text-[9px] uppercase tracking-[3px] text-[#B0B0C0]">
          Scroll
        </span>
        <div className="w-px h-7 bg-[#D1D5DB] relative overflow-hidden">
          <div className="absolute top-[-50%] left-0 w-full h-1/2 bg-[#2563EB] animate-[scrollDown_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  )
}
