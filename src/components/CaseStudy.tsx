"use client"


const etapes = [
  {
    num: "01",
    titre: "Detection",
    couleur: "var(--cyan)",
    couleurBg: "var(--cyan-bg)",
    description:
      "WorldMonitor detecte collision via flux AIS. Alerte en 4 minutes.",
    detail: "Signaux temps reel",
  },
  {
    num: "02",
    titre: "Quantification",
    couleur: "var(--accent)",
    couleurBg: "var(--accent-light)",
    description:
      "Chronos-2 recalcule en zero-shot. -12% revenue Q3.",
    detail: "Modele quantitatif",
  },
  {
    num: "03",
    titre: "Simulation",
    couleur: "var(--orange)",
    couleurBg: "var(--orange-bg)",
    description:
      "MiroFish : 71% fournisseurs augmentent prix.",
    detail: "Agents LLM",
  },
  {
    num: "04",
    titre: "Decision",
    couleur: "var(--green)",
    couleurBg: "var(--green-bg)",
    description:
      "Stock tampon 3 semaines execute. Economies : 1.2M\u20AC.",
    detail: "Action automatisee",
  },
]

export function CaseStudy() {

  return (
    <section
     
      className="w-full max-w-[1280px] mx-auto px-6 py-32"
    >
      {/* Titre de section */}
      <div className="mb-16">
        <p
          className="text-xs tracking-[0.2em] uppercase mb-4"
          style={{ color: "var(--text3)" }}
        >
          Cas concret
        </p>
        <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 200 }}>
          Crise du{" "}
          <strong className="font-medium" style={{ fontWeight: 500 }}>
            Canal de Suez
          </strong>
        </h2>
        <p className="mt-4 text-lg max-w-xl" style={{ color: "var(--text2)" }}>
          Comment OmniCast a permis d'anticiper et mitiger l'impact
          d'une perturbation majeure de la supply chain.
        </p>
      </div>

      {/* Timeline horizontale — trait connecteur (desktop) */}
      <div className="relative">
        {/* Ligne horizontale derriere les cartes */}
        <div
          className="hidden lg:block absolute top-10 left-[calc(12.5%)] right-[calc(12.5%)] h-px"
          style={{ background: "var(--border)" }}
        />

        {/* Grille des 4 etapes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {etapes.map((etape) => (
            <div
              key={etape.num}
              className="group relative"
            >
              {/* Badge numero */}
              <div className="flex justify-center mb-6">
                <span
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-medium"
                  style={{
                    background: etape.couleurBg,
                    color: etape.couleur,
                    border: `1px solid ${etape.couleur}20`,
                  }}
                >
                  {etape.num}
                </span>
              </div>

              {/* Carte */}
              <div
                className="rounded-2xl border p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default"
                style={{
                  borderColor: "var(--border)",
                  background: "#fff",
                }}
              >
                {/* Titre */}
                <h3
                  className="text-lg mb-3 tracking-tight"
                  style={{ fontWeight: 400 }}
                >
                  {etape.titre}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: "var(--text2)" }}
                >
                  {etape.description}
                </p>

                {/* Detail / sous-label */}
                <span
                  className="inline-block text-[10px] font-mono tracking-wider px-3 py-1.5 rounded-full"
                  style={{
                    color: etape.couleur,
                    background: etape.couleurBg,
                  }}
                >
                  {etape.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
