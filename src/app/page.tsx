import Marquee from "@/components/Marquee"
import { ArchFlow } from "@/components/ArchFlow"
import { AlgoBlock } from "@/components/AlgoBlock"
import { ComparisonTable } from "@/components/ComparisonTable"
import { CaseStudy } from "@/components/CaseStudy"
import InvestorMetrics from "@/components/InvestorMetrics"
import Hero from "@/components/Hero"
import DashboardPreview from "@/components/DashboardPreview"

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />

      {/* Architecture */}
      <section className="py-28" id="architecture">
        <div className="max-w-[1280px] mx-auto px-8">
          <p className="text-[.7rem] font-medium uppercase tracking-[3px] text-[#2563EB] mb-4 flex items-center gap-2.5">
            <span className="w-6 h-px bg-[#2563EB]" />
            Architecture
          </p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.15] tracking-[-0.03em] mb-3">
            Six couches.
            <br />
            <strong className="font-semibold">Zero angle mort.</strong>
          </h2>
          <p className="text-[#555770] text-[1.05rem] font-[250] mb-14 max-w-[560px] leading-relaxed">
            Chaque couche couvre la faiblesse de la precedente. Le tout est
            superieur a la somme des parties.
          </p>
          <ArchFlow />
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent max-w-[800px] mx-auto" />

      {/* Algorithme */}
      <section className="py-28" id="algo">
        <div className="max-w-[1280px] mx-auto px-8">
          <p className="text-[.7rem] font-medium uppercase tracking-[3px] text-[#2563EB] mb-4 flex items-center gap-2.5">
            <span className="w-6 h-px bg-[#2563EB]" />
            Algorithme
          </p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.15] tracking-[-0.03em] mb-3">
            Fusion bayesienne
            <br />
            <strong className="font-semibold">multi-couches</strong>
          </h2>
          <p className="text-[#555770] text-[1.05rem] font-[250] mb-14 max-w-[560px] leading-relaxed">
            Chaque couche a un poids dynamique calibre sur sa fiabilite
            historique.
          </p>
          <AlgoBlock />

          <div className="grid grid-cols-2 gap-5 mt-10 max-md:grid-cols-1">
            <ComparisonTable />
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent max-w-[800px] mx-auto" />

      {/* Dashboard preview */}
      <DashboardPreview />

      {/* Case Study */}
      <CaseStudy />

      <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent max-w-[800px] mx-auto" />

      {/* Investor */}
      <InvestorMetrics />

      {/* Footer */}
      <footer className="py-16 border-t border-[#E5E7EB] text-center">
        <div className="max-w-[1280px] mx-auto px-8">
          <p className="text-[#555770] font-normal text-sm mb-1">
            OmniCast AI
          </p>
          <p className="text-[#8E8EA0] text-[.75rem] font-light">
            Prototype de demonstration — Donnees fictives — Avril 2026
          </p>
          <p className="text-[#8E8EA0] text-[.65rem] font-light mt-2">
            Propulse par Chronos-2 (Amazon) &middot; Sundial (Tsinghua) &middot;
            MiroFish &middot; GDELT &middot; MAPIE &middot; DoWhy
          </p>
        </div>
      </footer>
    </main>
  )
}
