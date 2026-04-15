"use client"


const couches = [
  {
    num: "01",
    titre: "Signaux Temps Reel",
    icone: "\uD83C\uDF10",
    couleur: "var(--cyan)",
    couleurBg: "var(--cyan-bg)",
    tag: "GDELT + WORLDMONITOR",
    description:
      "Collecte continue de flux geopolitiques, economiques et mediatiques a l'echelle mondiale.",
  },
  {
    num: "02",
    titre: "Modele Quantitatif",
    icone: "\uD83D\uDCC8",
    couleur: "var(--accent)",
    couleurBg: "var(--accent-light)",
    tag: "CHRONOS-2 + SUNDIAL",
    description:
      "Foundation models zero-shot pour la prediction de series temporelles sans entrainement.",
  },
  {
    num: "03",
    titre: "Simulation Agents",
    icone: "\uD83E\uDD16",
    couleur: "var(--orange)",
    couleurBg: "var(--orange-bg)",
    tag: "MIROFISH",
    description:
      "Essaim d'agents LLM simulant les reactions de marche et les cascades de decisions.",
  },
  {
    num: "04",
    titre: "Prediction Events",
    icone: "\uD83C\uDFAF",
    couleur: "var(--purple)",
    couleurBg: "var(--purple-bg)",
    tag: "OPENFORECASTER",
    description:
      "Marches predictifs calibres sur donnees historiques pour probabiliser les scenarios.",
  },
]

export function ArchFlow() {

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
          Architecture
        </p>
        <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 200 }}>
          Architecture{" "}
          <strong className="font-medium" style={{ fontWeight: 500 }}>
            Multi-Couches
          </strong>
        </h2>
        <p className="mt-4 text-lg max-w-xl" style={{ color: "var(--text2)" }}>
          Quatre couches independantes fusionnees par inference bayesienne
          pour un score de confiance agrege.
        </p>
      </div>

      {/* Grille des 4 couches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {couches.map((couche, i) => (
          <div key={couche.num} className="relative">
            <div
              className="group rounded-2xl border p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default"
              style={{
                borderColor: "var(--border)",
                background: "#fff",
              }}
            >
              {/* Numero + Icone */}
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-xs font-mono tracking-wider"
                  style={{ color: "var(--text3)" }}
                >
                  COUCHE {couche.num}
                </span>
                <span className="text-2xl">{couche.icone}</span>
              </div>

              {/* Titre */}
              <h3
                className="text-lg mb-2 tracking-tight"
                style={{ fontWeight: 400 }}
              >
                {couche.titre}
              </h3>

              {/* Description */}
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--text2)" }}
              >
                {couche.description}
              </p>

              {/* Tag */}
              <span
                className="inline-block text-[10px] font-mono tracking-wider px-3 py-1.5 rounded-full"
                style={{
                  color: couche.couleur,
                  background: couche.couleurBg,
                }}
              >
                {couche.tag}
              </span>
            </div>

            {/* Fleche entre les cartes (desktop uniquement) */}
            {i < couches.length - 1 && (
              <span
                className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full text-xs"
                style={{
                  color: "var(--text3)",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                }}
                aria-hidden="true"
              >
                &rarr;
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Score de confiance agrege */}
      <div
        className="mt-12 rounded-2xl p-8 md:p-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #0891B2 50%, #2563EB 100%)",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p
              className="text-xs tracking-[0.2em] uppercase mb-2"
              style={{ color: "rgba(255,255,255,.6)" }}
            >
              Score de confiance agrege
            </p>
            <p
              className="text-white tracking-tight"
              style={{ fontSize: "4rem", fontWeight: 200, lineHeight: 1 }}
            >
              <strong style={{ fontWeight: 500 }}>87</strong>.3%
            </p>
          </div>
          <div
            className="max-w-md text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,.8)" }}
          >
            Fusion bayesienne des quatre couches. Le score integre la
            coherence inter-modeles, la fraicheur des signaux et la
            calibration historique. Recommandation :{" "}
            <strong style={{ color: "#fff", fontWeight: 400 }}>
              executer le plan de couverture avec ajustement dynamique
            </strong>
            .
          </div>
        </div>

        {/* Motif decoratif subtil */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>
    </section>
  )
}
